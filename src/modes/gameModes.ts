export type GameMode = "standard" | "serious" | "challenge" | "ironman";

export interface GameModeDefinition {
  id: GameMode;
  labelZh: string;
  labelEn: string;
  descriptionZh: string;
  descriptionEn: string;
  allowsManualSave: boolean;
  allowsLoad: boolean;
  leaderboardEligible: boolean;
  fixedSeed: boolean;
  reloadPenaltyEnabled: boolean;
}

export const gameModes: GameModeDefinition[] = [
  {
    id: "standard",
    labelZh: "标准模式",
    labelEn: "Standard",
    descriptionZh: "适合探索分支。允许存档读档，不进入严肃排行榜。",
    descriptionEn: "For exploration. Saves and loads are allowed; not eligible for serious ladders.",
    allowsManualSave: true,
    allowsLoad: true,
    leaderboardEligible: false,
    fixedSeed: false,
    reloadPenaltyEnabled: false,
  },
  {
    id: "serious",
    labelZh: "严肃模式",
    labelEn: "Serious",
    descriptionZh: "历史可信度优先。允许读档，但低可信路线会被扣分。",
    descriptionEn: "Credibility first. Loading is allowed, but low-credibility routes are penalized.",
    allowsManualSave: true,
    allowsLoad: true,
    leaderboardEligible: true,
    fixedSeed: false,
    reloadPenaltyEnabled: true,
  },
  {
    id: "challenge",
    labelZh: "挑战模式",
    labelEn: "Challenge",
    descriptionZh: "本周固定 seed，限制读档，进入挑战榜。",
    descriptionEn: "Weekly fixed seed with limited reloads; eligible for challenge ladders.",
    allowsManualSave: true,
    allowsLoad: true,
    leaderboardEligible: true,
    fixedSeed: true,
    reloadPenaltyEnabled: true,
  },
  {
    id: "ironman",
    labelZh: "铁人模式",
    labelEn: "Ironman",
    descriptionZh: "禁止手动读档。行动不可撤销，单独进入铁人榜。",
    descriptionEn: "No manual loading. Actions are irreversible and scored on a separate ladder.",
    allowsManualSave: false,
    allowsLoad: false,
    leaderboardEligible: true,
    fixedSeed: true,
    reloadPenaltyEnabled: true,
  },
];

export function getGameModeDefinition(mode: GameMode): GameModeDefinition {
  return gameModes.find((item) => item.id === mode) ?? gameModes[0];
}

export function makeStandardSeed(): string {
  return `STANDARD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
