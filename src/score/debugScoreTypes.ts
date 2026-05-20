import type { GameMode } from "../modes/gameModes";

export interface DebugScoreInput {
  mode: GameMode;
  endingType: string;
  finalWarProbability: number;
  historicalCredibility: number;
  irreversibleEventCount: number;
  backlashCount: number;
  lowCredibilityCardCount: number;
  reloadCount: number;
  localWarCost: number;
  usedCardCount: number;
  readIntelCount: number;
  effectiveActionCount: number;
  totalTurns: number;
}

export interface DebugScoreBreakdown {
  base: number;
  warProbabilityPenalty: number;
  credibilityBonus: number;
  irreversiblePenalty: number;
  backlashPenalty: number;
  lowCredibilityPenalty: number;
  reloadPenalty: number;
  localWarPenalty: number;
  endingBonus: number;
  actionEfficiencyBonus: number;
  intelQualityBonus: number;
  modeBonus: number;
}

export interface DebugScoreResult {
  score: number;
  grade: "S" | "A" | "B" | "C" | "D" | "F";
  breakdown: DebugScoreBreakdown;
}
