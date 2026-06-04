import type {
  ActionLogEntry,
  ChangeRecord,
  Condition,
  DataBundle,
  EndingDefinition,
  FlagEffect,
  GameState,
  InterventionCard,
  IrreversibleNode,
  SpecialRule,
  VariableDefinition,
  VariableEffect,
  VariableMap,
} from "./types";
import type { TopStatusBarStatus } from "./design/componentVariants";

export function createInitialState(definitions: VariableDefinition[]): GameState {
  return {
    turn: 1,
    ap: 2,
    maxAp: 2,
    variables: Object.fromEntries(
      definitions.map((definition) => [definition.key, definition.initialValue]),
    ),
    flags: {},
    usedCardIds: [],
    lowFeasibilityCardsUsed: 0,
    revealedIntelIds: [],
    triggeredNodeIds: [],
    lockedCardIds: [],
    unlockedCardIds: [],
    actionLog: [],
    ending: null,
    lastChangedVariables: [],
    lastChangeDeltas: {},
  };
}

export function clampVariable(
  value: number,
  key: string,
  definitions: VariableDefinition[],
): number {
  const definition = definitions.find((item) => item.key === key);
  const min = definition?.min ?? 0;
  const max = definition?.max ?? 100;
  return Math.min(max, Math.max(min, value));
}

export function evaluateCondition(condition: Condition, state: GameState): boolean {
  const value = condition.key ? state.variables[condition.key] : undefined;
  const triggeredNodeIds = state.triggeredNodeIds ?? [];

  switch (condition.type) {
    case "variable_min":
      return typeof value === "number" && value >= Number(condition.value);
    case "variable_max":
      return typeof value === "number" && value <= Number(condition.value);
    case "flag_exists":
      return Boolean(condition.key && state.flags[condition.key] === condition.value);
    case "turn_min":
      return state.turn >= Number(condition.value);
    case "turn_max":
      return state.turn <= Number(condition.value);
    case "card_used":
      return Boolean(condition.key && state.usedCardIds.includes(condition.key));
    case "cards_used_min":
      if (condition.key === "low_feasibility_cards") {
        return getLowFeasibilityCardCount(state) >= Number(condition.value);
      }
      return state.usedCardIds.length >= Number(condition.value);
    case "node_active":
      return Boolean(condition.key && triggeredNodeIds.includes(condition.key) === Boolean(condition.value));
    default:
      return false;
  }
}

export function evaluateConditions(conditions: Condition[] = [], state: GameState): boolean {
  return conditions.every((condition) => evaluateCondition(condition, state));
}

export function getRequirementFailure(card: InterventionCard, state: GameState): string | null {
  const lockedCardIds = state.lockedCardIds ?? [];
  if (state.usedCardIds.includes(card.id)) {
    return "本局已使用";
  }
  if (lockedCardIds.includes(card.id)) {
    return "被不可逆节点锁死";
  }
  if (state.turn < card.turnRange[0] || state.turn > card.turnRange[1]) {
    if (state.turn > card.turnRange[1]) {
      return `已错过：历史窗口已在第 ${card.turnRange[1]} 回合关闭`;
    }
    return `仅限回合 ${card.turnRange[0]}-${card.turnRange[1]}`;
  }
  const failed = card.requirements.find((requirement) => !evaluateCondition(requirement, state));
  if (failed) {
    return explainCondition(failed);
  }
  return null;
}

export function explainCondition(condition: Condition): string {
  if (condition.type === "turn_min") return `需要回合 >= ${condition.value}`;
  if (condition.type === "turn_max") return `需要回合 <= ${condition.value}`;
  if (condition.type === "variable_min") return `${condition.key} 需要 >= ${condition.value}`;
  if (condition.type === "variable_max") return `${condition.key} 需要 <= ${condition.value}`;
  if (condition.type === "flag_exists") return `需要标记 ${condition.key} = ${String(condition.value)}`;
  if (condition.type === "card_used") return `需要已使用 ${condition.key}`;
  if (condition.type === "cards_used_min") return `需要已用卡数 >= ${condition.value}`;
  if (condition.type === "node_active") return `需要不可逆节点 ${condition.key} ${condition.value ? "已触发" : "未触发"}`;
  return "条件不满足";
}

export function applyEffects(
  variables: VariableMap,
  effects: VariableEffect[],
  definitions: VariableDefinition[],
): { variables: VariableMap; changes: ChangeRecord[] } {
  const nextVariables = { ...variables };
  const changes = effects.map((effect) => {
    const before = nextVariables[effect.variable] ?? 0;
    const after = clampVariable(before + effect.delta, effect.variable, definitions);
    nextVariables[effect.variable] = after;
    return { ...effect, before, after };
  });

  return { variables: nextVariables, changes };
}

