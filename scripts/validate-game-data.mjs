import { readFile } from "node:fs/promises";

const DATA_DIR = new URL("../public/data/", import.meta.url);
const SUPPORTED_CONDITIONS = new Set([
  "variable_min",
  "variable_max",
  "flag_exists",
  "turn_min",
  "turn_max",
  "card_used",
  "cards_used_min",
]);

const ROUTES = {
  totalWar: {
    title: "走向全面战争",
    cardsByTurn: {},
    expectedEnding: "E01",
  },
  localizedWar: {
    title: "走向巴尔干局部战争",
    cardsByTurn: {
      1: ["C03", "C04"],
      2: ["C05"],
      3: ["C11", "C12"],
      4: ["C14", "C15"],
      5: ["C16"],
      6: ["C21"],
      7: ["C22"],
      8: ["C23"],
      9: ["C28"],
      10: ["C30"],
      11: ["C27"],
    },
    expectedEnding: "E03",
  },
  coercivePeace: {
    title: "尝试走向高压和平",
    cardsByTurn: {
      1: ["C02"],
      2: ["C05"],
      3: ["C11", "C12"],
      4: ["C03", "C15"],
      5: ["C17"],
      6: ["C20"],
      7: ["C22"],
      8: ["C26", "C27"],
      9: ["C29"],
      10: ["C19"],
      11: ["C14"],
      12: ["C13"],
    },
    expectedEnding: "E05",
  },
  conferenceFreeze: {
    title: "尝试走向国际会议冻结",
    cardsByTurn: {
      1: ["C02"],
      2: ["C06", "C07"],
      3: ["C09", "C11"],
      4: ["C13"],
      5: ["C18"],
      6: ["C19"],
      7: ["C21"],
      8: ["C26", "C27"],
      9: ["C29"],
      10: ["C30"],
    },
    expectedEnding: "E04",
  },
};

async function readJson(name) {
  return JSON.parse(await readFile(new URL(name, DATA_DIR), "utf8"));
}

const data = {
  variables: await readJson("variables_1914.json"),
  timeline: await readJson("timeline_1914.json"),
  interventionCards: await readJson("intervention_cards_1914.json"),
  intelCards: await readJson("intel_cards_1914.json"),
  endings: await readJson("endings_1914.json"),
};

const errors = [];
const warnings = [];
const variableKeys = new Set(data.variables.map((variable) => variable.key));
const cardIds = new Set(data.interventionCards.map((card) => card.id));
const intelIds = new Set(data.intelCards.map((intel) => intel.id));
const endingIds = new Set(data.endings.map((ending) => ending.id));
const variableDefs = Object.fromEntries(data.variables.map((variable) => [variable.key, variable]));

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function assertUnique(ids, label) {
  if (ids.length !== new Set(ids).size) {
    fail(`${label} contains duplicate ids`);
  }
}

function validateCondition(condition, context) {
  if (!SUPPORTED_CONDITIONS.has(condition.type)) {
    fail(`${context}: unsupported condition type ${condition.type}`);
  }
  if ((condition.type === "variable_min" || condition.type === "variable_max") && !variableKeys.has(condition.key)) {
    fail(`${context}: unknown variable key ${condition.key}`);
  }
  if (condition.type === "card_used" && !cardIds.has(condition.key)) {
    fail(`${context}: unknown card id ${condition.key}`);
  }
  if (condition.type === "flag_exists" && typeof condition.key !== "string") {
    fail(`${context}: flag_exists missing key`);
  }
  if (condition.type === "cards_used_min" && condition.key && condition.key !== "low_feasibility_cards") {
    warn(`${context}: cards_used_min uses generic key ${condition.key}`);
  }
}

function validateEffect(effect, context) {
  if (!variableKeys.has(effect.variable)) {
    fail(`${context}: unknown effect variable ${effect.variable}`);
  }
  if (typeof effect.delta !== "number") {
    fail(`${context}: delta must be a number`);
  }
}

function validateFlag(flag, context) {
  if (!flag || typeof flag.flag !== "string") {
    fail(`${context}: malformed flag entry`);
  }
}

function clamp(variable, value) {
  const definition = variableDefs[variable];
  return Math.max(definition.min, Math.min(definition.max, value));
}

function createState() {
  return {
    turn: 1,
    ap: 2,
    maxAp: 2,
    variables: Object.fromEntries(data.variables.map((variable) => [variable.key, variable.initialValue])),
    flags: {},
    usedCardIds: [],
    lowFeasibilityCardsUsed: 0,
  };
}

