# Executive Video — Narration Script (FROZEN)

Audience: the client's VP of Engineering.
Style: spoken, direct, executive. No corporate filler. Recommendation stated in the first 20 seconds.
Terminology rule: always "Devin-assisted custom development" — never "Devin replaces Power Apps."

Word count: ~645 words. Actual audio duration is authoritative; the composition is timed
from the generated narration files, and the rendered video must be ≤ 300 seconds.

This file is the human-readable source. The machine-read source of truth consumed by the
pipeline is `content/scene-manifest.json` — the two must stay in sync.

Delivery note: narration is generated with ElevenLabs `eleven_v3` (voice: Ellen,
`BIvP0GN1cAtSRTxNHnWS`). The synthesized input (`ttsText` in the manifest) is this exact
script plus inline v3 audio tags (e.g. `[confident]`, `[serious]`, `[calm]`) as
performance directions; the spoken words are unchanged, and tags never appear in
captions.

---

## Scene 1 — Recommendation first

You're paying roughly two hundred and fifty thousand dollars a year for an internal-tools
platform. Our recommendation: don't replace it. Keep Power Apps where it earns its keep,
and pilot Devin-assisted custom development on the next engineering-owned tool. A working
prototype makes the case, and shows exactly where the boundaries are.

## Scene 2 — What Power Apps actually buys

First, be clear about what that license actually buys. Screens are the visible part. The
real value is the platform underneath: Microsoft Entra identity and single sign-on.
Dataverse, a managed data layer with row and column level security. More than a thousand
governed connectors. Data loss prevention policies. And managed lifecycle controls, all
maintained by Microsoft. Custom code inherits none of that for free. Any honest
build-versus-buy comparison starts there, not with how fast you can render a table.

## Scene 3 — What was built and why

To test the build side, Devin built a working operations console. One deep KYC review
workflow, plus refunds and feature flags as thinner reuse tests. Underneath: one
server-side permission map, declarative state machines, and an append-only audit event
written in the same database transaction as every business change. A record cannot change
without an audit trail, by construction. All data is synthetic, and identity is
deliberately simulated. The point is the pattern, not a production system.

## Scene 4 — KYC demonstration

Here's the real application. A reviewer works the KYC queue, opens a case, assigns it to
themselves, and approves it with a mandatory decision note. The case moves through a
controlled state machine, from pending to in review to approved, and once a decision is
final, the server refuses any further transition. Every action lands in the case's audit
timeline: who, what, before and after. Ten automated tests pin these boundaries down,
covering permitted actions, denied actions, invalid transitions, and audit atomicity,
against the real service code.

## Scene 5 — Reuse and the permission boundary

The same spine repeats across modules. Refunds reuse the same queue, dialog, and audit
components. Feature flags show the permission boundary: as a reviewer, the toggle is
refused, enforced on the server, not just hidden in the interface. Switch to an admin,
and enabling a production flag requires a recorded change reason. And every action,
across every module, shows up in one central audit log.

## Scene 6 — What Devin accelerates

Devin's role is the economics of the second through the tenth app. The repository encodes
the conventions: a machine-readable rulebook and a module playbook, so the next workflow
follows the same golden path. Schema, service, permissions, transitions, audit, tests,
pull request. Reviewed and merged by your engineers. Devin is an accelerator inside your
delivery process. It is not the runtime, not the identity provider, and not the
accountable owner of what ships.

## Scene 7 — What remains to be owned

And what the prototype deliberately does not replicate: enterprise single sign-on, the
connector ecosystem, a managed data platform, centralized data loss prevention, citizen
development, and production operations, meaning monitoring, incident response, and
disaster recovery. On the custom path, your team owns security, compliance, and support.
Those are real, recurring costs, and they gate any migration decision, especially for
regulated workflows like KYC.

## Scene 8 — Recommendation and next steps

So route by app, not by ideology. Keep the existing three apps where they are; there's no
migration case yet. Build custom only when engineering will own the tool in production,
it needs code-level control or deep internal integration, and the workflow is
well-defined enough to test. Everything else stays on Power Apps. Concretely: confirm the
real seat mix behind the spend, take one pilot, feature-flag administration, to a true
production bar with real identity and monitoring, and measure it. Don't replace the
platform. Earn the right to shrink it, with evidence.
