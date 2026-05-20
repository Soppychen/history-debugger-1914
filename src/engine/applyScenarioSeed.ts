import { clampVariable, createInitialState } from "../gameLogic";
import { createSeededRng } from "../random/seededRng";
import type { GameMode } from "../modes/gameModes";
import type { GameState, VariableDefinition } from "../types";

export interface VariablePerturbationRule {
  variableId: string;
  minDelta: number;
  maxDelta: number;
  mode: "weekly_challenge" | "standard_random" | "fixed";
}

export interface ScenarioSeedResult {
  state: GameState;
  appliedDeltas: Record<string, number>;
}

const perturbationRules: VariablePerturbationRule[] = [
  { variableId: "german_risk_perception", minDelta: -8, maxDelta: 8, mode: "standard_random" },
  { variableId: "media_agitation", minDelta: -10, maxDelta: 10, mode: "standard_random" },
  { variableId: "austrian_hardline", minDelta: -7, maxDelta: 7, mode: "standard_random" },
  { variableId: "british_redline_clarity", minDelta: -6, maxDelta: 6, mode: "standard_random" },
  { variableId: "russian_mobilization_pressure", minDelta: -7, maxDelta: 7, mode: "standard_random" },
  { variableId: "diplomatic_trust", minDelta: -8, maxDelta: 8, mode: "standard_random" },
  { variableId: "military_timetable_rigidity", minDelta: -5, maxDelta: 5, mode: "standard_random" },
  { variableId: "nationalist_pressure", minDelta: -6, maxDelta: 6, mode: "standard_random" },
];

const challengeOverrides: Record<string, number> = {
  british_redline_clarity: -8,
  media_agitation: 10,
  german_risk_perception: -6,
};

export function initializeSeededGameState(
  definitions: VariableDefinition[],
  seed: string,
  mode: GameMode,
): ScenarioSeedResult {
  const state = createInitialState(definitions);
  const appliedDeltas: Record<string, number> = {};
  const variables = { ...state.variables };

  if (mode === "challenge" || mode === "ironman") {
    Object.entries(challengeOverrides).forEach(([key, delta]) => {
      variables[key] = clampVariable((variables[key] ?? 0) + delta, key, definitions);
      appliedDeltas[key] = delta;
    });
  } else {
    const rng = createSeededRng(seed);
    perturbationRules.forEach((rule) => {
      const delta = Math.floor(rng() * (rule.maxDelta - rule.minDelta + 1)) + rule.minDelta;
      variables[rule.variableId] = clampVariable((variables[rule.variableId] ?? 0) + delta, rule.variableId, definitions);
      appliedDeltas[rule.variableId] = delta;
    });
  }

  return {
    state: {
      ...state,
      variables,
      lastChangedVariables: Object.keys(appliedDeltas),
      lastChangeDeltas: appliedDeltas,
    },
    appliedDeltas,
  };
}
