const perturbationRules = [
  { variableId: "german_risk_perception", minDelta: -8, maxDelta: 8 },
  { variableId: "media_agitation", minDelta: -10, maxDelta: 10 },
  { variableId: "austrian_hardline", minDelta: -7, maxDelta: 7 },
  { variableId: "british_redline_clarity", minDelta: -6, maxDelta: 6 },
  { variableId: "russian_mobilization_pressure", minDelta: -7, maxDelta: 7 },
  { variableId: "diplomatic_trust", minDelta: -8, maxDelta: 8 },
  { variableId: "military_timetable_rigidity", minDelta: -5, maxDelta: 5 },
  { variableId: "nationalist_pressure", minDelta: -6, maxDelta: 6 },
];

const gameModes = {
  standard: { allowsManualSave: true, allowsLoad: true, leaderboardEligible: false, fixedSeed: false },
  serious: { allowsManualSave: true, allowsLoad: true, leaderboardEligible: true, fixedSeed: false },
  challenge: { allowsManualSave: true, allowsLoad: true, leaderboardEligible: true, fixedSeed: true },
  ironman: { allowsManualSave: false, allowsLoad: false, leaderboardEligible: true, fixedSeed: true },
};

const endingBonusMap = {
  coercive_peace: 350,
  conference_freeze: 280,
  localized_war: 120,
  localized_war_controlled: 120,
  temporary_deescalation: 60,
  delayed_war: -50,
  total_war: -300,
  low_credibility_miracle: 80,
};

const errors = [];

function fail(message) {
  errors.push(message);
}

function hashSeed(seed) {
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRng(seed) {
  let state = hashSeed(seed) || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function scenarioDeltas(seed) {
  const rng = createSeededRng(seed);
  return Object.fromEntries(
    perturbationRules.map((rule) => [
      rule.variableId,
      Math.floor(rng() * (rule.maxDelta - rule.minDelta + 1)) + rule.minDelta,
    ]),
  );
}

function calculateDebugScore(input) {
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
  return Math.max(0, Math.round(Object.values(breakdown).reduce((sum, value) => sum + value, 0)));
}

function eligibleLeaderboards({ mode, endingType, historicalCredibility, reloadCount }) {
  const output = ["personal"];
  if (mode === "standard") return output;
  output.push("debug_score");
  if (historicalCredibility >= 60 && mode === "serious") output.push("lowest_war_probability");
  if (["coercive_peace", "conference_freeze", "localized_war", "localized_war_controlled"].includes(endingType)) {
    output.push("credible_peace", "minimal_intervention");
  }
  if (mode === "ironman" && reloadCount === 0) output.push("ironman");
  return output;
}

const sameA = scenarioDeltas("1914-W21-BALKAN-PRESSURE");
const sameB = scenarioDeltas("1914-W21-BALKAN-PRESSURE");
const different = scenarioDeltas("1914-W22-ALT");

if (JSON.stringify(sameA) !== JSON.stringify(sameB)) fail("same seed should produce identical scenario deltas");
if (JSON.stringify(sameA) === JSON.stringify(different)) fail("different seeds should produce different scenario deltas");

for (const rule of perturbationRules) {
  const value = sameA[rule.variableId];
  if (value < rule.minDelta || value > rule.maxDelta) {
    fail(`${rule.variableId} delta ${value} is outside ${rule.minDelta}..${rule.maxDelta}`);
  }
}

if (gameModes.ironman.allowsLoad || gameModes.ironman.allowsManualSave) fail("ironman should forbid manual save/load");
if (gameModes.standard.leaderboardEligible) fail("standard mode should not enter serious leaderboards");
if (!gameModes.challenge.fixedSeed || !gameModes.ironman.fixedSeed) fail("challenge and ironman should use fixed seeds");

const lowWarButMessy = calculateDebugScore({
  mode: "challenge",
  endingType: "low_credibility_miracle",
  finalWarProbability: 20,
  historicalCredibility: 25,
  irreversibleEventCount: 3,
  backlashCount: 8,
  lowCredibilityCardCount: 4,
  reloadCount: 6,
  localWarCost: 90,
  usedCardCount: 14,
  readIntelCount: 2,
  effectiveActionCount: 2,
  totalTurns: 12,
});

const higherWarButCredible = calculateDebugScore({
  mode: "challenge",
  endingType: "conference_freeze",
  finalWarProbability: 38,
  historicalCredibility: 86,
  irreversibleEventCount: 0,
  backlashCount: 1,
  lowCredibilityCardCount: 0,
  reloadCount: 0,
  localWarCost: 35,
  usedCardCount: 8,
  readIntelCount: 18,
  effectiveActionCount: 7,
  totalTurns: 12,
});

if (higherWarButCredible <= lowWarButMessy) {
  fail("debug score should reward credible, low-side-effect play over merely minimizing war probability");
}

const standardBoards = eligibleLeaderboards({ mode: "standard", endingType: "conference_freeze", historicalCredibility: 90, reloadCount: 3 });
if (standardBoards.some((board) => board !== "personal")) fail("standard mode should only enter personal history");

const ironmanBoards = eligibleLeaderboards({ mode: "ironman", endingType: "conference_freeze", historicalCredibility: 80, reloadCount: 0 });
if (!ironmanBoards.includes("ironman")) fail("ironman no-reload completion should enter ironman board");

if (errors.length > 0) {
  console.error("\nLadder validation failed:");
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("\nLadder validation passed:");
console.log(`- Scenario seed deterministic: ${JSON.stringify(sameA)}`);
console.log(`- Multi-objective score check: credible=${higherWarButCredible}, low-war-messy=${lowWarButMessy}`);
console.log("- Mode and leaderboard eligibility rules validated");
