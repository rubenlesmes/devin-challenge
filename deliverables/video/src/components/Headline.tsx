import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

export const Headline: React.FC<{
  children: React.ReactNode;
  size?: number;
  delay?: number;
  color?: string;
}> = ({ children, size = 64, delay = 0, color = theme.text }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <h1
      style={{
        fontSize: size,
        lineHeight: 1.15,
        fontWeight: 700,
        color,
        margin: 0,
        opacity: t,
        transform: `translateY(${(1 - t) * 18}px)`,
      }}
    >
      {children}
    </h1>
  );
};

export const Sub: React.FC<{
  children: React.ReactNode;
  size?: number;
  delay?: number;
  color?: string;
}> = ({ children, size = 34, delay = 6, color = theme.textMuted }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <p
      style={{
        fontSize: size,
        lineHeight: 1.4,
        color,
        margin: 0,
        marginTop: 16,
        opacity: t,
        transform: `translateY(${(1 - t) * 14}px)`,
      }}
    >
      {children}
    </p>
  );
};
