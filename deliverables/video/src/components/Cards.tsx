import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

/** Progressive-disclosure card used for value stacks, risks and decisions. */
export const RevealCard: React.FC<{
  index: number;
  startFrame: number;
  perItem?: number;
  title: string;
  detail?: string;
  tone?: "neutral" | "positive" | "risk" | "accent";
  compact?: boolean;
}> = ({ index, startFrame, perItem = 10, title, detail, tone = "neutral", compact = false }) => {
  const frame = useCurrentFrame();
  const start = startFrame + index * perItem;
  const t = interpolate(frame - start, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const toneColor =
    tone === "positive" ? theme.green : tone === "risk" ? theme.amber : tone === "accent" ? theme.accent : theme.textFaint;
  const toneBg =
    tone === "positive" ? theme.greenSoft : tone === "risk" ? theme.amberSoft : tone === "accent" ? theme.accentSoft : "transparent";

  return (
    <div
      style={{
        opacity: t,
        transform: `translateY(${(1 - t) * 16}px)`,
        background: theme.bgCard,
        border: `1.5px solid ${theme.border}`,
        borderLeft: `6px solid ${toneColor}`,
        borderRadius: 14,
        padding: compact ? "18px 26px" : "26px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            fontSize: compact ? 30 : 34,
            fontWeight: 650,
            color: theme.text,
          }}
        >
          {title}
        </span>
        {toneBg !== "transparent" ? (
          <span style={{ flexShrink: 0, width: 10, height: 10, borderRadius: 6, background: toneColor }} />
        ) : null}
      </div>
      {detail ? (
        <span style={{ fontSize: compact ? 24 : 27, lineHeight: 1.35, color: theme.textMuted }}>{detail}</span>
      ) : null}
    </div>
  );
};

/** Small uppercase label chip, e.g. evidence pointers ("tests/kyc.test.ts"). */
export const EvidenceLabel: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <span
      style={{
        opacity: t,
        fontFamily: theme.mono,
        fontSize: 22,
        color: theme.textMuted,
        background: "rgba(148,163,184,0.10)",
        border: `1px solid ${theme.border}`,
        borderRadius: 8,
        padding: "6px 14px",
      }}
    >
      {children}
    </span>
  );
};