export function applyFlagEffects(
  flags: GameState["flags"],
  effects: FlagEffect[] = [],
): GameState["flags"] {
  const nextFlags = { ...flags };
  effects.forEach((effect) => {
    nextFlags[effect.flag] = effect.value;
  });
  return nextFlags;
}

export function applyCard(
  state: GameState,
  card: InterventionCard,
  definitions: VariableDefinition[],
): GameState {
  const base = applyEffects(state.variables, card.effects, definitions);
  let variables = base.variables;

  const triggeredRisks = card.risks
    .filter((risk) => evaluateConditions(risk.conditions, { ...state, variables }))
    .map((risk) => {
      const result = applyEffects(variables, risk.effects, definitions);
      variables = result.variables;
      return {
        id: risk.id,
        description: risk.description,
        effects: result.changes,
      };
    });

  const flagEffects = [...(card.flagsAdded ?? []), ...(card.flags ?? [])];
  const nextFlags = applyFlagEffects(state.flags, flagEffects);
  const log: ActionLogEntry = {
    id: `${state.turn}-${card.id}-${state.actionLog.length + 1}`,
    turn: state.turn,
    kind: "card",
    title: card.name,
    description: card.description,
    effects: base.changes,
    risks: triggeredRisks,
    flagsAdded: flagEffects,
    flavor: card.flavor,
  };

  const changed = [
    ...base.changes.map((change) => change.variable),
    ...triggeredRisks.flatMap((risk) => risk.effects.map((change) => change.variable)),
  ];
  const allChanges = [
    ...base.changes,
    ...triggeredRisks.flatMap((risk) => risk.effects),
  ];

  return {
    ...state,
    ap: state.ap - card.cost,
    variables,
    flags: nextFlags,
    usedCardIds: [...state.usedCardIds, card.id],
    lowFeasibilityCardsUsed: state.lowFeasibilityCardsUsed + (card.feasibility === "C" ? 1 : 0),
    actionLog: [log, ...state.actionLog],
    lastChangedVariables: Array.from(new Set(changed)),
    lastChangeDeltas: getChangeDeltas(allChanges),
  };
}

export function applyTurnPressure(
  state: GameState,
  rule: { defaultPressure: VariableEffect[]; specialRules: SpecialRule[]; title: string },
  definitions: VariableDefinition[],
): GameState {
  const pressure = applyEffects(state.variables, rule.defaultPressure, definitions);
  let variables = pressure.variables;
  let flags = state.flags;
  const specialLogs = rule.specialRules
    .filter((specialRule) => evaluateConditions(specialRule.conditions, { ...state, variables, flags }))
    .map((specialRule) => {
      const result = applyEffects(variables, specialRule.effects, definitions);
      variables = result.variables;
      flags = applyFlagEffects(flags, specialRule.flags ?? []);
      return {
        id: specialRule.id,
        description: specialRule.description,
        effects: result.changes,
        flagsAdded: specialRule.flags ?? [],
      };
    });

  const log: ActionLogEntry = {
    id: `turn-${state.turn}-${state.actionLog.length + 1}`,
    turn: state.turn,
    kind: "turn",
    title: `${rule.title}：历史压力`,
    description: "推进回合时，系统应用了本回合默认压力和已满足的特殊规则。",
    effects: pressure.changes,
    risks: specialLogs.map((entry) => ({
      id: entry.id,
      description: entry.description,
      effects: entry.effects,
    })),
    flagsAdded: specialLogs.flatMap((entry) => entry.flagsAdded),
  };

  const changed = [
    ...pressure.changes.map((change) => change.variable),
    ...specialLogs.flatMap((entry) => entry.effects.map((change) => change.variable)),
  ];
  const allChanges = [
    ...pressure.changes,
    ...specialLogs.flatMap((entry) => entry.effects),
  ];

  return {
    ...state,
    variables,
    flags,
    actionLog: [log, ...state.actionLog],
    lastChangedVariables: Array.from(new Set(changed)),
    lastChangeDeltas: getChangeDeltas(allChanges),
  };
}

