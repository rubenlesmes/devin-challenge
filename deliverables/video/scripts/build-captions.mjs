#!/usr/bin/env node
/**
 * Builds the video timeline and captions from the generated narration.
 *
 * Inputs:  public/narration/<scene>.mp3 + .alignment.json (character timing)
 * Outputs: src/generated/timeline.json   — per-scene frame offsets/durations
 *          src/generated/captions.json   — phrase captions with frame timing
 *          public/captions/final.srt     — standalone subtitle file
 *
 * The actual audio duration is the timing authority: scene durations are
 * measured with ffprobe, never hard-coded.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST = JSON.parse(readFileSync(path.join(ROOT, "content", "scene-manifest.json"), "utf8"));

const FPS = 30;
const LEAD_IN_S = 0.7; // silence before narration in each scene
const TAIL_S = 0.8; // pause after narration before next scene
const CLOSING_TAIL_S = 5.0; // hold the final card
const MAX_CHARS_PER_CAPTION = 84; // ~2 lines at our caption size

function audioDuration(file) {
  return parseFloat(
    execFileSync("ffprobe", ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", file])
      .toString()
      .trim(),
  );
}

/** Split alignment characters into phrase captions at punctuation/length boundaries. */
function phrasesFromAlignment(alignment) {
  const chars = alignment.characters;
  const starts = alignment.character_start_times_seconds;
  const ends = alignment.character_end_times_seconds;

  const phrases = [];
  let text = "";
  let phraseStart = null;

  const flush = (endTime) => {
    const trimmed = text.trim();
    if (trimmed.length > 0 && phraseStart !== null) {
      phrases.push({ text: trimmed, start: phraseStart, end: endTime });
    }
    text = "";
    phraseStart = null;
  };

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    // Skip ElevenLabs v3 audio-tag regions like "[confident]" — they are
    // performance directions, not spoken words, and must not appear in captions.
    if (ch === "[") {
      while (i < chars.length && chars[i] !== "]") i++;
      continue;
    }
    if (phraseStart === null && ch.trim() !== "") phraseStart = starts[i];
    text += ch;
    const isBreakPunct = /[.!?]/.test(ch);
    const isSoftPunct = /[,;:—]/.test(ch);
    const tooLong = text.trim().length >= MAX_CHARS_PER_CAPTION;
    if (isBreakPunct || (isSoftPunct && tooLong) || (tooLong && ch === " ")) {
      flush(ends[i]);
    }
  }
  flush(ends[chars.length - 1] ?? 0);

  // merge one-word flashes into the previous caption
  const merged = [];
  for (const p of phrases) {
    const words = p.text.split(/\s+/).length;
    const dur = p.end - p.start;
    const prev = merged[merged.length - 1];
    if (prev && (words <= 2 || dur < 0.7) && (prev.text + " " + p.text).length <= MAX_CHARS_PER_CAPTION + 20) {
      prev.text = `${prev.text} ${p.text}`;
      prev.end = p.end;
    } else {
      merged.push({ ...p });
    }
  }
  return merged;
}

function toSrtTime(seconds) {
  const ms = Math.max(0, Math.round(seconds * 1000));
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  const mmm = String(ms % 1000).padStart(3, "0");
  return `${h}:${m}:${s},${mmm}`;
}

function main() {
  const genDir = path.join(ROOT, "src", "generated");
  mkdirSync(genDir, { recursive: true });
  mkdirSync(path.join(ROOT, "public", "captions"), { recursive: true });

  const timeline = { fps: FPS, scenes: [] };
  const allCaptions = [];
  let cursorFrames = 0;

  const sceneCount = MANIFEST.scenes.length;
  MANIFEST.scenes.forEach((scene, idx) => {
    const base = path.join(ROOT, "public", "narration", scene.id);
    const dur = audioDuration(`${base}.mp3`);
    const alignment = JSON.parse(readFileSync(`${base}.alignment.json`, "utf8"));
    const tail = idx === sceneCount - 1 ? CLOSING_TAIL_S : TAIL_S;

    const leadFrames = Math.round(LEAD_IN_S * FPS);
    const audioFrames = Math.ceil(dur * FPS);
    const tailFrames = Math.round(tail * FPS);
    const sceneFrames = leadFrames + audioFrames + tailFrames;

    timeline.scenes.push({
      id: scene.id,
      title: scene.title,
      from: cursorFrames,
      durationInFrames: sceneFrames,
      audioStartInScene: leadFrames,
      audioDurationSeconds: Math.round(dur * 1000) / 1000,
    });

    for (const p of phrasesFromAlignment(alignment)) {
      allCaptions.push({
        sceneId: scene.id,
        text: p.text,
        startFrame: cursorFrames + leadFrames + Math.round(p.start * FPS),
        endFrame: cursorFrames + leadFrames + Math.round(p.end * FPS) + Math.round(0.18 * FPS),
        startSeconds: (cursorFrames + leadFrames) / FPS + p.start,
        endSeconds: (cursorFrames + leadFrames) / FPS + p.end + 0.18,
      });
    }
    cursorFrames += sceneFrames;
  });

  // prevent caption overlap after the small end-padding
  for (let i = 0; i < allCaptions.length - 1; i++) {
    if (allCaptions[i].endFrame > allCaptions[i + 1].startFrame) {
      allCaptions[i].endFrame = allCaptions[i + 1].startFrame - 1;
      allCaptions[i].endSeconds = allCaptions[i].endFrame / FPS;
    }
  }

  timeline.totalFrames = cursorFrames;
  timeline.totalSeconds = Math.round((cursorFrames / FPS) * 100) / 100;

  writeFileSync(path.join(genDir, "timeline.json"), JSON.stringify(timeline, null, 2));
  writeFileSync(path.join(genDir, "captions.json"), JSON.stringify(allCaptions, null, 2));

  // Real repository evidence for the Devin scene (from captured test output).
  const testOutPath = path.join(ROOT, "public", "captures", "test-output.txt");
  let testSummary = "npm test — see tests/ in the repository";
  if (existsSync(testOutPath)) {
    const out = readFileSync(testOutPath, "utf8");
    const files = out.match(/Test Files\s+(\d+) passed \((\d+)\)/);
    const tests = out.match(/Tests\s+(\d+) passed \((\d+)\)/);
    if (files && tests) {
      testSummary = `npm test → ${tests[1]}/${tests[2]} tests passing across ${files[2]} files (Vitest)`;
    }
  }
  writeFileSync(path.join(genDir, "evidence.json"), JSON.stringify({ testSummary }, null, 2));

  const srt = allCaptions
    .map((c, i) => `${i + 1}\n${toSrtTime(c.startSeconds)} --> ${toSrtTime(c.endSeconds)}\n${c.text}\n`)
    .join("\n");
  writeFileSync(path.join(ROOT, "public", "captions", "final.srt"), srt);

  console.log(
    `✓ Timeline: ${timeline.totalFrames} frames (${timeline.totalSeconds}s) across ${timeline.scenes.length} scenes; ${allCaptions.length} captions.`,
  );
  if (timeline.totalSeconds > 300) {
    console.error(`✗ Total duration ${timeline.totalSeconds}s exceeds the 300s limit — shorten the script.`);
    process.exit(1);
  }
}

main();
