# Final Submission Checklist

Verified 2026-08-15 during the Claude Code finalization session. Unchecked items are
genuinely open and explained.

## Repository

- [x] Clean setup documented (`README.md` §D; commands executed as written)
- [x] Application runs (dev and production server verified in the browser)
- [x] Database reset works (`npm run db:reset`; safe with a running server after Fix 1)
- [x] Tests pass (13/13 across 5 files — `npm test`)
- [x] Build passes (`npm run build`; `npm run check` green end-to-end)
- [x] Synthetic data only (`.test` domains, invented people/amounts; UI banner states it)
- [x] No secrets (`.env` holds only the local SQLite path; ElevenLabs key env-only, never written anywhere)
- [x] README accurate (test counts corrected during finalization; commands verified)
- [x] Production limitations explicit (README §J, §K; video scene 7; one-pager)

## Video

- [x] Actual MP4 exists (`deliverables/video/output/fintech-internal-tools-vp-engineering.mp4`)
- [x] Duration ≤ 5:00 (4:34.1 — validated programmatically)
- [x] Audio exists (AAC stream; no dead air ≥ 6 s)
- [x] ElevenLabs narration used (Brian premade voice, `eleven_multilingual_v2`, seed 42)
- [x] Captions burned in (57 phrase cues, high-contrast band, ≤ 2 lines)
- [x] SRT exists (`deliverables/video/public/captions/final.srt`; monotonic; ends before video)
- [x] Actual application footage used (Playwright captures of the running app; manifest committed)
- [x] Power Apps value covered (scene 2 — first-party-sourced value stack)
- [x] Devin's role covered (scene 6 — accelerator, not runtime/owner)
- [x] Replicable and non-replicable capabilities covered (scenes 5–7)
- [x] Build-versus-buy recommendation covered (scenes 1 and 8 — stated at open and close)
- [x] Next steps covered (scene 8 — seat mix, one pilot, measure, revisit)
- [x] No unsupported claims (claims register: `deliverables/video/content/claims-register.md`)
- [x] No customer data (synthetic only; banner visible in captures)
- [x] No accidental desktop/credential exposure (frames + contact sheet inspected; browser-chrome frames are rendered, not real desktop)

## One-pager

- [x] Markdown exists (`deliverables/one-pager/key-decisions.md`)
- [x] HTML exists (`deliverables/one-pager/key-decisions.html`)
- [x] PDF exists (`deliverables/one-pager/key-decisions.pdf`)
- [x] PDF page count equals one (validated by `render-one-pager.mjs`)
- [x] Architecture reflects actual implementation (matches audited code, incl. one-transaction audit)
- [x] Decisions and exclusions explicit (5 decisions, each with what it does NOT prove)
- [x] No generic filler (every line states a fact, decision, tradeoff, or implication)
- [x] Recommendation consistent with video (route-by-app; feature-flag pilot; hard gates)

## Handoff

- [x] Finalization log exists (`deliverables/FINALIZATION_LOG.md` — Devin vs Claude Code attribution)
- [x] Evidence matrix exists (`deliverables/evidence-matrix.md`)
- [x] Sources exist (`deliverables/sources.md` — first-party only)
- [x] Video build instructions exist (`deliverables/video/README.md`)
- [x] Loom URL or upload instructions exist (`deliverables/video/LOOM_UPLOAD_INSTRUCTIONS.md` — no authenticated Loom session was available; not uploaded)
- [x] Git status reviewed (diffs reviewed before each commit; no secrets or env files staged)
- [x] Final commit created
- [x] Branch pushed (`claude/finalize-submission`)
- [x] Pull request created
- [x] Pull request NOT merged