export function applyIrreversibleNodes(
  state: GameState,
  nodes: IrreversibleNode[],
  definitions: VariableDefinition[],
): { state: GameState; triggeredNodes: IrreversibleNode[] } {
  let nextState: GameState = normalizeGameState(state);
  const triggeredNodes: IrreversibleNode[] = [];

  for (const node of nodes) {
    if ((nextState.triggeredNodeIds ?? []).includes(node.id)) continue;
    if (node.triggerTurn && nextState.turn < node.triggerTurn) continue;
    if (!evaluateConditions(node.conditions, nextState)) continue;

    const result = applyEffects(nextState.variables, node.effects, definitions);
    const lockedCardIds = Array.from(new Set([...(nextState.lockedCardIds ?? []), ...node.lockedCardIds]));
    const unlockedCardIds = Array.from(new Set([...(nextState.unlockedCardIds ?? []), ...node.unlockedCardIds]));
    const log: ActionLogEntry = {
      id: `node-${nextState.turn}-${node.id}-${nextState.actionLog.length + triggeredNodes.length + 1}`,
      turn: nextState.turn,
      kind: "irreversible",
      nodeId: node.id,
      title: node.title,
      description: node.reportText,
      effects: result.changes,
      risks: [],
      flagsAdded: [{ flag: node.id, value: true }],
    };

    nextState = {
      ...nextState,
      variables: result.variables,
      flags: { ...nextState.flags, [node.id]: true },
      triggeredNodeIds: [...(nextState.triggeredNodeIds ?? []), node.id],
      lockedCardIds,
      unlockedCardIds,
      actionLog: [log, ...nextState.actionLog],
      lastChangedVariables: Array.from(new Set([
        ...nextState.lastChangedVariables,
        ...result.changes.map((change) => change.variable),
      ])),
      lastChangeDeltas: {
        ...nextState.lastChangeDeltas,
        ...getChangeDeltas(result.changes),
      },
    };
    triggeredNodes.push(node);
  }

  return { state: nextState, triggeredNodes };
}

export function findEnding(state: GameState, endings: EndingDefinition[]): EndingDefinition | null {
  const candidates = endings.filter((ending) => evaluateConditions(ending.conditions, state));
  return candidates.sort((a, b) => b.priority - a.priority)[0] ?? null;
}

export function shouldEndImmediately(state: GameState, endings: EndingDefinition[]): EndingDefinition | null {
  return findEnding(state, endings.filter((ending) => ending.type === "total_war"));
}

export function getRiskStage(warProbability: number): "stable" | "warning" | "critical" {
  if (warProbability < 40) return "stable";
  if (warProbability < 70) return "warning";
  return "critical";
}

export function getVisibleCards(data: DataBundle, state: GameState): InterventionCard[] {
  const current = data.timeline.find((turn) => turn.turn === state.turn);
  const recommended = new Set(current?.recommendedCards ?? []);
  const intelUnlocks = data.intelCards
    .filter((intel) => state.revealedIntelIds.includes(intel.id))
    .flatMap((intel) => intel.unlocks);
  const unlocked = new Set([...intelUnlocks, ...state.usedCardIds, ...(state.unlockedCardIds ?? [])]);
  const locked = new Set(state.lockedCardIds ?? []);

  return data.interventionCards.filter((card) => {
    const inTurnRange = state.turn >= card.turnRange[0] && state.turn <= card.turnRange[1];
    const recentlyMissed = card.turnRange[1] < state.turn && card.turnRange[1] >= state.turn - 2 && !state.usedCardIds.includes(card.id);
    const eventLockedVisible = locked.has(card.id) && card.turnRange[1] >= state.turn - 2;
    return (inTurnRange || recentlyMissed || eventLockedVisible) && (recommended.has(card.id) || unlocked.has(card.id) || card.requirements.length === 0 || locked.has(card.id));
  });
}

export function getLowFeasibilityCardCount(state: GameState): number {
  return state.lowFeasibilityCardsUsed;
}

export function deriveCrisisStage(state: GameState): TopStatusBarStatus {
  const warProbability = state.variables.war_probability ?? 0;
  if (state.flags.germany_invaded_belgium || warProbability >= 85) return "irreversible";
  if (warProbability >= 75) return "warImminent";
  if (state.flags.russian_general_mobilization || state.turn >= 8) return "mobilization";
  if (state.turn >= 5 || state.flags.ultimatum_harshness) return "ultimatum";
  if (warProbability >= 50 || state.turn >= 3) return "tense";
  return "stable";
}

export function getCrisisStageLabel(status: TopStatusBarStatus): string {
  if (status === "stable") return "可控";
  if (status === "tense") return "紧张";
  if (status === "ultimatum") return "最后通牒阶段";
  if (status === "mobilization") return "动员阶段";
  if (status === "warImminent") return "战争迫近";
  return "系统不可逆";
}

export function getExpiredCards(data: DataBundle, state: GameState, lookback = 2): InterventionCard[] {
  return data.interventionCards.filter((card) => {
    return card.turnRange[1] < state.turn && card.turnRange[1] >= state.turn - lookback && !state.usedCardIds.includes(card.id);
  });
}

