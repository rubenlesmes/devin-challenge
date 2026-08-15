import React from "react";
import { Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";

/**
 * Renders a real application capture (screenshot or recording) inside a
 * restrained browser-chrome frame, with optional slow pan/zoom and an
 * optional highlight box (fractional coordinates of the capture area).
 */
export const AppCapture: React.FC<{
  src: string;
  kind?: "image" | "video";
  urlLabel?: string;
  zoomFrom?: number;
  zoomTo?: number;
  /** Fractional origin for the zoom, e.g. {x: 0.5, y: 0.8} zooms toward the bottom middle. */
  focus?: { x: number; y: number };
  zoomStart?: number;
  zoomDuration?: number;
  highlight?: { x: number; y: number; w: number; h: number; appearAt?: number };
  width?: number;
}> = ({
  src,
  kind = "image",
  urlLabel,
  zoomFrom = 1,
  zoomTo = 1,
  focus = { x: 0.5, y: 0.5 },
  zoomStart = 0,
  zoomDuration = 90,
  highlight,
  width = 1560,
}) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame - zoomStart, [0, zoomDuration], [zoomFrom, zoomTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const highlightOpacity = highlight
    ? interpolate(frame - (highlight.appearAt ?? 0), [0, 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const innerHeight = (width * 1080) / 1920;

  return (
    <div
      style={{
        width,
        borderRadius: 16,
        overflow: "hidden",
        border: `1.5px solid ${theme.border}`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        background: "#0F172A",
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          height: 46,
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingLeft: 20,
          paddingRight: 20,
          background: "#1E293B",
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: 6, background: "#F87171" }} />
        <span style={{ width: 12, height: 12, borderRadius: 6, background: "#FBBF24" }} />
        <span style={{ width: 12, height: 12, borderRadius: 6, background: "#34D399" }} />
        {urlLabel ? (
          <span
            style={{
              marginLeft: 16,
              fontFamily: theme.mono,
              fontSize: 19,
              color: theme.textMuted,
              background: "rgba(15,23,42,0.7)",
              borderRadius: 8,
              padding: "4px 16px",
            }}
          >
            {urlLabel}
          </span>
        ) : null}
      </div>
      {/* Capture area with pan/zoom */}
      <div style={{ position: "relative", width, height: innerHeight, overflow: "hidden" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${zoom})`,
            transformOrigin: `${focus.x * 100}% ${focus.y * 100}%`,
          }}
        >
          {kind === "video" ? (
            <OffthreadVideo
              src={staticFile(src)}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>
        {highlight ? (
          <div
            style={{
              position: "absolute",
              left: `${highlight.x * 100}%`,
              top: `${highlight.y * 100}%`,
              width: `${highlight.w * 100}%`,
              height: `${highlight.h * 100}%`,
              border: `4px solid ${theme.amber}`,
              borderRadius: 10,
              boxShadow: "0 0 0 6000px rgba(2,6,23,0.14)",
              opacity: highlightOpacity,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
