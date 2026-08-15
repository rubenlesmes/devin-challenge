import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Frame } from "../components/Frame";
import { theme } from "../theme";
import { RevealCard } from "../components/Cards";

export const DecisionScene: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 8, fps, config: { damping: 16, mass: 0.7 } });
  const lineT = interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <Frame kicker="Internal tools · Build vs. buy" sceneDuration={durationInFrames}>
      <div style={{ display: "flex", flexDirection: "column", gap: 34, marginTop: 30 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 30 }}>
          <span
            style={{
              fontSize: 150,
              fontWeight: 750,
              color: theme.text,
              letterSpacing: -3,
              transform: `scale(${0.9 + pop * 0.1})`,
              transformOrigin: "left bottom",
            }}
          >
            ~$250K
          </span>
          <span style={{ fontSize: 44, color: theme.textMuted, fontWeight: 500 }}>
            / year · internal-tool platform licensing
          </span>
        </div>

        <div style={{ height: 3, width: `${lineT * 62}%`, background: theme.accent, borderRadius: 2 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1450 }}>
          <RevealCard
            index={0}
            startFrame={55}
            perItem={26}
            tone="accent"
            title="Recommendation: don't replace the platform"
            detail="Keep Power Apps where it earns its keep. No wholesale migration."
          />
          <RevealCard
            index={1}
            startFrame={55}
            perItem={26}
            tone="positive"
            title="Pilot Devin-assisted custom development"
            detail="One engineering-owned internal tool, built on a proven golden path — with a working prototype as evidence."
          />
        </div>
      </div>
    </Frame>
  );
};