export function getExpiringCards(cards: InterventionCard[], state: GameState): InterventionCard[] {
  return cards.filter((card) => !state.usedCardIds.includes(card.id) && card.turnRange[1] === state.turn);
}

export function getUpcomingCrisisEvents(data: DataBundle, state: GameState, limit = 5) {
  if (data.crisisEvents?.length) {
    return data.crisisEvents
      .filter((event) => event.turn > state.turn)
      .sort((a, b) => a.turn - b.turn)
      .slice(0, limit)
      .map((event) => {
        const warDelta = event.effectsPreview.find((effect) => effect.variable === "war_probability")?.delta ?? 0;
        const maxDelta = Math.max(0, ...event.effectsPreview.map((effect) => effect.delta));
        const turnsUntil = event.turn - state.turn;
        const severity = event.eventType === "irreversible" || event.eventType === "war_threshold" || turnsUntil <= 1 || warDelta >= 7 || maxDelta >= 8
          ? "critical"
          : turnsUntil <= 2 || warDelta >= 5
            ? "high"
            : turnsUntil <= 3
              ? "medium"
              : "low";

        return {
          id: event.id,
          title: event.title,
          dateRange: data.timeline.find((turn) => turn.turn === event.turn)?.dateRange ?? `Turn ${event.turn}`,
          turnsUntil,
          riskSummary: event.description,
          relatedVariables: Array.from(new Set(event.effectsPreview.map((effect) => effect.variable))).slice(0, 4),
          severity,
          eventType: event.eventType,
          effectsPreview: event.effectsPreview,
          relatedCardIds: event.relatedCardIds,
          interventionWindow: event.interventionWindow,
          irreversibleNodeId: event.irreversibleNodeId,
        };
      });
  }

  return data.timeline
    .filter((turn) => turn.turn > state.turn)
    .slice(0, limit)
    .map((turn) => {
      const warDelta = turn.defaultPressure.find((effect) => effect.variable === "war_probability")?.delta ?? 0;
      const maxDelta = Math.max(0, ...turn.defaultPressure.map((effect) => effect.delta));
      const turnsUntil = turn.turn - state.turn;
      const severity = turnsUntil <= 1 || warDelta >= 7 || maxDelta >= 8
        ? "critical"
        : turnsUntil <= 2 || warDelta >= 5
          ? "high"
          : turnsUntil <= 3
            ? "medium"
            : "low";

      return {
        id: `turn-${turn.turn}`,
        title: turn.title,
        dateRange: turn.dateRange,
        turnsUntil,
        riskSummary: turn.goalHint,
        relatedVariables: Array.from(new Set(turn.defaultPressure.map((effect) => effect.variable))).slice(0, 4),
        severity,
      };
    });
}

export function getOpportunityCosts(data: DataBundle, state: GameState, visibleCards: InterventionCard[]) {
  const current = data.timeline.find((turn) => turn.turn === state.turn);
  const variableRisks = Object.entries(state.variables)
    .filter(([, value]) => value >= 70)
    .map(([key, value]) => `${key} 已达 ${value}`);
  const pressureRisks = (current?.defaultPressure ?? [])
    .filter((effect) => effect.delta > 0)
    .slice(0, 3)
    .map((effect) => `${effect.variable} 将 ${effect.delta > 0 ? "+" : ""}${effect.delta}`);
  const expiring = getExpiringCards(visibleCards, state).map((card) => `${card.id}「${card.name}」本回合后失效`);

  return [...expiring, ...variableRisks, ...pressureRisks].slice(0, 6);
}

export function getIrreversibleFlags(state: GameState): string[] {
  const flagBased = Object.keys(state.flags).filter((key) => {
    return /mobilization|invaded|declared_war|rejected|harshness|irreversible/i.test(key);
  });
  return Array.from(new Set([...(state.triggeredNodeIds ?? []), ...flagBased]));
}

export function normalizeGameState(state: GameState): GameState {
  return {
    ...state,
    triggeredNodeIds: state.triggeredNodeIds ?? [],
    lockedCardIds: state.lockedCardIds ?? [],
    unlockedCardIds: state.unlockedCardIds ?? [],
    revealedIntelIds: state.revealedIntelIds ?? [],
    lastChangedVariables: state.lastChangedVariables ?? [],
    lastChangeDeltas: state.lastChangeDeltas ?? {},
  };
}

function getChangeDeltas(changes: ChangeRecord[]): Record<string, number> {
  return changes.reduce<Record<string, number>>((deltas, change) => {
    deltas[change.variable] = (deltas[change.variable] ?? 0) + change.delta;
    return deltas;
  }, {});
}
