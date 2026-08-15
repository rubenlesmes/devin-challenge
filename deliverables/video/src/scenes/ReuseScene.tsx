import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Frame } from "../components/Frame";
import { AppCapture } from "../components/AppCapture";
import { theme } from "../theme";

const Panel: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 90 }}>
    {children}
    <div style={{ marginTop: 20, fontSize: 26, color: theme.textMuted, fontWeight: 550 }}>{label}</div>
  </AbsoluteFill>
);

/**
 * Scene 5, aligned to the narration order:
 * refunds recording → reviewer denied (still, highlighted) → admin flag toggle
 * (recording) → central audit log (still with zoom).
 * Segment lengths are proportional to the scene's actual duration.
 */
export const ReuseScene: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const usable = durationInFrames;
  const seg1 = Math.round(usable * 0.3); // refunds (11.4s recording, trimmed to fit)
  const seg2 = Math.round(usable * 0.22); // reviewer denied
  const seg3 = Math.round(usable * 0.28); // flag toggle (9.6s recording)
  const seg4 = usable - seg1 - seg2 - seg3; // audit log

  return (
    <Frame kicker="Reuse & the permission boundary" sceneDuration={durationInFrames}>
      <Sequence from={0} durationInFrames={seg1} name="Refund flow">
        <Panel label="Refunds — same queue, dialog, and audit pattern">
          <AppCapture kind="video" src="captures/refund-flow.mp4" urlLabel="localhost:3000/refunds — RF-2001" width={1420} />
        </Panel>
      </Sequence>
      <Sequence from={seg1} durationInFrames={seg2} name="Reviewer denied">
        <Panel label="Reviewer: feature-flag changes are refused — enforced server-side">
          <AppCapture
            kind="image"
            src="captures/flags-reviewer-denied.png"
            urlLabel="localhost:3000/feature-flags — Alex Reviewer (REVIEWER)"
            width={1420}
            zoomFrom={1.0}
            zoomTo={1.35}
            focus={{ x: 0.78, y: 0.45 }}
            zoomDuration={seg2 - 10}
            highlight={{ x: 0.63, y: 0.3, w: 0.17, h: 0.28, appearAt: 18 }}
          />
        </Panel>
      </Sequence>
      <Sequence from={seg1 + seg2} durationInFrames={seg3} name="Admin flag toggle">
        <Panel label="Admin: enabling a production flag requires a recorded change reason">
          <AppCapture kind="video" src="captures/flag-toggle.mp4" urlLabel="localhost:3000/feature-flags — Morgan Admin (ADMIN)" width={1420} />
        </Panel>
      </Sequence>
      <Sequence from={seg1 + seg2 + seg3} durationInFrames={seg4} name="Central audit log">
        <Panel label="One central, read-only audit log across every module">
          <AppCapture
            kind="image"
            src="captures/audit-log.png"
            urlLabel="localhost:3000/audit"
            width={1420}
            zoomFrom={1}
            zoomTo={1.18}
            focus={{ x: 0.5, y: 0.35 }}
            zoomDuration={seg4 - 8}
          />
        </Panel>
      </Sequence>
    </Frame>
  );
};
