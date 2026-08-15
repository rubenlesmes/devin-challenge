# Storyboard — Executive Readout (8 scenes, 4:42)

Timing is driven by the generated narration (`src/generated/timeline.json`); the values
below are the delivered render's actuals (ElevenLabs `eleven_v3`, voice Ellen, audio tags).

| # | Scene (component) | Start | Dur | Visuals | Purpose |
| --- | --- | --- | --- | --- | --- |
| 1 | Recommendation first (`DecisionScene`) | 0:00 | 22.2s | ~$250K/yr figure; two recommendation cards (don't replace / pilot Devin-assisted path) | Decision in the first 20 seconds |
| 2 | Power Apps value stack (`PowerAppsValueScene`) | 0:22 | 39.6s | Six platform-layer cards: construction, data+connectors (1,000+), identity (Entra), governance (DLP), lifecycle (ALM), maker accessibility; source note | What the license actually buys |
| 3 | Prototype scope & architecture (`ArchitectureScene`) | 1:02 | 35.3s | Scope cards (deep KYC + 2 thin modules + synthetic data) and animated flow: UI → actions → services → authz/validation/transitions → one transaction | What was built and why |
| 4 | KYC demonstration (`KycDemoScene`) | 1:37 | 42.2s | Real recording: queue → KYC-1001 → Assign → Approve with note (17.1s), then audit-timeline still with zoom + highlight; evidence label (boundary tests 10/10) | The decision-relevant workflow, live |
| 5 | Reuse & permission boundary (`ReuseScene`) | 2:19 | 29.4s | Refund approval recording → reviewer-denied still (highlighted disabled toggles) → admin flag-enable recording → central audit log still | Same spine across modules; server-side denial |
| 6 | Devin's role (`DevinScene`) | 2:49 | 35.6s | Real repo tree (AGENTS.md, Skill, lib, modules, tests); live test summary (13/13); golden-path/merge-gate/not-the-runtime cards | Accelerator, not runtime or owner |
| 7 | What remains owned (`RiskScene`) | 3:24 | 34.3s | Eight amber cards: SSO/MFA, record-level authz, integrations, tamper-evident audit, monitoring/IR, HA/DR, platform ownership, compliance | The honest not-replicated list |
| 8 | Recommendation & next steps (`RecommendationScene`) | 3:59 | 43.7s | Routing rule (3 criteria) + 90-day plan (keep 3 apps, seat mix, one pilot, measure); closing card: "Don't replace the platform. Earn the right to shrink it — with evidence." | Actionable decision + clean ending |

Design system: dark navy canvas (#0B1220), single accent blue, amber for risk, green for
actions; 120/80 px safe margins; captions in a high-contrast band above the bottom edge;
no music, no stock footage, no logos (product names as text only).
