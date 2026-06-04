import type {
  ActionLogEntry,
  EndingDefinition,
  GameState,
  InterventionCard,
  TimelineTurn,
  VariableDefinition,
} from "../types";
import type {
  CausalChainNode,
  EndingAnalysis,
  EndingFactor,
  EndingGrade,
  EndingReport,
  FinalVariableReport,
  PlayerActionSummary,
  PlayerStyleSummary,
  RiskLevel,
  VariablePolarity,
} from "../endingReportTypes";
import type { Language } from "../i18n";

const betterWhenHigh = new Set([
  "serbian_compromise",
  "german_risk_perception",
  "british_redline_clarity",
  "diplomatic_trust",
]);

const neutralVariables = new Set(["franco_russian_coordination"]);

const importantVariables = [
  "war_probability",
  "austrian_hardline",
  "serbian_compromise",
  "russian_mobilization_pressure",
  "german_risk_perception",
  "british_redline_clarity",
  "military_timetable_rigidity",
  "media_agitation",
  "diplomatic_trust",
  "alliance_lock_in",
  "nationalist_pressure",
];

export function generateEndingReport(input: {
  caseId: string;
  caseName: string;
  dateRange: string;
  finalGameState: GameState;
  variables: VariableDefinition[];
  timeline: TimelineTurn[];
  interventionCards?: InterventionCard[];
  ending: EndingDefinition;
  language: Language;
}): EndingReport {
  const finalWarProbability = input.finalGameState.variables.war_probability ?? 0;
  const finalVariables = buildFinalVariables(input.variables, input.finalGameState);
  const keyPlayerActions = buildKeyPlayerActions(input.finalGameState.actionLog, input.language);
  const irreversibleFlags = Object.keys(input.finalGameState.flags).filter((flag) => /mobilization|invaded|declared_war|rejected|harshness|irreversible/i.test(flag));
  const historicalCredibility = calculateCredibility(input.ending, finalVariables, irreversibleFlags, input.finalGameState);
  const grade = calculateGrade(input.ending.type, finalWarProbability, historicalCredibility, irreversibleFlags.length);
  const analysis = buildAnalysis(input.ending, finalVariables, irreversibleFlags, input.language);
  const keyCausalChain = buildCausalChain(input, finalVariables, keyPlayerActions, irreversibleFlags);
  const playerStyle = buildPlayerStyle(input.finalGameState, input.language);
  const executiveSummary = buildExecutiveSummary(input.ending, finalVariables, keyPlayerActions, input.language);
  const missedWindows = buildMissedWindows(input.finalGameState, input.interventionCards ?? [], input.language);
  const finalVariableHighlights = finalVariables
    .filter((variable) => variable.riskLevel === "critical" || variable.riskLevel === "high")
    .slice(0, 4)
    .map((variable) => ({
      variableId: variable.id,
      value: variable.value,
      reason: localized(input.language, `${variable.label} 处于${variable.riskLevel === "critical" ? "临界" : "高压"}区间。`, `${variable.label} remains in a ${variable.riskLevel} band.`),
    }));

  return {
    id: `ending-report-${input.finalGameState.turn}-${input.ending.id}`,
    caseId: input.caseId,
    caseName: input.caseName,
    dateRange: input.dateRange,
    endingType: input.ending.type,
    endingTitle: input.ending.title,
    grade,
    historicalCredibility,
    finalWarProbability,
    executiveSummary,
    finalVariables,
    keyCausalChain,
    keyPlayerActions,
    missedWindows,
    irreversibleNodesTriggered: input.finalGameState.triggeredNodeIds ?? irreversibleFlags,
    finalVariableHighlights,
    analysis,
    playerStyle,
    shareCard: {
      title: "历史现场调试器：1914",
      endingTitle: input.ending.title,
      grade,
      historicalCredibility,
      finalWarProbability,
      playerStyleLabel: playerStyle.label,
      quote: input.ending.shareLine,
    },
    createdAt: new Date().toISOString(),
  };
}

function buildMissedWindows(state: GameState, cards: InterventionCard[], language: Language): string[] {
  const used = new Set(state.usedCardIds);
  const locked = new Set(state.lockedCardIds ?? []);
  const turn = state.turn;
  const expired = cards
    .filter((card) => !used.has(card.id) && card.turnRange[1] < turn)
    .sort((a, b) => a.turnRange[1] - b.turnRange[1])
    .slice(0, 4)
    .map((card) => localized(language, `${card.id}「${card.name}」在第 ${card.turnRange[1]} 回合后失效。`, `${card.id} ${card.name} expired after turn ${card.turnRange[1]}.`));
  const eventLocked = cards
    .filter((card) => locked.has(card.id))
    .slice(0, 3)
    .map((card) => localized(language, `${card.id}「${card.name}」被不可逆节点关闭。`, `${card.id} ${card.name} was closed by an irreversible node.`));
  return [...eventLocked, ...expired].slice(0, 6);
}