function evaluateCondition(condition, state) {
  const value = condition.key ? state.variables[condition.key] : undefined;
  switch (condition.type) {
    case "variable_min":
      return value >= condition.value;
    case "variable_max":
      return value <= condition.value;
    case "flag_exists":
      return state.flags[condition.key] === condition.value;
    case "turn_min":
      return state.turn >= condition.value;
    case "turn_max":
      return state.turn <= condition.value;
    case "card_used":
      return state.usedCardIds.includes(condition.key);
    case "cards_used_min":
      return (condition.key === "low_feasibility_cards" ? state.lowFeasibilityCardsUsed : state.usedCardIds.length) >= condition.value;
    default:
      return false;
  }
}

function evaluateConditions(conditions, state) {
  return (conditions ?? []).every((condition) => evaluateCondition(condition, state));
}

function applyEffects(state, effects) {
  for (const effect of effects ?? []) {
    state.variables[effect.variable] = clamp(effect.variable, state.variables[effect.variable] + effect.delta);
  }
}

function applyFlags(state, flags) {
  for (const flag of flags ?? []) {
    state.flags[flag.flag] = flag.value;
  }
}

function prepareStateForConditions(conditions, baseTurn = 1, options = {}) {
  const state = createState();
  if (options.zeroVariables) {
    for (const variable of data.variables) state.variables[variable.key] = variable.min;
  }
  state.turn = baseTurn;
  for (const condition of conditions ?? []) {
    if (condition.type === "turn_min") state.turn = Math.max(state.turn, condition.value);
    if (condition.type === "turn_max") state.turn = Math.min(state.turn, condition.value);
    if (condition.type === "variable_min") state.variables[condition.key] = condition.value;
    if (condition.type === "variable_max") state.variables[condition.key] = condition.value;
    if (condition.type === "flag_exists") state.flags[condition.key] = condition.value;
    if (condition.type === "card_used") state.usedCardIds.push(condition.key);
    if (condition.type === "cards_used_min") {
      if (condition.key === "low_feasibility_cards") state.lowFeasibilityCardsUsed = condition.value;
      while (state.usedCardIds.length < condition.value) state.usedCardIds.push(`synthetic_${state.usedCardIds.length}`);
    }
  }
  return state;
}

function useCard(state, cardId) {
  const card = data.interventionCards.find((item) => item.id === cardId);
  if (!card) throw new Error(`unknown card ${cardId}`);
  if (state.usedCardIds.includes(card.id)) throw new Error(`card ${cardId} used twice`);
  if (state.ap < card.cost) throw new Error(`not enough AP for ${cardId}`);
  if (state.turn < card.turnRange[0] || state.turn > card.turnRange[1]) throw new Error(`card ${cardId} outside turn range on turn ${state.turn}`);
  if (!evaluateConditions(card.requirements, state)) throw new Error(`requirements failed for ${cardId}`);

  state.ap -= card.cost;
  applyEffects(state, card.effects);
  for (const risk of card.risks ?? []) {
    if (evaluateConditions(risk.conditions, state)) applyEffects(state, risk.effects);
  }
  applyFlags(state, card.flagsAdded);
  applyFlags(state, card.flags);
  state.usedCardIds.push(card.id);
  if (card.feasibility === "C") state.lowFeasibilityCardsUsed += 1;
}

function advanceTurn(state) {
  const turn = data.timeline.find((item) => item.turn === state.turn);
  if (!turn) throw new Error(`missing timeline turn ${state.turn}`);
  applyEffects(state, turn.defaultPressure);
  for (const rule of turn.specialRules ?? []) {
    if (evaluateConditions(rule.conditions, state)) {
      applyEffects(state, rule.effects);
      applyFlags(state, rule.flags);
    }
  }
  if (state.turn < data.timeline.length) {
    state.turn += 1;
    state.ap = state.maxAp;
  }
}

function findEnding(state) {
  return data.endings
    .filter((ending) => evaluateConditions(ending.conditions, state))
    .sort((a, b) => b.priority - a.priority)[0] ?? null;
}

function simulateRoute(cardsByTurn) {
  const state = createState();
  for (let turn = 1; turn <= data.timeline.length; turn += 1) {
    for (const cardId of cardsByTurn[turn] ?? []) useCard(state, cardId);
    advanceTurn(state);
  }
  return { state, ending: findEnding(state) };
}

assertUnique(data.variables.map((variable) => variable.key), "variables");
assertUnique(data.timeline.map((turn) => turn.turn), "timeline");
assertUnique(data.interventionCards.map((card) => card.id), "intervention cards");
assertUnique(data.intelCards.map((intel) => intel.id), "intel cards");
assertUnique(data.endings.map((ending) => ending.id), "endings");

