import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { Headline } from "../components/Headline";
import { RevealCard } from "../components/Cards";
import { theme } from "../theme";

/**
 * Scene 8: routing rule + concrete next steps, ending on a closing decision
 * card that holds for the final seconds.
 */
export const RecommendationScene: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const CLOSING_FRAMES = 168; // final decision card
  const closingStart = durationInFrames - CLOSING_FRAMES;
  const closingT = interpolate(frame - closingStart, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bodyOpacity = 1 - closingT;

  return (
    <Frame kicker="The path forward" sceneDuration={durationInFrames}>
      <div style={{ opacity: bodyOpacity, display: "flex", flexDirection: "column", flex: 1 }}>
        <Headline size={54}>Route by app, not by ideology</Headline>
        <div style={{ display: "flex", gap: 40, marginTop: 36, flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            <div style={{ fontSize: 26, fontWeight: 650, color: theme.accent, letterSpacing: 1 }}>BUILD CUSTOM ONLY IF ALL THREE HOLD</div>
            <RevealCard index={0} startFrame={30} perItem={16} compact tone="accent" title="1 · Engineering owns it in production" detail="Upgrades, patching, on-call" />
            <RevealCard index={1} startFrame={30} perItem={16} compact tone="accent" title="2 · Needs code-level control or deep integration" detail="Internal services without good connectors" />
            <RevealCard index={2} startFrame={30} perItem={16} compact tone="accent" title="3 · Well-defined, testable workflow" detail="Clear success criteria — where Devin is strongest" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            <div style={{ fontSize: 26, fontWeight: 650, color: theme.green, letterSpacing: 1 }}>NEXT 90 DAYS</div>
            <RevealCard index={0} startFrame={90} perItem={16} compact tone="positive" title="Keep the existing three apps" detail="No migration case yet — revisit with evidence" />
            <RevealCard index={1} startFrame={90} perItem={16} compact tone="positive" title="Confirm the real seat mix" detail="Size the genuinely avoidable license spend" />
            <RevealCard index={2} startFrame={90} perItem={16} compact tone="positive" title="Run one production pilot" detail="Feature-flag admin: real SSO, real flag service, monitoring — then security review" />
            <RevealCard index={3} startFrame={90} perItem={16} compact tone="positive" title="Measure, then decide app #2" detail="Engineering hours, support burden, change lead time" />
          </div>
        </div>
      </div>

      {/* Closing decision card */}
      <AbsoluteFill
        style={{
          opacity: closingT,
          alignItems: "center",
          justifyContent: "center",
          background: theme.bg,
          paddingLeft: 160,
          paddingRight: 160,
          paddingBottom: 60,
        }}
      >
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 30, alignItems: "center" }}>
          <div style={{ fontSize: 30, letterSpacing: 4, color: theme.accent, fontWeight: 600, textTransform: "uppercase" }}>
            The decision
          </div>
          <div style={{ fontSize: 68, fontWeight: 750, color: theme.text, lineHeight: 1.2, maxWidth: 1500 }}>
            Don't replace the platform.
            <br />
            Earn the right to shrink it — with evidence.
          </div>
          <div style={{ fontSize: 26, color: theme.textFaint, marginTop: 14 }}>
            Prototype, tests, and full decision brief in the repository · All demonstration data is synthetic
          </div>
        </div>
      </AbsoluteFill>
    </Frame>
  );
};
