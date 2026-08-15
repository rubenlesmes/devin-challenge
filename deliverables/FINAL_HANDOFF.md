# Final Handoff — Fintech Internal-Tools Evaluation

One place to find everything. Produced by the Claude Code finalization session
(2026-08-15) on top of the Devin-built prototype.

## The recommendation (one sentence)

Keep the existing Power Apps footprint (no wholesale migration), and pilot
Devin-assisted custom development on one new engineering-owned internal tool —
feature-flag administration — measured against a true production bar before any
license decision is revisited.

## Deliverables map

| Deliverable | Path |
| --- | --- |
| Working application | repository root (`npm install && npm run db:reset && npm run dev`) |
| Demo script | `README.md` §F |
| Executive video (MP4, 4:34) | `deliverables/video/output/fintech-internal-tools-vp-engineering.mp4` (not committed — see rebuild note below) |
| Video SRT captions | `deliverables/video/public/captions/final.srt` |
| Video pipeline + README | `deliverables/video/` |
| Loom upload instructions | `deliverables/video/LOOM_UPLOAD_INSTRUCTIONS.md` |
| Key Decisions one-pager (md/html/pdf) | `deliverables/one-pager/key-decisions.{md,html,pdf}` |
| Evidence matrix | `deliverables/evidence-matrix.md` |
| External sources | `deliverables/sources.md` |
| Claims register (video) | `deliverables/video/content/claims-register.md` |
| Narration script (frozen) | `deliverables/video/content/narration-script.md` |
| Storyboard | `deliverables/video/content/storyboard.md` |
| Submission checklist | `deliverables/submission-checklist.md` |
| Finalization log (attribution) | `deliverables/FINALIZATION_LOG.md` |

## Rebuilding the video from a fresh checkout

```bash
# 1. App (repo root)
npm install && npm run db:reset && npm run build && npm start &

# 2. Video package
cd deliverables/video
npm install && npx playwright install chromium
npm run capture                 # re-captures the running app (optional; captures are committed)
npm run captions                # timeline + captions from the committed narration
npm run video:render && npm run video:validate
```

`npm run narration` is only needed to regenerate audio (requires `ELEVENLABS_API_KEY`
exported in the shell); the committed narration files render as-is.

## Validation status at handoff

- `npm run check` (lint, typecheck, 13/13 tests, production build): **pass**
- Browser flows (production server, Playwright, console monitored): **pass, 0 console errors**
- Media validation (`npm run video:validate`): **all checks pass** (4:34, 1080p30, H.264/AAC, yuv420p)
- One-pager validation (`node render-one-pager.mjs`): **pass, exactly 1 page**

## Honest limitations

- The prototype is not production-ready (README §J) — identity simulated, no SSO,
  app-layer-only audit immutability, no monitoring/DR, shadow database instead of
  source-of-truth integrations.
- The repository does not independently substantiate a specific end-to-end build-time
  claim for the original Devin implementation (see `evidence-matrix.md`, final row).
- The ~$250K/yr figure is the scenario input; genuinely avoidable spend depends on the
  license seat mix, which is the first recommended evidence-gathering step.
- Loom hosting was not available in the finalization environment; the video exists
  locally and the upload steps are documented.
