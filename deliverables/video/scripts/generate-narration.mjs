#!/usr/bin/env node
/**
 * ElevenLabs narration generation, one file per scene.
 *
 * - Reads scene text from content/scene-manifest.json.
 * - Uses the `with-timestamps` endpoint so character-level alignment is saved
 *   next to each audio file (used later for captions).
 * - Caches by content hash (text + voice + model + settings + format):
 *   unchanged scenes are skipped unless --force is passed.
 * - Requires ELEVENLABS_API_KEY in the environment. Optional:
 *   ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL_ID, ELEVENLABS_SEED,
 *   ELEVENLABS_OUTPUT_FORMAT.
 * - The API key is never printed, never written to any output file, and the
 *   saved metadata contains only non-secret fields.
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const NARRATION_DIR = path.join(ROOT, "public", "narration");
const MANIFEST = JSON.parse(readFileSync(path.join(ROOT, "content", "scene-manifest.json"), "utf8"));

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("ELEVENLABS_API_KEY is not set. Export it into the environment (do not paste it into files).");
  process.exit(1);
}
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_v3";
const OUTPUT_FORMAT = process.env.ELEVENLABS_OUTPUT_FORMAT ?? "mp3_44100_128";
const SEED = Number(process.env.ELEVENLABS_SEED ?? "42");
const FORCE = process.argv.includes("--force");
const IS_V3 = MODEL_ID.startsWith("eleven_v3");
// eleven_v3 supports a restricted settings surface (stability 0.0 / 0.5 / 1.0).
const VOICE_SETTINGS = IS_V3
  ? { stability: 0.5, similarity_boost: 0.75 }
  : { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true };

/** Delivered narration voice (user-selected). ELEVENLABS_VOICE_ID overrides. */
const DEFAULT_VOICE_ID = "BIvP0GN1cAtSRTxNHnWS";

/** Fallback professional narration voices (ElevenLabs premade), in order. */
const PREFERRED_VOICES = ["Brian", "Eric", "Daniel", "George", "Adam", "Matilda", "Sarah"];

async function voiceName(voiceId) {
  const res = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
    headers: { "xi-api-key": API_KEY },
  });
  if (!res.ok) return null;
  const v = await res.json();
  return v.name ?? null;
}

async function resolveVoice() {
  if (process.env.ELEVENLABS_VOICE_ID) {
    const name = await voiceName(process.env.ELEVENLABS_VOICE_ID);
    return { voiceId: process.env.ELEVENLABS_VOICE_ID, voiceName: name ?? "(from ELEVENLABS_VOICE_ID)" };
  }
  const defaultName = await voiceName(DEFAULT_VOICE_ID);
  if (defaultName) return { voiceId: DEFAULT_VOICE_ID, voiceName: defaultName };

  const res = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": API_KEY } });
  if (!res.ok) throw new Error(`Voice listing failed: ${res.status} ${await res.text()}`);
  const { voices } = await res.json();
  for (const name of PREFERRED_VOICES) {
    // Account voice names may include a description suffix, e.g. "Brian - Deep, Resonant".
    const v = voices.find((x) => x.name === name || x.name.split(" - ")[0].trim() === name);
    if (v) return { voiceId: v.voice_id, voiceName: v.name };
  }
  if (voices.length === 0) throw new Error("No voices available on this ElevenLabs account.");
  return { voiceId: voices[0].voice_id, voiceName: voices[0].name };
}

function hashFor(text, voiceId) {
  return createHash("sha256")
    .update(JSON.stringify({ text, voiceId, MODEL_ID, VOICE_SETTINGS, SEED, OUTPUT_FORMAT }))
    .digest("hex");
}

async function generateScene(scene, index, scenes, voiceId, sceneVoiceName) {
  const id = scene.id;
  const base = path.join(NARRATION_DIR, id);
  // ttsText may carry v3 audio tags for emotional delivery; `narration` is the
  // clean text used for captions and documents.
  const ttsText = scene.ttsText ?? scene.narration;
  const hash = hashFor(ttsText, voiceId);
  const hashFile = `${base}.hash`;
  if (
    !FORCE &&
    existsSync(hashFile) &&
    readFileSync(hashFile, "utf8") === hash &&
    existsSync(`${base}.mp3`) &&
    existsSync(`${base}.alignment.json`)
  ) {
    console.log(`↷ ${id}: unchanged, skipping (cached).`);
    return;
  }

  const body = {
    text: ttsText,
    model_id: MODEL_ID,
    voice_settings: VOICE_SETTINGS,
    // eleven_v3 does not support request stitching or deterministic seeds.
    ...(IS_V3
      ? {}
      : {
          seed: SEED,
          previous_text: index > 0 ? (scenes[index - 1].ttsText ?? scenes[index - 1].narration) : undefined,
          next_text:
            index < scenes.length - 1 ? (scenes[index + 1].ttsText ?? scenes[index + 1].narration) : undefined,
        }),
  };
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=${OUTPUT_FORMAT}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`TTS failed for ${id}: ${res.status} ${await res.text()}`);
  const data = await res.json();

  writeFileSync(`${base}.mp3`, Buffer.from(data.audio_base64, "base64"));
  writeFileSync(
    `${base}.alignment.json`,
    JSON.stringify(data.normalized_alignment ?? data.alignment, null, 2),
  );
  writeFileSync(
    `${base}.meta.json`,
    JSON.stringify(
      {
        sceneId: id,
        voiceName: sceneVoiceName,
        modelId: MODEL_ID,
        outputFormat: OUTPUT_FORMAT,
        seed: IS_V3 ? null : SEED,
        voiceSettings: VOICE_SETTINGS,
        usesAudioTags: ttsText !== scene.narration,
        generatedAt: new Date().toISOString(),
        characters: ttsText.length,
      },
      null,
      2,
    ),
  );
  writeFileSync(hashFile, hash);
  console.log(`✓ ${id}: narration generated (${scene.narration.split(/\s+/).length} words${ttsText !== scene.narration ? ", with audio tags" : ""}).`);
}

async function main() {
  mkdirSync(NARRATION_DIR, { recursive: true });
  const { voiceId, voiceName } = await resolveVoice();
  console.log(`Voice: ${voiceName} [${voiceId}], model: ${MODEL_ID}, format: ${OUTPUT_FORMAT}, seed: ${SEED}`);
  writeFileSync(
    path.join(NARRATION_DIR, "voice.json"),
    JSON.stringify({ voiceId, voiceName, modelId: MODEL_ID, outputFormat: OUTPUT_FORMAT, seed: SEED }, null, 2),
  );
  const scenes = MANIFEST.scenes;
  for (let i = 0; i < scenes.length; i++) {
    await generateScene(scenes[i], i, scenes, voiceId, voiceName);
  }
  console.log("✓ Narration complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
