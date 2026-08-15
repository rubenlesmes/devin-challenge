import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme, SAFE_X, SAFE_Y } from "../theme";

/**
 * Shared scene frame: dark executive canvas, safe margins, kicker + fade-in.
 * `sceneDuration` (frames) enables a gentle fade out at the end of the scene.
 */
export const Frame: React.FC<{
  kicker?: string;
  sceneDuration?: number;
  children: React.ReactNode;
}> = ({ kicker, sceneDuration, children }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = sceneDuration
    ? interpolate(frame, [sceneDuration - 12, sceneDuration - 2], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: theme.font }}>
      <AbsoluteFill
        style={{
          opacity: fadeIn * fadeOut,
          paddingLeft: SAFE_X,
          paddingRight: SAFE_X,
          paddingTop: SAFE_Y,
          paddingBottom: SAFE_Y + 110, // reserve caption band
          display: "flex",
          flexDirection: "column",
        }}
      >
        {kicker ? (
          <div
            style={{
              fontSize: 26,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: theme.accent,
              fontWeight: 600,
              marginBottom: 18,
            }}
          >
            {kicker}
          </div>
        ) : null}
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