function buildFinalVariables(definitions: VariableDefinition[], state: GameState): FinalVariableReport[] {
  const byKey = new Map(definitions.map((definition) => [definition.key, definition]));
  return importantVariables
    .map((key) => byKey.get(key))
    .filter((definition): definition is VariableDefinition => Boolean(definition))
    .map((definition) => {
      const value = state.variables[definition.key] ?? definition.initialValue;
      const delta = value - definition.initialValue;
      const polarity = getPolarity(definition.key);
      return {
        id: definition.key,
        label: definition.label,
        value,
        initialValue: definition.initialValue,
        delta,
        polarity,
        riskLevel: getRiskLevel(value, polarity),
        explanation: getVariableExplanation(definition.key, polarity, definition.label),
      };
    });
}

function getPolarity(key: string): VariablePolarity {
  if (betterWhenHigh.has(key)) return "higher_is_better";
  if (neutralVariables.has(key)) return "neutral";
  return "higher_is_worse";
}

function getRiskLevel(value: number, polarity: VariablePolarity): RiskLevel {
  const riskValue = polarity === "higher_is_better" ? 100 - value : value;
  if (riskValue >= 85) return "critical";
  if (riskValue >= 70) return "high";
  if (riskValue >= 40) return "medium";
  return "low";
}

function calculateCredibility(ending: EndingDefinition, variables: FinalVariableReport[], irreversibleFlags: string[], state: GameState): number {
  const highRiskCount = variables.filter((variable) => variable.riskLevel === "high" || variable.riskLevel === "critical").length;
  const lowFeasibilityPenalty = state.lowFeasibilityCardsUsed * 4;
  const irreversiblePenalty = irreversibleFlags.length * 7;
  const residualRiskPenalty = Math.max(0, highRiskCount - 3) * 3;
  const miraclePenalty = ending.type === "low_credibility_miracle" ? 18 : 0;
  return clamp(Math.round(ending.credibilityScore - lowFeasibilityPenalty - irreversiblePenalty - residualRiskPenalty - miraclePenalty), 5, 98);
}

function calculateGrade(endingType: string, warProbability: number, credibility: number, irreversibleCount: number): EndingGrade {
  const base: Record<string, number> = {
    coercive_peace: 92,
    conference_freeze: 84,
    localized_war: 70,
    temporary_deescalation: 64,
    delayed_war: 46,
    low_credibility_miracle: 78,
    total_war: 20,
  };
  const score = (base[endingType] ?? 55) - Math.max(0, warProbability - 45) * 0.35 + (credibility - 60) * 0.2 - irreversibleCount * 4;
  if (score >= 90) return "S";
  if (score >= 78) return "A";
  if (score >= 64) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

function buildKeyPlayerActions(actionLog: ActionLogEntry[], language: Language): PlayerActionSummary[] {
  return actionLog
    .filter((action) => action.kind === "card")
    .map((action) => {
      const variableDeltas = action.effects.reduce<Record<string, number>>((acc, effect) => {
        acc[effect.variable] = (acc[effect.variable] ?? 0) + effect.delta;
        return acc;
      }, {});
      const impact = Object.values(variableDeltas).reduce((sum, delta) => sum + Math.abs(delta), 0) + action.risks.length * 10;
      return { action, variableDeltas, impact };
    })
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5)
    .map(({ action, variableDeltas }) => ({
      cardId: action.id.split("-").slice(1, -1).join("-") || action.id,
      cardName: action.title,
      turn: action.turn,
      effectSummary: action.effects.map((effect) => `${effect.variable} ${formatDelta(effect.delta)}`).join(" / ") || localized(language, "无变量变化", "No variable changes"),
      variableDeltas,
      evaluation: evaluateAction(action),
      explanation: action.risks.length > 0
        ? localized(language, "该行动影响显著，但触发了反噬，需要在复盘中重点检查。", "This action had visible impact, but triggered backlash and should be reviewed carefully.")
        : localized(language, "该行动对关键变量产生了可见影响，是本局因果链的重要节点。", "This action visibly changed key variables and became an important causal node in the run."),
    }));
}

function evaluateAction(action: ActionLogEntry): PlayerActionSummary["evaluation"] {
  if (action.risks.length > 0) return "mixed";
  const warDelta = action.effects.find((effect) => effect.variable === "war_probability")?.delta ?? 0;
  if (warDelta < 0) return "effective";
  if (warDelta > 0) return "harmful";
  return action.turn >= 10 ? "too_late" : "mixed";
}

