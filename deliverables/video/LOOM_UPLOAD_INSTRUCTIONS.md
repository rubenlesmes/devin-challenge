# Loom Upload Instructions

The Loom upload was **not** performed from this environment: no authenticated Loom
session (browser or API) was available to the finalization session, and uploading would
have required credentials that were not present. Nothing was uploaded; do not treat any
URL as existing until you create it.

## File to upload

- Path: `deliverables/video/output/fintech-internal-tools-vp-engineering.mp4`
- Validated: 274.1 s (4:34) · 1920×1080 · 30 fps · H.264 + AAC · yuv420p · 33.3 MB
- If the file is absent on a fresh checkout (rendered outputs are gitignored), rebuild it:
  `cd deliverables/video && npm install && npx playwright install chromium && npm run video:build`
  (requires `ELEVENLABS_API_KEY` only if narration files are regenerated; the committed
  narration under `public/narration/` renders as-is with
  `npm run captions && npm run video:render && npm run video:validate`).

## Steps

1. Sign in at https://www.loom.com.
2. Choose **Upload a video** and select the MP4 above.
3. Title: `Devin vs. Power Apps: Internal Tools Build-or-Buy Recommendation`
4. Description: paste from `content/loom-description.md`.
5. Set visibility to **link-only / restricted** — do not make it publicly discoverable,
   do not invite recipients.
6. Copy the share link into your submission. Per repository practice, do not commit the
   private URL to the repo.
