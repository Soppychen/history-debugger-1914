export type ToneStatus = "neutral" | "success" | "warning" | "danger";

export type InterventionCardVariant =
  | "default"
  | "hover"
  | "selected"
  | "apInsufficient"
  | "requirementLocked"
  | "eventLocked"
  | "expiringThisTurn"
  | "expiredMissedWindow"
  | "used"
  | "backlashTriggered";

export type IntelCardVariant = "unread" | "read" | "important" | "unlocksCard" | "disputedSource";

export type VariableBarStatus =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "increasedThisTurn"
  | "decreasedThisTurn"
  | "locked";

export type TimelineNodeStatus = "past" | "current" | "future" | "warning" | "irreversible" | "missed" | "locked";

export type TopStatusBarStatus = "stable" | "tense" | "ultimatum" | "mobilization" | "warImminent" | "irreversible";

export type AdvanceTurnConfirmVariant = "standard" | "warning" | "critical";

export type TimeAdvanceReportVariant = "standard" | "pressure" | "backlash" | "irreversible";

export type EndingReportVariant =
  | "totalWar"
  | "delayedWar"
  | "localizedWar"
  | "conferenceFreeze"
  | "coercivePeace"
  | "special"
  | "fallback";

export function getVariableBarStatus(delta: number, value: number): VariableBarStatus {
  if (delta > 0) return "increasedThisTurn";
  if (delta < 0) return "decreasedThisTurn";
  if (value >= 85) return "critical";
  if (value >= 70) return "high";
  if (value >= 40) return "medium";
  return "low";
}

export function getTopStatusBarStatus(warProbability: number): TopStatusBarStatus {
  if (warProbability >= 90) return "irreversible";
  if (warProbability >= 75) return "warImminent";
  if (warProbability >= 60) return "mobilization";
  if (warProbability >= 45) return "ultimatum";
  if (warProbability >= 30) return "tense";
  return "stable";
}

export function getAdvanceTurnConfirmVariant(warProbability: number): AdvanceTurnConfirmVariant {
  if (warProbability >= 75) return "critical";
  if (warProbability >= 50) return "warning";
  return "standard";
}

export function getTimeAdvanceReportVariant(maxDelta: number): TimeAdvanceReportVariant {
  if (maxDelta >= 10) return "irreversible";
  if (maxDelta >= 6) return "backlash";
  if (maxDelta > 0) return "pressure";
  return "standard";
}

export function getEndingReportVariant(type: string): EndingReportVariant {
  if (type === "total_war") return "totalWar";
  if (type === "delayed_war") return "delayedWar";
  if (type === "localized_war") return "localizedWar";
  if (type === "conference_freeze") return "conferenceFreeze";
  if (type === "coercive_peace") return "coercivePeace";
  if (type === "low_credibility_miracle") return "special";
  return "fallback";
}
