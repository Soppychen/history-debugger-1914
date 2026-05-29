import type { TopStatusBarStatus } from "../design/componentVariants";

export const crisisStageBackgroundMap: Record<TopStatusBarStatus, string> = {
  stable: "/assets/backgrounds/bg-archive-map-europe.png",
  tense: "/assets/backgrounds/bg-main-crisis-room.png",
  ultimatum: "/assets/backgrounds/bg-main-crisis-room.png",
  mobilization: "/assets/backgrounds/bg-main-crisis-room.png",
  warImminent: "/assets/backgrounds/bg-main-crisis-room.png",
  irreversible: "/assets/backgrounds/bg-main-crisis-room.png",
};

export function getCrisisStageBackground(status: TopStatusBarStatus): string {
  return crisisStageBackgroundMap[status];
}