function buildCausalChain(input: {
  finalGameState: GameState;
  timeline: TimelineTurn[];
  ending: EndingDefinition;
  language: Language;
}, variables: FinalVariableReport[], actions: PlayerActionSummary[], irreversibleFlags: string[]): CausalChainNode[] {
  const firstTurn = input.timeline[0];
  const highRiskVariables = variables
    .filter((variable) => variable.riskLevel === "high" || variable.riskLevel === "critical")
    .slice(0, 2);
  const actionNode = actions[0];

  const chain: CausalChainNode[] = [
    {
      id: "spark",
      label: firstTurn?.title ?? "萨拉热窝刺杀",
      type: "event" as const,
      turn: 1,
      dateLabel: firstTurn?.dateRange,
      severity: "medium" as const,
      description: firstTurn?.goalHint ?? "危机由刺杀事件进入政治解释系统。",
    },
    ...highRiskVariables.map<CausalChainNode>((variable) => ({
      id: `variable-${variable.id}`,
      label: variable.label,
      type: "variable",
      severity: variable.riskLevel,
      description: localized(input.language, `${variable.label} 最终达到 ${variable.value}，相比初始值 ${formatDelta(variable.delta)}。`, `${variable.label} ended at ${variable.value}, ${formatDelta(variable.delta)} from its initial value.`),
    })),
    ...irreversibleFlags.slice(0, 1).map<CausalChainNode>((flag) => ({
      id: `flag-${flag}`,
      label: flag,
      type: "irreversible",
      severity: "critical",
      description: localized(input.language, "该不可逆标记说明军事或外交系统已经进入低回滚状态。", "This irreversible flag indicates that the military or diplomatic system has entered a low-rollback state."),
    })),
    ...(actionNode ? [{
      id: `action-${actionNode.cardId}`,
      label: actionNode.cardName,
      type: "player_action" as const,
      turn: actionNode.turn,
      severity: actionNode.evaluation === "effective" ? "low" as const : "medium" as const,
      description: actionNode.explanation,
    }] : []),
    {
      id: "ending",
      label: input.ending.title,
      type: "ending" as const,
      turn: input.finalGameState.turn,
      severity: input.ending.type === "total_war" ? "critical" : input.ending.type === "coercive_peace" ? "low" : "medium",
      description: input.ending.summary,
    },
  ];
  return chain.slice(0, 6);
}

function buildAnalysis(ending: EndingDefinition, variables: FinalVariableReport[], irreversibleFlags: string[], language: Language): EndingAnalysis {
  const mode: EndingAnalysis["mode"] = ending.type === "total_war" || ending.type === "delayed_war"
    ? "failure"
    : ending.type === "coercive_peace" || ending.type === "conference_freeze"
      ? "stability"
      : "mixed";
  const riskVariables = variables
    .filter((variable) => variable.riskLevel === "high" || variable.riskLevel === "critical")
    .slice(0, 3);
  const stabilizers = variables
    .filter((variable) => variable.polarity === "higher_is_better" && variable.value >= 55)
    .slice(0, 3);
  const source = mode === "stability" ? stabilizers : riskVariables;
  const primaryFactors = source.length > 0 ? source.map<EndingFactor>((variable) => ({
    title: variable.label,
    severity: variable.riskLevel,
    explanation: mode === "stability"
      ? localized(language, `${variable.label} 保持在 ${variable.value}，为危机降温提供了结构性支撑。`, `${variable.label} remained at ${variable.value}, providing structural support for de-escalation.`)
      : localized(language, `${variable.label} 达到 ${variable.value}，成为推动系统走向该结局的重要压力。`, `${variable.label} reached ${variable.value}, becoming one of the main pressures behind this outcome.`),
    relatedVariables: [variable.id],
    relatedEvents: [],
  })) : [{
    title: ending.title,
    severity: (mode === "failure" ? "critical" : "medium") as RiskLevel,
    explanation: localized(language, "当前数据不足以定位单一主因，结局更可能来自多变量耦合。", "The data does not isolate one single cause; this ending is more likely the result of coupled variables."),
    relatedVariables: [],
    relatedEvents: [],
  } satisfies EndingFactor];

  return {
    mode,
    primaryFactors,
    credibilityNote: localized(language, "可信度并不表示真实历史概率，而表示本局反事实路径与结构约束的相容程度。", "Credibility is not a real historical probability; it measures how compatible this counterfactual path is with structural constraints."),
    residualRisks: [
      ...riskVariables.map((variable) => localized(language, `${variable.label} 仍处于 ${variable.riskLevel} 区间。`, `${variable.label} remains in the ${variable.riskLevel} band.`)),
      ...irreversibleFlags.map((flag) => localized(language, `不可逆标记仍存在：${flag}。`, `Irreversible flag remains: ${flag}.`)),
    ].slice(0, 5),
  };
}

