import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import captions from "../generated/captions.json";

type Caption = {
  text: string;
  startFrame: number;
  endFrame: number;
};

/** Burned-in captions: bottom band, phrase-level, high contrast, ≤2 lines. */
export const CaptionLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const current = (captions as Caption[]).find((c) => frame >= c.startFrame && frame <= c.endFrame);
  if (!current) return null;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          marginBottom: 44,
          maxWidth: 1480,
          background: "rgba(2, 6, 23, 0.78)",
          border: "1px solid rgba(148,163,184,0.22)",
          borderRadius: 12,
          padding: "14px 30px",
          fontFamily: theme.font,
          fontSize: 33,
          lineHeight: 1.35,
          color: theme.text,
          textAlign: "center",
        }}
      >
        {current.text}
      </div>
    </AbsoluteFill>
  );
};
