import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { Headline } from "../components/Headline";
import { RevealCard } from "../components/Cards";
import { theme } from "../theme";

const FLOW: { label: string; sub?: string; tone?: "accent" | "positive" }[] = [
  { label: "Next.js UI", sub: "React Server Components" },
  { label: "Server actions", sub: "thin wrappers" },
  { label: "Application services", sub: "all business mutations", tone: "accent" },
  { label: "Authorization · Validation · Transitions", sub: "central, server-side", tone: "accent" },
  { label: "SQLite via Prisma + atomic audit writer", sub: "one transaction", tone: "positive" },
];

export const ArchitectureScene: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  return (
    <Frame kicker="The prototype" sceneDuration={durationInFrames}>
      <Headline size={56}>One deep workflow. Two reuse tests. One spine.</Headline>
      <div style={{ display: "flex", gap: 48, marginTop: 44, flex: 1 }}>
        {/* Left: scope */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 640 }}>
          <RevealCard index={0} startFrame={26} perItem={16} compact tone="accent" title="KYC review queue" detail="Deep vertical slice — queue, case detail, assignment, decisions, timeline" />
          <RevealCard index={1} startFrame={26} perItem={16} compact title="Refunds" detail="Thin module — pattern reuse test" />
          <RevealCard index={2} startFrame={26} perItem={16} compact title="Feature flags" detail="Thin module — privileged actions" />
          <RevealCard index={3} startFrame={26} perItem={16} compact tone="positive" title="Synthetic data · simulated identity" detail="Isolates the implementation hypothesis" />
        </div>
        {/* Right: flow */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1, justifyContent: "flex-start" }}>
          {FLOW.map((step, i) => {
            const start = 90 + i * 20;
            const t = interpolate(frame - start, [0, 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <React.Fragment key={step.label}>
                {i > 0 ? (
                  <div style={{ display: "flex", justifyContent: "center", opacity: t }}>
                    <div style={{ width: 3, height: 22, background: theme.accent, borderRadius: 2 }} />
                  </div>
                ) : null}
                <div
                  style={{
                    opacity: t,
                    transform: `translateY(${(1 - t) * 10}px)`,
                    background: step.tone === "positive" ? theme.greenSoft : step.tone === "accent" ? theme.accentSoft : theme.bgCard,
                    border: `1.5px solid ${theme.border}`,
                    borderRadius: 12,
                    padding: "16px 26px",
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 18,
                  }}
                >
                  <span style={{ fontSize: 30, fontWeight: 650, color: theme.text }}>{step.label}</span>
                  {step.sub ? <span style={{ fontSize: 23, color: theme.textMuted }}>{step.sub}</span> : null}
                </div>
              </React.Fragment>
            );
          })}
          <div
            style={{
              marginTop: 26,
              fontSize: 24,
              color: theme.textMuted,
              opacity: interpolate(frame - 200, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            Audit events commit in the <span style={{ color: theme.green, fontWeight: 650 }}>same transaction</span> as the
            business change — no change without a trail.
          </div>
        </div>
      </div>
    </Frame>
  );
};
