import React from "react";
import { Frame } from "../components/Frame";
import { Headline, Sub } from "../components/Headline";
import { RevealCard } from "../components/Cards";

const OWNED: { title: string; detail: string }[] = [
  { title: "Enterprise SSO & MFA", detail: "Identity here is a demo cookie — deliberately" },
  { title: "Record-level authorization", detail: "Segregation of duties: requester ≠ approver" },
  { title: "Source-of-truth integrations", detail: "KYC vendor, payments ledger, flag service" },
  { title: "Tamper-evident audit retention", detail: "Append-only in code ≠ immutable storage" },
  { title: "Monitoring & incident response", detail: "Alerting, on-call, support ownership" },
  { title: "High availability & DR", detail: "Backups, recovery, environments" },
  { title: "Platform ownership", detail: "Upgrades, dependencies, security patching" },
  { title: "Compliance controls", detail: "Approved logging & retention for regulated flows" },
];

export const RiskScene: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  return (
    <Frame kicker="Not replicated — deliberately" sceneDuration={durationInFrames}>
      <Headline size={54}>On the custom path, these become yours</Headline>
      <Sub>The prototype names every one of these as a gap. None is exotic. All of them are work.</Sub>
      <div
        style={{
          marginTop: 38,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          maxWidth: 1640,
        }}
      >
        {OWNED.map((item, i) => (
          <RevealCard
            key={item.title}
            index={i}
            startFrame={34}
            perItem={14}
            compact
            tone="risk"
            title={item.title}
            detail={item.detail}
          />
        ))}
      </div>
    </Frame>
  );
};
