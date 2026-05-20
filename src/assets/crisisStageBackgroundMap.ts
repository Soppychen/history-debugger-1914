import type { TopStatusBarStatus } from "../design/componentVariants";

export const crisisStageBackgroundMap: Record<TopStatusBarStatus, string> = {
  stable: "/assets/backgrounds/bg-stage-stable.png",
  tense: "/assets/backgrounds/bg-stage-tense.png",
  ultimatum: "/assets/backgrounds/bg-stage-ultimatum.png",
  mobilization: "/assets/backgrounds/bg-stage-mobilization.png",
  warImminent: "/assets/backgrounds/bg-stage-war-imminent.png",
  irreversible: "/assets/backgrounds/bg-stage-irreversible.png",
};

export function getCrisisStageBackground(status: TopStatusBarStatus): string {
  return crisisStageBackgroundMap[status];
}
