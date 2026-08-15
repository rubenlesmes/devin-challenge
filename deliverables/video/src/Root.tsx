import React from "react";
import { Audio, Composition, Sequence, staticFile } from "remotion";
import timeline from "./generated/timeline.json";
import { CaptionLayer } from "./components/CaptionLayer";
import { DecisionScene } from "./scenes/DecisionScene";
import { PowerAppsValueScene } from "./scenes/PowerAppsValueScene";
import { ArchitectureScene } from "./scenes/ArchitectureScene";
import { KycDemoScene } from "./scenes/KycDemoScene";
import { ReuseScene } from "./scenes/ReuseScene";
import { DevinScene } from "./scenes/DevinScene";
import { RiskScene } from "./scenes/RiskScene";
import { RecommendationScene } from "./scenes/RecommendationScene";

type SceneMeta = {
  id: string;
  title: string;
  from: number;
  durationInFrames: number;
  audioStartInScene: number;
  audioDurationSeconds: number;
};

const SCENE_COMPONENTS: Record<string, React.FC<{ durationInFrames: number }>> = {
  "scene-01-decision": DecisionScene,
  "scene-02-powerapps": PowerAppsValueScene,
  "scene-03-prototype": ArchitectureScene,
  "scene-04-kyc": KycDemoScene,
  "scene-05-reuse": ReuseScene,
  "scene-06-devin": DevinScene,
  "scene-07-gaps": RiskScene,
  "scene-08-recommendation": RecommendationScene,
};

const ExecutiveReadout: React.FC = () => {
  const scenes = timeline.scenes as SceneMeta[];
  return (
    <>
      {scenes.map((scene) => {
        const SceneComponent = SCENE_COMPONENTS[scene.id];
        return (
          <Sequence key={scene.id} from={scene.from} durationInFrames={scene.durationInFrames} name={scene.title}>
            <SceneComponent durationInFrames={scene.durationInFrames} />
            <Sequence from={scene.audioStartInScene} name={`${scene.id} narration`}>
              <Audio src={staticFile(`narration/${scene.id}.mp3`)} />
            </Sequence>
          </Sequence>
        );
      })}
      <CaptionLayer />
    </>
  );
};

export const Root: React.FC = () => {
  return (
    <Composition
      id="ExecutiveReadout"
      component={ExecutiveReadout}
      durationInFrames={Math.max(timeline.totalFrames, 30)}
      fps={timeline.fps}
      width={1920}
      height={1080}
    />
  );
};
