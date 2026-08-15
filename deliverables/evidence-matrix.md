# Repository Evidence Matrix

Audit performed 2026-08-15 during the Claude Code finalization session, by direct source
inspection (read-only audit workstream) plus command execution by the integration session.
Baseline commit: `4b0bbe3`. "Post-fix" refers to the fixes recorded in `FINALIZATION_LOG.md`.

## Application execution

| Requirement | Status | Evidence | Test or observation | Gap | Safe video claim |
| --- | --- | --- | --- | --- | --- |
| Clean install works | Verified | `package.json` scripts; run 2026-08-15 | `npm install` — pass, 0 vulnerabilities | Requires working Node (env note in FINALIZATION_LOG) | "Runs from a clean checkout with documented commands." |
| DB init + seed works | Verified (post-fix) | `prisma/schema.prisma`, `prisma/seed.ts` | `npm run db:reset` — pass after Fix 1 (baseline command blocked in AI-assisted envs) | `--force-reset` replaced with in-place push + reseed | "Synthetic database resets to a deterministic state." |
| Dev server starts | Verified | `npm run dev` | Served http://localhost:3000, pages render | — | — |
| Production build succeeds | Verified | `npm run build` | Pass; 8 routes, all dynamic | Typecheck on a fresh checkout needs `next typegen`/build first (documented in AGENTS.md) | "Production build passes." |
| Tests pass | Verified | `tests/` (5 files) | `npm test` — 13/13 (10 baseline + 3 added in finalization) | Baseline had no conflict-path coverage (fixed) | "The boundary suite runs real service code against a real database." |
| Documented commands match | Verified (post-fix) | README §D/§G, AGENTS.md | Commands executed as documented | README test counts updated during finalization | — |

## Identity and permissions

| Requirement | Status | Evidence | Test or observation | Gap | Safe video claim |
| --- | --- | --- | --- | --- | --- |
| Persona switching works | Verified | `src/app/actions.ts` (`switchPersona`), `src/components/console/ConsoleShell.tsx:26-54` | Browser: switch Alex ↔ Morgan; recorded in `persona-switch.mp4` | Demo mechanism only — honestly labeled in UI | "Identity is deliberately simulated for the demo." |
| Client cannot supply its own role | Verified | `src/lib/auth/session.ts:10` allowlist; `:21-31` server resolves role from DB | Cookie holds only an allowlisted persona ID; HTTP-only (`src/app/actions.ts`) | Cookie lacks `secure` flag (local demo only) | "The browser can never assert a role — the server resolves the user from the database." |
| Permissions centralized | Verified | `src/lib/authorization/permissions.ts:22-42` — single `ROLE_PERMISSIONS` map | No second authz mechanism found in audit | — | "One central role→permission map, enforced server-side." |
| Mutation services enforce permissions | Verified | `requirePermission` first line of every mutation: `src/modules/kyc/service.ts:47,84,124`; `refunds/service.ts:30`; `feature-flags/service.ts` | 13/13 tests incl. denied-action tests | — | "Every mutation is permission-checked on the server." |
| Reviewer flag access denied server-side | Verified | REVIEWER set lacks `FEATURE_FLAG_MANAGE` (`permissions.ts:23-31`) | `tests/feature-flags.test.ts` — Alex rejected via real service, no state change, no audit | — | "A reviewer's toggle is refused by the server, not just hidden." |
| Admin flag toggle works | Verified | `permissions.ts:39`; `feature-flags/service.ts` | Test passes; browser capture `flag-toggle.mp4` | Toggle is permission-checked but not transition-mapped (boolean by design) | "Admins can enable a production flag with a recorded change reason." |
| Reviewer KYC assignment restriction | Verified | `kyc/service.ts:95-98,137-139` — non-admins only on own cases | `tests/kyc.test.ts` reviewer-boundary test | — | "Reviewers decide only their own cases; admins any." |

## State transitions

| Requirement | Status | Evidence | Test or observation | Gap | Safe video claim |
| --- | --- | --- | --- | --- | --- |
| KYC transitions centrally enforced | Verified | `KYC_TRANSITIONS` map `kyc/service.ts:12-18`; `assertTransition` before every write | Tests: invalid-transition case | — | "Status changes obey an explicit transition map." |
| Terminal states final | Verified | `APPROVED: []`, `REJECTED: []` (`kyc/service.ts:16-17`) | Test: re-deciding an approved case rejected, no state change | — | "A final decision cannot be changed." |
| Refund decisions only from PENDING | Verified | `REFUND_TRANSITIONS` `refunds/service.ts:12-16` | `tests/refunds.test.ts` | — | — |
| Invalid transitions leave records unchanged | Verified | Throw before any write inside `$transaction` | Tests assert unchanged rows | — | — |
| Invalid transitions produce no audit events | Verified | `assertTransition` precedes `writeAuditEvent` in all services | Tests assert zero audit rows | — | "Failed attempts write nothing — no state, no audit noise." |

## Audit integrity

