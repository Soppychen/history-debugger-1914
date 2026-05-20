import type { GameMode } from "../modes/gameModes";
import type { DebugScoreResult } from "../score/debugScoreTypes";

export type LeaderboardType =
  | "debug_score"
  | "lowest_war_probability"
  | "credible_peace"
  | "minimal_intervention"
  | "ironman"
  | "personal";

export type LeaderboardSubmissionStatus = "verified" | "unverified" | "flagged" | "rejected";

export interface RunRecord {
  id: string;
  playerId: string;
  caseId: string;
  mode: GameMode;
  seed: string;
  startedAt: string;
  completedAt?: string;
  endingType?: string;
  debugScore?: number;
  grade?: DebugScoreResult["grade"];
  finalWarProbability?: number;
  historicalCredibility?: number;
  irreversibleEventCount?: number;
  backlashCount?: number;
  usedCardCount?: number;
  readIntelCount?: number;
  reloadCount?: number;
  actionSequenceHash?: string;
  reportId?: string;
}

export interface LeaderboardEntry {
  id: string;
  leaderboardId: string;
  leaderboardType: LeaderboardType;
  playerId: string;
  displayName: string;
  runId: string;
  rank?: number;
  mode: GameMode;
  seed: string;
  endingType: string;
  debugScore: number;
  grade: DebugScoreResult["grade"];
  finalWarProbability: number;
  historicalCredibility: number;
  irreversibleEventCount: number;
  usedCardCount: number;
  reloadCount: number;
  completionTimeSeconds: number;
  reportId: string;
  status: LeaderboardSubmissionStatus;
  createdAt: string;
}

export interface LeaderboardDefinition {
  id: string;
  titleZh: string;
  titleEn: string;
  type: LeaderboardType;
}

export interface RunCompletionInput {
  playerId: string;
  displayName: string;
  run: RunRecord;
  endingType: string;
  debugScoreResult: DebugScoreResult;
  finalWarProbability: number;
  historicalCredibility: number;
  irreversibleEventCount: number;
  usedCardCount: number;
  readIntelCount: number;
  reloadCount: number;
  reportId: string;
}

export const leaderboardDefinitions: LeaderboardDefinition[] = [
  { id: "hdb-total", titleZh: "HDB 总评榜", titleEn: "HDB Overall", type: "debug_score" },
  { id: "lowest-war", titleZh: "最低战争风险", titleEn: "Lowest War Risk", type: "lowest_war_probability" },
  { id: "credible-peace", titleZh: "可信和平榜", titleEn: "Credible Peace", type: "credible_peace" },
  { id: "minimal-intervention", titleZh: "最小干预榜", titleEn: "Minimal Intervention", type: "minimal_intervention" },
  { id: "ironman", titleZh: "铁人调试榜", titleEn: "Ironman Debugging", type: "ironman" },
  { id: "personal", titleZh: "个人历史榜", titleEn: "Personal History", type: "personal" },
];
