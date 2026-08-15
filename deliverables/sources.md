# External Sources

All externally sourced claims used in the executive video and the Key Decisions one-pager.
First-party sources only (Microsoft for Power Platform; Cognition for Devin). Research
performed 2026-08-15 by the strategy workstream of the Claude Code finalization session.

| Claim | Source title | URL | Date accessed | How the claim is used |
| --- | --- | --- | --- | --- |
| Power Apps Premium lists at $20/user/month (annual); a 2,000-seat-minimum tier at $12/user/month; a free Developer plan exists; pay-as-you-go is an Azure-metered option | Power Apps pricing | https://www.microsoft.com/en-us/power-platform/products/power-apps/pricing | 2026-08-15 | Economic framing: what ~$250K/yr can plausibly cover; avoided-cost ceiling. Not shown as a savings promise. |
| Power Apps / Power Automate / Logic Apps / Copilot Studio offer **over 1,000 connectors**; custom connectors wrap REST APIs; Microsoft Entra ID is the recommended auth for connectors | Custom connectors overview (Microsoft Learn) | https://learn.microsoft.com/en-us/connectors/custom-connectors/ | 2026-08-15 | Video scene 2 ("more than a thousand governed connectors") and one-pager value-stack framing. |
| Dataverse is a managed data platform with role-, row-, and column-level security and server-side logic/validation | What is Microsoft Dataverse? (Microsoft Learn) | https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-intro | 2026-08-15 | Video scene 2 ("a managed data layer with row and column level security"). |
| DLP policies classify connectors and act as enforced guardrails across environments | Data loss prevention policies (Microsoft Learn) | https://learn.microsoft.com/en-us/power-platform/admin/wp-data-loss-prevention | 2026-08-15 | Video scenes 2 & 7 ("data loss prevention policies", "centralized data loss prevention"). |
| Managed Environments provide a governance/ALM suite (environment groups, sharing limits, pipelines, solution checker, IP firewall, etc.) | Managed environments overview (Microsoft Learn) | https://learn.microsoft.com/en-us/power-platform/admin/managed-environment-overview | 2026-08-15 | Video scene 2 ("managed lifecycle controls") and one-pager. |
| Cognition's guidance: Devin performs best on well-scoped tasks (≈ ≤3 hours of human work) with test suites / verifiable outcomes; larger work should be split; human review of results is part of the intended workflow | When to use Devin (Devin Docs) | https://docs.devin.ai/essential-guidelines/when-to-use-devin | 2026-08-15 | Video scene 6 (accelerator framing, human review as merge gate) and routing-rule criterion 3. |
| Devin billing: self-serve plans (Free $0, Pro $20/mo, Max $200/mo, Teams from $80/mo) with on-demand credits; Enterprise billed in ACUs at contracted rates | Billing / Self-serve plans (Devin Docs) | https://docs.devin.ai/admin/billing and https://docs.devin.ai/admin/billing/self-serve | 2026-08-15 | One-pager economics context: Devin licensing is small relative to engineering labor. Enterprise ACU rates are not public — no specific enterprise figure is claimed anywhere. |

## Claims deliberately NOT made (and why)

- **"$250K/yr in savings"** — the $250K figure is a scenario input from the assignment, not
  a verified invoice; the genuinely avoidable amount depends on an unknown seat/license mix.
  All artifacts present it as "at stake"/"a ceiling", never as proven savings.
- **Per-app / pay-as-you-go dollar figures** — only third-party sources found; excluded.
- **A specific original build duration for the prototype** — the repository does not
  independently substantiate one (see `evidence-matrix.md`, last row).
- **Regulatory compliance, production readiness, enterprise SSO** — explicitly disclaimed
  in the README, video scene 7, and one-pager.
- **Devin "replacing" Power Apps** — all artifacts use "Devin-assisted custom development."

## Repository-internal evidence

All statements about the prototype itself (permissions, transitions, atomic audit, tests,
synthetic data) are backed by source inspection and command execution recorded in
`deliverables/evidence-matrix.md` — not by external sources.
