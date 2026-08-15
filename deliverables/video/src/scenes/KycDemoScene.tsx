import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Frame } from "../components/Frame";
import { AppCapture } from "../components/AppCapture";
import { EvidenceLabel } from "../components/Cards";
import { theme } from "../theme";

/**
 * Scene 4: real KYC workflow recording (assign → approve → audit timeline),
 * then a still of the audit timeline with a slow zoom and highlight.
 * The recording is ~17s; the remaining scene time shows the timeline still.
 */
export const KycDemoScene: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const RECORDING_FRAMES = Math.round(17.1 * 30);
  const stillDuration = Math.max(durationInFrames - RECORDING_FRAMES, 60);

  return (
    <Frame kicker="Live demonstration — KYC review" sceneDuration={durationInFrames}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 90 }}>
        <Sequence from={0} durationInFrames={RECORDING_FRAMES} name="KYC flow recording">
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 90 }}>
            <AppCapture
              kind="video"
              src="captures/kyc-flow.mp4"
              urlLabel="localhost:3000/kyc — Alex Reviewer (REVIEWER)"
              width={1500}
            />
          </AbsoluteFill>
        </Sequence>
        <Sequence from={RECORDING_FRAMES} durationInFrames={stillDuration} name="Audit timeline still">
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 90 }}>
            <AppCapture
              kind="image"
              src="captures/kyc-audit-timeline.png"
              urlLabel="localhost:3000/kyc/KYC-1001 — audit timeline"
              width={1500}
              zoomFrom={1}
              zoomTo={1.28}
              focus={{ x: 0.5, y: 0.72 }}
              zoomDuration={120}
              highlight={{ x: 0.2, y: 0.52, w: 0.62, h: 0.4, appearAt: 40 }}
            />
            <div style={{ position: "absolute", bottom: 130, right: 140 }}>
              <EvidenceLabel delay={60}>Boundary test suite · 10/10 passing (tests/)</EvidenceLabel>
            </div>
          </AbsoluteFill>
        </Sequence>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 120,
            fontSize: 22,
            color: theme.textFaint,
          }}
        >
          Real application capture · synthetic data
        </div>
      </AbsoluteFill>
    </Frame>
  );
};
