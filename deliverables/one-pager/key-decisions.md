# Fintech Operations Console — Key Decisions

**Objective:** test whether Devin-assisted custom development can produce a reusable, engineering-owned
internal-tools golden path worth piloting against a ~$250K/yr Power Apps footprint.
**Scope rationale:** one deep workflow (KYC) proves depth; two thin modules (refunds, feature flags) price
repetition — the economics of apps 2 through 10 — on synthetic data with deliberately simulated identity.

## Architecture (as implemented)

```
Browser ──► Next.js UI (App Router) ──► Server actions (thin) ──► Application services (src/modules/*)
                                                                      │  requirePermission · Zod validation
                                                                      │  assertTransition (state machines)
                                                                      ▼
                                                     One transaction: business write + audit event
                                                                      ▼
                                                            Prisma ── SQLite (synthetic seed)
```

UI never carries authoritative logic; the persona cookie stores only an allowlisted ID and the server
resolves the role from the database. Verified by source audit + 13/13 service-level tests (10 at original
delivery, 3 concurrency tests added in finalization). Full trace: `deliverables/evidence-matrix.md`.

## Key decisions and tradeoffs

**1 — Opinionated code-based golden path, not a low-code platform.**
Why: maximize control, testability, and repeatability for engineering-owned tools.
Proves: a 4th module can look like the 3rd — marginal cost falls with reuse.
Doesn't prove: any replacement for the connector ecosystem, Dataverse, DLP, or citizen development.
Implication: custom fits engineering-owned apps only; forms-over-data stays on Power Apps.

**2 — One deep KYC slice + two thin modules.**
Why: depth demonstrates regulated-workflow fit; thinness isolates the reusable spine.
Proves: shared components/services carry across modules.
Doesn't prove: per-app production cost — the pilot must measure that.
Implication: the reuse claim is structural, not yet economic.

**3 — Server-side permissions, transitions, and validation in one place each.**
Why: one reviewable location for "who can do what" and "what can change into what."
Proves: denials are testable first-class cases (reviewer's flag toggle refused server-side).
Doesn't prove: enterprise SSO/MFA, record-level authorization, segregation of duties.
Implication: identity and fine-grained authz are pilot-blocking work items.

**4 — Audit event committed in the same transaction as every business change.**
Why: "no change without a trail" as a structural guarantee, provable to an auditor.
Proves: fault-injection test shows the business write rolls back if the audit write fails.
Doesn't prove: tamper-evident retention — append-only holds at the application layer only.
Implication: regulated workflows need immutable storage + approved retention before migration.

**5 — Repository-as-contract for Devin (AGENTS.md + module Skill + PR template).**
Why: encode non-negotiable rules so agent output conforms by construction, under human review.
Proves: with explicit conventions and tests, an agent can extend the path consistently.
Doesn't prove: autonomy without oversight, or any specific build-time figure — the repository
does not independently substantiate an end-to-end build-duration claim.
Implication: budget for human review and permanent framework ownership (est. 0.5–1 FTE — assumption).

## Bottom line

**Build-vs-buy is per-app, not tenant-wide.** Custom wins only where engineering owns the tool in
production, needs code-level control or deep internal integration, and the workflow is testable;
Power Apps wins everywhere else because identity, governed data, connectors, DLP, and ALM come with
the license. **Largest unresolved risk:** the un-built production controls (SSO, record-level authz,
source-of-truth integration, tamper-evident audit, monitoring) plus standing platform ownership can
consume the ~$250K/yr ceiling. **Next step:** confirm the real seat mix behind the spend, then take one
pilot — feature-flag administration — to a true production bar and through security review; decide app
#2 from measured hours, support burden, and lead time, not estimates.
