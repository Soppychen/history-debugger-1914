import { hashSeed } from "../random/seededRng";
import type {
  LeaderboardEntry,
  LeaderboardType,
  RunCompletionInput,
  RunRecord,
} from "./leaderboardTypes";

const RUNS_KEY = "hd_run_records";
const ENTRIES_KEY = "hd_leaderboard_entries";

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function randomId(prefix: string): string {
  const bytes = new Uint8Array(10);
  window.crypto.getRandomValues(bytes);
  return `${prefix}_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function createRunRecord(playerId: string, mode: RunRecord["mode"], seed: string): RunRecord {
  const run: RunRecord = {
    id: randomId("run"),
    playerId,
    caseId: "case_1914",
    mode,
    seed,
    startedAt: new Date().toISOString(),
  };
  writeJson(RUNS_KEY, [run, ...getRunRecords()]);
  return run;
}

export function getRunRecords(): RunRecord[] {
  return safeRead<RunRecord[]>(RUNS_KEY, []);
}

export function getLeaderboardEntries(type?: LeaderboardType, playerId?: string): LeaderboardEntry[] {
  const entries = safeRead<LeaderboardEntry[]>(ENTRIES_KEY, []);
  return entries
    .filter((entry) => (!type || entry.leaderboardType === type) && (!playerId || entry.playerId === playerId))
    .sort(sortEntry);
}

export function completeRunAndSubmit(input: RunCompletionInput): LeaderboardEntry[] {
  const completedAt = new Date().toISOString();
  const completedRun: RunRecord = {
    ...input.run,
    completedAt,
    endingType: input.endingType,
    debugScore: input.debugScoreResult.score,
    grade: input.debugScoreResult.grade,
    finalWarProbability: input.finalWarProbability,
    historicalCredibility: input.historicalCredibility,
    irreversibleEventCount: input.irreversibleEventCount,
    usedCardCount: input.usedCardCount,
    readIntelCount: input.readIntelCount,
    reloadCount: input.reloadCount,
    actionSequenceHash: makeActionSequenceHash(input.run.seed, input.run.id, input.usedCardCount, input.reloadCount),
    reportId: input.reportId,
  };
  writeJson(RUNS_KEY, getRunRecords().map((run) => (run.id === input.run.id ? completedRun : run)));

  const leaderboardTypes = eligibleLeaderboards(input);
  const entries = leaderboardTypes.map((type) => makeEntry(type, input, completedRun, completedAt));
  writeJson(ENTRIES_KEY, [...entries, ...safeRead<LeaderboardEntry[]>(ENTRIES_KEY, [])]);
  return entries;
}

function eligibleLeaderboards(input: RunCompletionInput): LeaderboardType[] {
  const output: LeaderboardType[] = ["personal"];
  if (input.run.mode === "standard") return output;
  output.push("debug_score");
  if (input.historicalCredibility >= 60 && input.run.mode === "serious") output.push("lowest_war_probability");
  if (["coercive_peace", "conference_freeze", "localized_war", "localized_war_controlled"].includes(input.endingType)) {
    output.push("credible_peace", "minimal_intervention");
  }
  if (input.run.mode === "ironman" && input.reloadCount === 0) output.push("ironman");
  return output;
}

function makeEntry(
  leaderboardType: LeaderboardType,
  input: RunCompletionInput,
  run: RunRecord,
  createdAt: string,
): LeaderboardEntry {
  return {
    id: randomId("lb"),
    leaderboardId: leaderboardType,
    leaderboardType,
    playerId: input.playerId,
    displayName: input.displayName,
    runId: run.id,
    mode: run.mode,
    seed: run.seed,
    endingType: input.endingType,
    debugScore: input.debugScoreResult.score,
    grade: input.debugScoreResult.grade,
    finalWarProbability: input.finalWarProbability,
    historicalCredibility: input.historicalCredibility,
    irreversibleEventCount: input.irreversibleEventCount,
    usedCardCount: input.usedCardCount,
    reloadCount: input.reloadCount,
    completionTimeSeconds: Math.max(1, Math.round((Date.parse(createdAt) - Date.parse(run.startedAt)) / 1000)),
    reportId: input.reportId,
    status: "unverified",
    createdAt,
  };
}

function sortEntry(a: LeaderboardEntry, b: LeaderboardEntry): number {
  if (a.leaderboardType === "lowest_war_probability") {
    return a.finalWarProbability - b.finalWarProbability || b.historicalCredibility - a.historicalCredibility || b.debugScore - a.debugScore;
  }
  if (a.leaderboardType === "minimal_intervention") {
    return a.usedCardCount - b.usedCardCount || b.debugScore - a.debugScore || b.historicalCredibility - a.historicalCredibility;
  }
  if (a.leaderboardType === "credible_peace") {
    return b.historicalCredibility - a.historicalCredibility || a.finalWarProbability - b.finalWarProbability || b.debugScore - a.debugScore;
  }
  return b.debugScore - a.debugScore || b.historicalCredibility - a.historicalCredibility || a.finalWarProbability - b.finalWarProbability;
}

function makeActionSequenceHash(seed: string, runId: string, usedCardCount: number, reloadCount: number): string {
  return `ash_${hashSeed(`${seed}:${runId}:${usedCardCount}:${reloadCount}`).toString(16)}`;
}
