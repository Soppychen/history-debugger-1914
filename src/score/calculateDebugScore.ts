import type { DebugScoreInput, DebugScoreResult } from "./debugScoreTypes";

const endingBonusMap: Record<string, number> = {
  coercive_peace: 350,
  conference_freeze: 280,
  localized_war: 120,
  localized_war_controlled: 120,
  temporary_deescalation: 60,
  delayed_war: -50,
  total_war: -300,
  low_credibility_miracle: 80,
};

export function calculateDebugScore(input: DebugScoreInput): DebugScoreResult {
  const actionEfficiency = input.effectiveActionCount / Math.max(input.usedCardCount, 1);
  const intelRate = input.readIntelCount / Math.max(input.totalTurns, 1);
  const actionEfficiencyBonus = actionEfficiency >= 0.8 ? 100 : actionEfficiency >= 0.6 ? 50 : actionEfficiency < 0.35 ? -80 : 0;
  const intelQualityBonus = (intelRate >= 1.5 ? 60 : 0) + (intelRate < 0.5 ? -40 : 0);
  const reloadPenalty = input.mode === "standard" ? 0 : input.reloadCount * 10;
  const modeBonus = input.mode === "ironman" ? 120 : input.mode === "challenge" ? 40 : 0;
  const breakdown = {
    base: 1000,
    warProbabilityPenalty: -input.finalWarProbability * 5,
    credibilityBonus: input.historicalCredibility * 3,
    irreversiblePenalty: -input.irreversibleEventCount * 80,
    backlashPenalty: -input.backlashCount * 25,
    lowCredibilityPenalty: -input.lowCredibilityCardCount * 60,
    reloadPenalty: -reloadPenalty,
    localWarPenalty: -input.localWarCost * 2,
    endingBonus: endingBonusMap[input.endingType] ?? 0,
    actionEfficiencyBonus,
    intelQualityBonus,
    modeBonus,
  };
  const score = Math.max(0, Math.round(Object.values(breakdown).reduce((sum, value) => sum + value, 0)));
  return { score, grade: gradeScore(score), breakdown };
}

function gradeScore(score: number): DebugScoreResult["grade"] {
  if (score >= 1250) return "S";
  if (score >= 1050) return "A";
  if (score >= 850) return "B";
  if (score >= 650) return "C";
  if (score >= 450) return "D";
  return "F";
}