| Requirement | Status | Evidence | Test or observation | Gap | Safe video claim |
| --- | --- | --- | --- | --- | --- |
| Successful actions create audit events | Verified | `writeAuditEvent(tx, …)` in every mutation | Tests assert action, actor, reason, before/after | — | "Every successful change is audited with who, what, before, after." |
| Business change + audit atomic | Verified | Same `$transaction`; `src/lib/audit/writer.ts:18-19` | `tests/atomicity.test.ts` — forced audit failure rolls back business write | — | "Change and audit commit together or not at all — proven by a fault-injection test." |
| Authz failures create no audit event | Verified | `requirePermission` throws before transaction | Denied-action tests assert zero events | — | — |
| Failed transitions create no audit event | Verified | See above | Tests | — | — |
| Audit events read-only in app | Verified | No update/delete path exposed anywhere (audit search) | `src/app/audit/page.tsx` is read-only | Append-only is an application-layer convention, not a DB constraint | Say "append-only by design in application code" — NOT "tamper-proof" or "DB-enforced." |
| Case-level and central audit views | Verified | `AuditTimeline` on case detail; `/audit` page | Browser captures `kyc-audit-timeline.png`, `audit-log.png` | Central log capped at 200 rows, no pagination | — |

## Data and security

| Requirement | Status | Evidence | Test or observation | Gap | Safe video claim |
| --- | --- | --- | --- | --- | --- |
| All seeded data synthetic | Verified | `prisma/seed.ts` — `.test` emails, invented names/amounts | Reviewed every seed record | — | "All data is synthetic; no production systems are connected." |
| No real-looking sensitive data added | Verified | Capture assets reviewed | Screenshots show `.test` data + banner | — | — |
| No production integration | Verified | No external network calls in app code (grep audit) | — | — | — |
| No secrets committed | Verified | `.env` = `DATABASE_URL="file:./dev.db"` only; grep for key/token/secret patterns clean | `git show HEAD:.env` | — | "No secrets in the repository." |
| No API key in client JS | Verified | ElevenLabs key used only by `deliverables/video/scripts/generate-narration.mjs` (server-side, env-only) | Key never written to any artifact | — | — |
| No raw stack traces in UI | Verified | `src/lib/errors/index.ts:43-51` — generic message for unexpected errors | Post-fix: unexpected errors now also logged server-side (Fix 2) | — | — |
| Server-side validation | Verified | Zod `parseInput` in every service; note ≥ 10 chars (`src/lib/validation`) | Validation test present | Client-side check is usability-only (commented as such) | — |
| No raw-HTML injection rendering | Verified | React's raw-HTML escape hatch is not used anywhere in the app (repository-wide search) | — | — | — |
| No mutation bypasses service layer | Verified | All server actions call services; no route handlers with mutations | `src/app/*/actions.ts` audit | — | "Every mutation flows through the audited service layer." |

## User experience

| Requirement | Status | Evidence | Test or observation | Gap | Safe video claim |
| --- | --- | --- | --- | --- | --- |
| KYC queue + search/filters | Verified | `src/app/kyc/page.tsx` | Browser + capture `kyc-queue.png` | — | — |
| KYC detail + actions | Verified | `src/app/kyc/[id]/` | Browser flow recorded (`kyc-flow.mp4`) | — | — |
| Refund workflow | Verified | `src/app/refunds/` | `refund-flow.mp4` | — | — |
| Feature-flag workflow | Verified | `src/app/feature-flags/` | `flag-toggle.mp4`, denial screenshot | — | — |
| Audit log | Verified | `src/app/audit/page.tsx` | `audit-log.png` | Capped at 200 rows | — |
| Success/error states understandable | Verified | `ActionDialog` result messages; typed errors | Browser observation | — | — |
| Mobile-width usable | Verified | 375 px capture `mobile-kyc-queue.png`; original `docs/screenshots/mobile-kyc-queue.png` | Rendered correctly at 375×812 | Not exhaustively tested on devices | — |
| No material console errors | Verified | Capture run monitors console on every page | 0 errors across all captured pages/flows | — | — |

## Documentation and history

| Requirement | Status | Evidence | Test or observation | Gap | Safe video claim |
| --- | --- | --- | --- | --- | --- |
| README setup accurate | Verified (post-fix) | README §D | Commands executed | Test-count statements corrected in finalization | — |
| README states simulations + gaps | Verified | README §J (production gaps), §K (scope), §C note | — | — | — |
| Does not imply Power Apps recreated | Verified | README §A: "not a general-purpose Power Apps replacement" | — | — | — |
| Screenshots current | Verified | `docs/screenshots/` match app; fresh captures added under `deliverables/video/public/captures/` | Visual comparison | — | — |
| Development log factual | Partially verified | `DEVELOPMENT_LOG.md` | One inaccuracy found at baseline: concurrency described as "test-covered" with zero coverage — corrected via appended note + new tests | Log statements about the build process are self-reported | — |
| Optimistic concurrency | Implemented; test-covered post-fix | `expectedVersion` in all schemas; `conflict()` checks; `version` increments | `tests/concurrency.test.ts` (added in finalization) — 3 tests | UI still does not send `expectedVersion` (last-write-wins in the UI; disclosed in README §K) | Say "the service layer detects conflicting writes" — do NOT say the UI is wired to it. |
| Build-time / autonomy claims | Not substantiable | `git log`: one squashed app commit (`6e8aa0f`); all commits 2026-08-14 20:57–21:10 UTC by a personal account; root empty commit timestamped after descendants (history reconstructed) | — | Git cannot substantiate build duration, autonomy, or parallelism | The prototype demonstrates functional feasibility and reusable patterns, but the repository does not independently substantiate a specific end-to-end build-time claim. |
