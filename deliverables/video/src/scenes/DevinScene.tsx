import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { Headline } from "../components/Headline";
import { RevealCard, EvidenceLabel } from "../components/Cards";
import { theme } from "../theme";
import evidence from "../generated/evidence.json";

/** Real repository structure (verified against the repo — not invented). */
const REPO_TREE = [
  "AGENTS.md                     ← machine-readable rulebook",
  ".agents/skills/",
  "  add-internal-tool-module/   ← module playbook (Skill)",
  "src/lib/",
  "  authorization/permissions.ts",
  "  transitions/  audit/  validation/  errors/",
  "src/modules/",
  "  kyc/service.ts  refunds/  feature-flags/",
  "tests/",
  "  kyc · refunds · feature-flags · atomicity",
];

export const DevinScene: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  return (
    <Frame kicker="Devin's role — the next ten apps" sceneDuration={durationInFrames}>
      <Headline size={54}>The repository is the contract</Headline>
      <div style={{ display: "flex", gap: 44, marginTop: 38, flex: 1 }}>
        {/* Left: real repo tree */}
        <div
          style={{
            width: 760,
            background: "#0D1526",
            border: `1.5px solid ${theme.border}`,
            borderRadius: 14,
            padding: "26px 32px",
            fontFamily: theme.mono,
            fontSize: 24,
            lineHeight: 1.75,
            color: theme.textMuted,
          }}
        >
          {REPO_TREE.map((line, i) => {
            const t = interpolate(frame - (26 + i * 7), [0, 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div key={i} style={{ opacity: t, color: line.includes("←") ? theme.text : undefined }}>
                {line}
              </div>
            );
          })}
          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: `1px solid ${theme.border}`,
              color: theme.green,
              opacity: interpolate(frame - 130, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            {evidence.testSummary}
          </div>
        </div>
        {/* Right: golden path + boundaries */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
          <RevealCard index={0} startFrame={50} perItem={20} compact tone="positive" title="Golden path per module" detail="Schema → service → permissions → transitions → audit → tests → pull request" />
          <RevealCard index={1} startFrame={50} perItem={20} compact tone="positive" title="Human review is the merge gate" detail="Devin proposes; your engineers review and own the result" />
          <RevealCard index={2} startFrame={50} perItem={20} compact tone="risk" title="Devin is not the runtime" detail="Not the identity provider, not the compliance function, not the accountable owner" />
          <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <EvidenceLabel delay={120}>AGENTS.md</EvidenceLabel>
            <EvidenceLabel delay={128}>.agents/skills/add-internal-tool-module</EvidenceLabel>
            <EvidenceLabel delay={136}>DEVIN_PR_TEMPLATE.md</EvidenceLabel>
          </div>
        </div>
      </div>
    </Frame>
  );
};