function buildPlayerStyle(state: GameState, language: Language): PlayerStyleSummary {
  const cardActions = state.actionLog.filter((action) => action.kind === "card");
  const readRate = state.revealedIntelIds.length >= 12;
  const backlashCount = cardActions.filter((action) => action.risks.length > 0).length;
  const militaryCount = cardActions.filter((action) => /military|动员|军事/i.test(action.title)).length;
  const diplomacyCount = cardActions.length - militaryCount;
  const tags = [
    diplomacyCount >= militaryCount ? localized(language, "外交派", "Diplomatic") : localized(language, "威慑派", "Deterrence"),
    readRate ? localized(language, "档案派", "Archivist") : localized(language, "快速决策派", "Fast-Decision"),
    backlashCount > 1 ? localized(language, "冒险派", "Risk-Taker") : localized(language, "克制派", "Restrained"),
  ];

  return {
    label: tags.slice(0, 2).join(" + "),
    tags,
    description: localized(language, `你使用了 ${cardActions.length} 张干预卡，阅读了 ${state.revealedIntelIds.length} 条情报。整体风格偏向${tags.join("、")}。`, `You used ${cardActions.length} intervention cards and read ${state.revealedIntelIds.length} intel items. Your run leans ${tags.join(" + ")}.`),
  };
}

function buildExecutiveSummary(ending: EndingDefinition, variables: FinalVariableReport[], actions: PlayerActionSummary[], language: Language): string {
  const topVariable = variables.find((variable) => variable.riskLevel === "critical" || variable.riskLevel === "high") ?? variables[0];
  const topAction = actions[0];
  if (language === "en") {
    if (ending.type === "total_war") {
      return `Your debugging failed to stop the July Crisis from sliding into general war. ${topVariable.label} ended at ${topVariable.value}, linking with alliance, mobilization, and public pressure. ${topAction ? `The key action "${topAction.cardName}" changed the situation, but not enough to break the collapse chain.` : "There were not enough key interventions to keep the diplomatic window open."} War became the system's default output.`;
    }
    if (ending.type === "coercive_peace" || ending.type === "conference_freeze") {
      return `You did not create an easy peace, but you kept the system below the total-war threshold. ${topAction ? `Through key interventions such as "${topAction.cardName}", ` : ""}the crisis was pushed back onto a diplomatic track. Europe remained tense, but did not collapse that summer.`;
    }
    return `This ending was not caused by one choice, but by variables, events, and interventions coupling together. ${topVariable.label} ended at ${topVariable.value}; player actions changed part of the path, while clear residual risks remained.`;
  }
  if (ending.type === "total_war") {
    return `你的调试未能阻止七月危机滑入全面战争。${topVariable.label}最终达到 ${topVariable.value}，与联盟、动员和舆论压力形成连锁。${topAction ? `关键行动「${topAction.cardName}」改变了局势，但不足以阻断系统崩溃。` : "缺少足够关键行动来延长外交窗口。"}最终，战争成为系统默认输出。`;
  }
  if (ending.type === "coercive_peace" || ending.type === "conference_freeze") {
    return `你没有创造轻松的和平，但成功阻止系统越过全面战争临界点。${topAction ? `通过「${topAction.cardName}」等关键干预，` : ""}危机被压回外交轨道。欧洲仍然紧张，但没有在这个夏天整体崩溃。`;
  }
  return `本局结局不是单一选择造成的，而是变量、事件和干预共同耦合的结果。${topVariable.label}最终为 ${topVariable.value}，玩家行动改变了部分路径，但系统仍保留明显残余风险。`;
}

function getVariableExplanation(key: string, polarity: VariablePolarity, label: string): string {
  const isEnglish = /[A-Za-z]/.test(label);
  if (isEnglish) {
    if (key === "war_probability") return "Higher values make total war or high-risk endings more likely.";
    if (key === "military_timetable_rigidity") return "Higher rigidity means mobilization plans are more likely to constrain political decisions.";
    if (key === "diplomatic_trust") return "Higher trust makes de-escalation signals and commitments more believable.";
    if (polarity === "higher_is_better") return "Higher values support crisis stability.";
    if (polarity === "higher_is_worse") return "Higher values push the crisis toward escalation.";
    return "This variable must be judged together with other structural pressures.";
  }
  if (key === "war_probability") return "该变量越高，越容易触发全面战争或高风险结局。";
  if (key === "military_timetable_rigidity") return "军事时间表越刚性，政治决策越容易被动员计划接管。";
  if (key === "diplomatic_trust") return "外交信任越高，各方越可能相信缓和信号与承诺。";
  if (polarity === "higher_is_better") return "该变量越高，越有利于稳定危机。";
  if (polarity === "higher_is_worse") return "该变量越高，越容易推动危机升级。";
  return "该变量需要结合其他压力共同判断。";
}

function localized(language: Language, zh: string, en: string): string {
  return language === "en" ? en : zh;
}

function formatDelta(delta: number): string {
  return `${delta >= 0 ? "+" : ""}${delta}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
