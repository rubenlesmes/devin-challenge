# Loom Metadata

**Title:**
Devin vs. Power Apps: Internal Tools Build-or-Buy Recommendation

**Description (one paragraph):**
Executive readout for a VP of Engineering evaluating whether Devin-assisted custom
development should replace part of a ~$250K/yr Power Apps footprint. Recommendation
first: keep Power Apps where it earns its keep, and pilot one engineering-owned internal
tool on a code-based golden path. The video shows the working Devin-built prototype
(KYC review queue, refunds, feature flags, central audit log) with server-side
permissions, enforced state transitions, and transaction-atomic audit events — plus an
honest account of what the prototype does not replicate and what a custom path would
still have to own. All application data shown is synthetic; no production systems are
connected. Full evidence, tests, and the decision brief are in the accompanying
repository.

**Contents:**
- 0:00 Recommendation and what's at stake
- 0:22 What the Power Apps license actually buys
- 1:02 Prototype scope and architecture
- 1:37 Live KYC workflow with audit timeline
- 2:19 Reuse across modules + server-enforced permission boundary
- 2:49 Devin's role: accelerator, not runtime or owner
- 3:24 What remains to be owned on a custom path
- 3:59 Routing rule, 90-day plan, and the decision

**Notes:**
- The application uses synthetic demonstration data only.
- Repository: https://github.com/rubenlesmes/devin-challenge (branch `claude/finalize-submission`)
- Visibility: link-only / restricted. Do not make publicly discoverable.
