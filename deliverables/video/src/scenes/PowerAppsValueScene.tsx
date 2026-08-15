import React from "react";
import { Frame } from "../components/Frame";
import { Headline, Sub } from "../components/Headline";
import { RevealCard } from "../components/Cards";
import { theme } from "../theme";

const LAYERS: { title: string; detail: string }[] = [
  { title: "App construction", detail: "Visual builders — the visible part" },
  { title: "Data & connectors", detail: "Dataverse + 1,000+ governed connectors" },
  { title: "Identity & access", detail: "Microsoft Entra ID, SSO, security roles" },
  { title: "Governance & DLP", detail: "Data-loss-prevention policies, environments" },
  { title: "Lifecycle (ALM)", detail: "Managed environments, pipelines, solutions" },
  { title: "Maker accessibility", detail: "Business users build & maintain their own apps" },
];

export const PowerAppsValueScene: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  return (
    <Frame kicker="What the license buys" sceneDuration={durationInFrames}>
      <Headline size={58}>Power Apps is a control plane, not a screen builder</Headline>
      <Sub>The hard-to-replace value sits below the surface — maintained by Microsoft, not by your team.</Sub>
      <div
        style={{
          marginTop: 44,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          maxWidth: 1620,
        }}
      >
        {LAYERS.map((l, i) => (
          <RevealCard
            key={l.title}
            index={i}
            startFrame={40}
            perItem={22}
            compact
            tone={i === 0 ? "neutral" : "accent"}
            title={l.title}
            detail={l.detail}
          />
        ))}
      </div>
      <div style={{ marginTop: "auto", fontSize: 22, color: theme.textFaint }}>
        Platform capabilities per learn.microsoft.com — full source list in the repository (deliverables/sources.md)
      </div>
    </Frame>
  );
};