if (data.timeline.length !== 12) fail(`timeline should contain 12 turns, found ${data.timeline.length}`);
data.timeline.forEach((turn, index) => {
  if (turn.turn !== index + 1) fail(`timeline turn order mismatch at index ${index}`);
  turn.defaultPressure.forEach((effect) => validateEffect(effect, `timeline ${turn.turn} defaultPressure`));
  turn.recommendedCards.forEach((cardId) => {
    if (!cardIds.has(cardId)) fail(`timeline ${turn.turn}: unknown recommended card ${cardId}`);
  });
  turn.recommendedIntel.forEach((intelId) => {
    if (!intelIds.has(intelId)) fail(`timeline ${turn.turn}: unknown recommended intel ${intelId}`);
  });
  turn.specialRules.forEach((rule) => {
    rule.conditions.forEach((condition) => validateCondition(condition, `timeline ${turn.turn} specialRule ${rule.id}`));
    rule.effects.forEach((effect) => validateEffect(effect, `timeline ${turn.turn} specialRule ${rule.id}`));
    (rule.flags ?? []).forEach((flag) => validateFlag(flag, `timeline ${turn.turn} specialRule ${rule.id}`));
  });
});

data.interventionCards.forEach((card) => {
  card.requirements.forEach((condition) => validateCondition(condition, `card ${card.id} requirement`));
  card.effects.forEach((effect) => validateEffect(effect, `card ${card.id} effect`));
  (card.flagsAdded ?? []).forEach((flag) => validateFlag(flag, `card ${card.id} flagsAdded`));
  (card.flags ?? []).forEach((flag) => validateFlag(flag, `card ${card.id} flags`));
  card.risks.forEach((risk) => {
    risk.conditions.forEach((condition) => validateCondition(condition, `card ${card.id} risk ${risk.id}`));
    risk.effects.forEach((effect) => validateEffect(effect, `card ${card.id} risk ${risk.id}`));
    const riskState = prepareStateForConditions([...card.requirements, ...risk.conditions], card.turnRange[0]);
    applyEffects(riskState, risk.effects);
  });

  const executionState = prepareStateForConditions(card.requirements, card.turnRange[0]);
  executionState.ap = Math.max(executionState.ap, card.cost);
  applyEffects(executionState, card.effects);
});

data.intelCards.forEach((intel) => {
  intel.reveals.forEach((variable) => {
    if (!variableKeys.has(variable)) fail(`intel ${intel.id}: unknown revealed variable ${variable}`);
  });
  intel.unlocks.forEach((cardId) => {
    if (!cardIds.has(cardId)) fail(`intel ${intel.id}: unknown unlocked card ${cardId}`);
  });
});

data.endings.forEach((ending) => {
  ending.conditions.forEach((condition) => validateCondition(condition, `ending ${ending.id}`));
  const state = prepareStateForConditions(ending.conditions, 12, { zeroVariables: true });
  const triggered = findEnding(state);
  if (!triggered) fail(`ending ${ending.id}: conditions do not trigger any ending`);
  if (triggered.id !== ending.id) {
    warn(`ending ${ending.id}: synthetic state is superseded by ${triggered.id} because of priority overlap`);
  }
});

for (const [name, route] of Object.entries(ROUTES)) {
  try {
    const { state, ending } = simulateRoute(route.cardsByTurn);
    if (!ending) {
      fail(`route ${name}: no ending triggered`);
    } else if (ending.id !== route.expectedEnding) {
      fail(`route ${name}: expected ${route.expectedEnding}, got ${ending.id}`);
    }
    console.log(`[route] ${route.title}: ${ending?.id ?? "NO_ENDING"} / war=${state.variables.war_probability} / turn=${state.turn}`);
  } catch (error) {
    fail(`route ${name}: ${error.message}`);
  }
}

const noAction = simulateRoute({});
if (noAction.state.turn !== 12) fail(`timeline simulation should end on turn 12, got ${noAction.state.turn}`);

if (warnings.length > 0) {
  console.warn("\nWarnings:");
  warnings.forEach((message) => console.warn(`- ${message}`));
}

if (errors.length > 0) {
  console.error("\nValidation failed:");
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("\nValidation passed:");
console.log(`- JSON files parsed: ${Object.keys(data).length}`);
console.log(`- Variables: ${data.variables.length}`);
console.log(`- Timeline turns: ${data.timeline.length}`);
console.log(`- Intervention cards: ${data.interventionCards.length}`);
console.log(`- Intel cards: ${data.intelCards.length}`);
console.log(`- Endings: ${data.endings.length}`);
