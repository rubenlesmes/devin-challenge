# Claims Register — Executive Video Narration

Every material narration statement, its evidence, and whether it may appear on screen.
Evidence paths refer to this repository; external URLs are catalogued in `deliverables/sources.md`.

| Script claim | Repository evidence or external source | Confidence | Allowed on screen |
| --- | --- | --- | --- |
| "~$250K per year for an internal-tools platform" | Scenario input from the assignment brief (stated as "roughly"; never presented as verified savings) | Scenario premise | Yes — as "~$250K / year", framed as what's at stake |
| "Recommendation: don't replace it… pilot Devin-assisted custom development" | Decision analysis in `deliverables/one-pager/key-decisions.md`; hard gates per evidence matrix | High (it is our recommendation, presented as such) | Yes |
| "Microsoft Entra identity and single sign-on… Dataverse… row and column level security" | learn.microsoft.com (Dataverse intro; custom connectors overview) — sources.md | High (first-party) | Yes |
| "More than a thousand governed connectors" | learn.microsoft.com custom connectors overview ("over 1,000 connectors") | High (first-party, conservative figure) | Yes |
| "Data loss prevention policies… managed lifecycle controls, all maintained by Microsoft" | learn.microsoft.com DLP + Managed Environments pages | High (first-party) | Yes |
| "Devin built a working operations console" | Task premise + repo docs (README §A, DEVELOPMENT_LOG); commit authorship is the human operator's account, so the video attributes the build to Devin per the project's own record, and evaluator docs state the evidence basis | Medium-high (self-reported provenance, disclosed in evaluator materials) | Yes |
| "One deep KYC review workflow, plus refunds and feature flags as thinner reuse tests" | `src/modules/kyc|refunds|feature-flags/`; README §B | High (code-verified) | Yes |
| "One server-side permission map" | `src/lib/authorization/permissions.ts:22-42` (single map; audited: no second mechanism) | High | Yes |
| "Declarative state machines" | `KYC_TRANSITIONS` (`src/modules/kyc/service.ts:12-18`), `REFUND_TRANSITIONS` (`refunds/service.ts:12-16`) — note: feature flags are permission-gated toggles, not state machines (narration attributes state machines to the spine, not to flags) | High | Yes |
| "Append-only audit event written in the same database transaction as every business change" | `src/lib/audit/writer.ts` inside `$transaction` in every service; `tests/atomicity.test.ts` proves rollback. "Append-only" = application-layer convention (no update/delete path exposed); NOT claimed as DB-enforced or tamper-proof | High (with that qualification) | Yes — without "tamper-proof" language |
| "A record cannot change without an audit trail, by construction" | Same-transaction commit + fault-injection rollback test — within the application's service layer (the only mutation path the app exposes) | High (scoped to the app layer; scene 7 separately concedes tamper-evident retention is NOT provided) | Yes |
| "All data is synthetic, and identity is deliberately simulated" | `prisma/seed.ts` (.test domains); `src/lib/auth/session.ts`; UI banner | High | Yes |
| "Once a decision is final, the server refuses any further transition" | Terminal states `APPROVED: []`, `REJECTED: []`; invalid-transition test | High | Yes |
| "Every action lands in the case's audit timeline: who, what, before and after" | Audit event fields (`writer.ts:21-31`); `AuditTimeline` component; tests assert before/after states | High | Yes |
| "Ten automated tests pin these boundaries down… against the real service code" | The 10 boundary tests delivered with the prototype (kyc 5, refunds 2, flags 2, atomicity 1), run 2026-08-15: pass. (3 additional concurrency tests were added during finalization — total suite 13/13; narration counts only the prototype's boundary suite) | High | Yes |
| "As a reviewer, the toggle is refused, enforced on the server" | REVIEWER lacks FEATURE_FLAG_MANAGE; `tests/feature-flags.test.ts` denial through real service | High | Yes |
| "Enabling a production flag requires a recorded change reason" | `FlagToggle` + `feature-flags/service.ts` (note required, audited); captured live | High | Yes |
| "Every action… shows up in one central audit log" | `/audit` page; capture `audit-log.png` | High | Yes |
| "The repository encodes the conventions: a machine-readable rulebook and a module playbook" | `AGENTS.md`; `.agents/skills/add-internal-tool-module/SKILL.md` | High | Yes |
| "Devin is an accelerator… not the runtime, not the identity provider, not the accountable owner" | Framing consistent with Cognition's own usage guidance (docs.devin.ai "When to use Devin") | High | Yes |
| "What the prototype deliberately does not replicate: [SSO, connectors, Dataverse-equivalent, DLP, citizen development, operations]" | README §J/§K exclusions; evidence matrix | High | Yes |
| "Route by app… Build custom only when [3 criteria]" | Recommendation framework (one-pager); criterion 3 aligned with Devin docs guidance | High (as recommendation) | Yes |
| "Take one pilot, feature-flag administration, to a true production bar" | Recommendation (rationale: engineering-owned domain, lowest connector dependence) | High (as recommendation) | Yes |

## Claims removed or excluded before narration freeze

- Any specific build-time or effort figure for the prototype (not substantiable from the repository).
- Any dollar savings projection (seat mix unknown; presented as evidence-gathering step instead).
- "Tested optimistic concurrency" as a prototype capability (baseline had no coverage; tests were added during finalization and are attributed accordingly — narration omits the topic entirely).
- Any compliance/security assurance ("compliant", "production-ready", "secure") — replaced by explicit gap statements in scene 7.
