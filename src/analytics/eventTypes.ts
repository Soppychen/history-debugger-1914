import type { GameState } from "../types";

export type AnalyticsEventType =
  | "session_start"
  | "session_end"
  | "case_start"
  | "turn_start"
  | "turn_end"
  | "intel_opened"
  | "card_viewed"
  | "card_selected"
  | "card_used"
  | "card_locked_clicked"
  | "card_expired"
  | "variable_changed"
  | "risk_triggered"
  | "irreversible_event_triggered"
  | "advance_turn_clicked"
  | "advance_turn_confirmed"
  | "save_created"
  | "save_loaded"
  | "rollback_detected"
  | "ending_reached"
  | "restart_case"
  | "settings_changed"
  | "error_occurred";

export interface ConsentState {
  version: string;
  necessaryAccepted: boolean;
  analyticsAccepted: boolean;
  decidedAt: string | null;
}

export interface AnalyticsEvent {
  id: string;
  playerId: string;
  anonymousSessionId: string;
  caseId: string;
  saveId?: string;
  eventType: AnalyticsEventType;
  turn?: number;
  timestamp: string;
  payload: Record<string, unknown>;
  clientVersion: string;
  schemaVersion: string;
}

export interface AnalyticsEventInput {
  playerId: string;
  anonymousSessionId: string;
  type: AnalyticsEventType;
  turn?: number;
  saveId?: string;
  payload?: Record<string, unknown>;
  required?: boolean;
}

export type SaveSlotType = "auto" | "manual" | "ending_archive";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface SaveSummary {
  title: string;
  turnLabel: string;
  keyFlags: string[];
  usedCardsCount: number;
  irreversibleEvents: string[];
  currentRiskLevel: RiskLevel;
}

export interface SaveGame {
  id: string;
  playerId: string;
  caseId: string;
  slotType: SaveSlotType;
  slotName: string;
  turn: number;
  dateLabel: string;
  crisisStage: string;
  warProbability: number;
  gameState: GameState;
  summary: SaveSummary;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AdminAnalyticsSnapshot {
  generatedAt: string;
  playerCount: number;
  sessionCount: number;
  saveCount: number;
  eventCount: number;
  eventCounts: Record<string, number>;
  cardUsage: Array<{ cardId: string; count: number }>;
  endingCounts: Array<{ endingId: string; count: number }>;
  averageWarProbability: number;
  rollbackCount: number;
  recentEvents: AnalyticsEvent[];
  styleAverages: Record<string, number>;
  playerSummaries: PlayerAnalyticsSummary[];
}

export interface PlayerAnalyticsSummary {
  playerId: string;
  createdAt: string;
  lastSeenAt: string;
  analyticsConsent: boolean;
  eventCount: number;
  sessionCount: number;
  saveCount: number;
  latestTurn: number | null;
  latestWarProbability: number | null;
  endingsReached: string[];
  cardUsage: Array<{ cardId: string; count: number }>;
  eventCounts: Record<string, number>;
  styleScores: PlayerStyleScoreMap;
  recentEvents: AnalyticsEvent[];
}

export interface PlayerStyleScoreMap {
  archivist: number;
  diplomat: number;
  deterrence: number;
  institutionalist: number;
  riskTaker: number;
  rollbackExplorer: number;
}
