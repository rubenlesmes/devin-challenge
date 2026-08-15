# Executive Video — Production Pipeline

Reproducible pipeline for the 4:34 executive build-vs-buy video
(`output/fintech-internal-tools-vp-engineering.mp4`). Isolated npm package —
nothing here touches the application's dependency graph.

## Architecture

```
content/scene-manifest.json     ← FROZEN narration script (8 scenes) — single source of truth
        │
        ├─ scripts/capture-app.mjs        Playwright: resets the synthetic DB, drives the real app,
        │                                 produces screenshots (2×) + H.264 recordings + manifest
        │                                 → public/captures/
        ├─ scripts/generate-narration.mjs ElevenLabs TTS (with character-level timestamps), per scene,
        │                                 content-hash cached → public/narration/
        ├─ scripts/build-captions.mjs     Audio durations (ffprobe) → frame-accurate timeline;
        │                                 alignment → phrase captions → src/generated/*.json
        │                                 + public/captions/final.srt
        ├─ src/                           Remotion composition (1920×1080 @ 30 fps), 8 scenes,
        │                                 burned-in CaptionLayer, real app captures via AppCapture
        ├─ scripts/validate-media.mjs     ffprobe/ffmpeg checks: H.264/AAC, 1080p30, yuv420p,
        │                                 ≤300 s, decode integrity, faststart, SRT monotonicity
        └─ scripts/create-contact-sheet.mjs  30-frame grid for visual QA → output/contact-sheet.png
```

The **actual narration audio is the timing authority**: scene durations are measured with
ffprobe and written to `src/generated/timeline.json`; the composition and captions are
driven entirely by that file. Nothing is hard-coded to estimated durations.

## Commands

```bash
npm install                 # once; then: npx playwright install chromium
npm run capture             # requires the app running at localhost:3000 (npm start in repo root)
npm run narration           # requires ELEVENLABS_API_KEY exported; cached by content hash
npm run captions            # builds timeline + captions + final.srt from real audio
npm run video:studio        # interactive Remotion studio
npm run video:draft         # fast low-quality render (CRF 28)
npm run video:render        # final render (CRF 17, H.264/AAC, yuv420p, faststart)
npm run video:validate      # full media validation (exits non-zero on any failure)
npm run video:contact-sheet # 30-frame visual QA grid
npm run video:build         # capture → narration → captions → render → validate
```

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `ELEVENLABS_API_KEY` | for `narration` only | Export into the shell. Never committed, never printed, never written to any artifact. |
| `ELEVENLABS_VOICE_ID` | optional | Overrides the delivered default voice. If unset, the script uses the configured default and falls back to a professional premade voice; the choice is recorded in `public/narration/voice.json`. |
| `ELEVENLABS_MODEL_ID` | optional | Default `eleven_v3` (expressive; supports inline audio tags). |
| `ELEVENLABS_SEED` | optional | Default `42`; applied only to non-v3 models (v3 output is not seed-deterministic). |
| `ELEVENLABS_OUTPUT_FORMAT` | optional | Default `mp3_44100_128`. |

Voice used for the delivered narration: **Ellen (professional, voice_id
`BIvP0GN1cAtSRTxNHnWS`)**, model **`eleven_v3`** with inline audio tags for emotional
delivery (e.g. `[confident]`, `[serious]`, `[calm]` — see `ttsText` in
`content/scene-manifest.json`). Tags are performance directions only: the caption
builder strips them, so they never appear in captions or the SRT. See
`public/narration/voice.json` and per-scene `*.meta.json` (no secrets stored).

## Captions

- Character-level timestamps come from the ElevenLabs `with-timestamps` endpoint
  (no forced alignment needed).
- `build-captions.mjs` groups characters into ≤2-line phrase captions at punctuation
  boundaries, merges one-word flashes, prevents overlaps, and emits both the
  burn-in data (`src/generated/captions.json`) and `public/captions/final.srt`.

## Output locations

| Artifact | Path | Git status |
| --- | --- | --- |
| Final master (delivery copy) | `output/fintech-internal-tools-vp-engineering.mp4` | **not committed** (see `.gitignore`); rebuild with `npm run video:build` or request the file directly |
| Draft render | `output/draft.mp4` | not committed |
| Contact sheet | `output/contact-sheet.png` | not committed |
| SRT captions | `public/captions/final.srt` | committed |
| App captures + manifest | `public/captures/` | committed (all synthetic data) |
| Narration audio + alignment + metadata | `public/narration/` | committed (allows re-render without an ElevenLabs key) |

Delivered file (validated 2026-08-15): 282.2 s (4:42), 1920×1080, 30 fps, H.264 + AAC,
yuv420p, faststart, 33.6 MB, zero decode errors, 57 caption cues.

## Loom upload status

Not uploaded from this environment (no authenticated Loom session was available).
Exact manual steps: `LOOM_UPLOAD_INSTRUCTIONS.md`. Title/description to use:
`content/loom-description.md`.

## Known limitations

- The recordings are real application flows; pacing between narration and on-screen
  action is aligned by scene, not word-by-word.
- No background music by design (default per the production brief).
- `capture-app.mjs` expects a production server (`npm start`) at `localhost:3000`;
  the Next.js dev overlay would otherwise appear in captures.
