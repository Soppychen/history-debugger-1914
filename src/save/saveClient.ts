import { getIrreversibleFlags } from "../gameLogic";
import type { GameState } from "../types";
import type { RiskLevel, SaveGame, SaveSlotType, SaveSummary } from "../analytics/eventTypes";

const SAVE_STORE_KEY = "hd_save_games";
const CASE_ID = "case_1914";

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeSaves(saves: SaveGame[]) {
  window.localStorage.setItem(SAVE_STORE_KEY, JSON.stringify(saves));
}

function readSaves(): SaveGame[] {
  return safeRead<SaveGame[]>(SAVE_STORE_KEY, []);
}

function randomId(prefix: string): string {
  const bytes = new Uint8Array(10);
  window.crypto.getRandomValues(bytes);
  return `${prefix}_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function riskLevel(warProbability: number): RiskLevel {
  if (warProbability >= 80) return "critical";
  if (warProbability >= 60) return "high";
  if (warProbability >= 35) return "medium";
  return "low";
}

export function createSaveSummary(state: GameState, dateLabel: string): SaveSummary {
  return {
    title: state.ending ? state.ending.title : `Turn ${state.turn} / ${dateLabel}`,
    turnLabel: `T${state.turn} ${dateLabel}`,
    keyFlags: Object.keys(state.flags).filter((key) => Boolean(state.flags[key])).slice(0, 8),
    usedCardsCount: state.usedCardIds.length,
    irreversibleEvents: getIrreversibleFlags(state),
    currentRiskLevel: riskLevel(state.variables.war_probability ?? 0),
  };
}

export function createSaveGame(params: {
  playerId: string;
  state: GameState;
  dateLabel: string;
  crisisStage: string;
  slotType: SaveSlotType;
  slotName: string;
}): SaveGame {
  const now = new Date().toISOString();
  const saves = readSaves();
  const existing = saves.find(
    (save) =>
      save.playerId === params.playerId &&
      save.caseId === CASE_ID &&
      save.slotType === params.slotType &&
      save.slotName === params.slotName,
  );
  const save: SaveGame = {
    id: existing?.id ?? randomId("save"),
    playerId: params.playerId,
    caseId: CASE_ID,
    slotType: params.slotType,
    slotName: params.slotName,
    turn: params.state.turn,
    dateLabel: params.dateLabel,
    crisisStage: params.crisisStage,
    warProbability: params.state.variables.war_probability ?? 0,
    gameState: params.state,
    summary: createSaveSummary(params.state, params.dateLabel),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    deletedAt: null,
  };
  writeSaves([save, ...saves.filter((item) => item.id !== save.id)]);
  return save;
}

export function createAutosave(params: {
  playerId: string;
  state: GameState;
  dateLabel: string;
  crisisStage: string;
}): SaveGame {
  const saves = readSaves();
  const playerSaves = saves.filter((save) => save.playerId === params.playerId && save.slotType === "auto");
  const latest = playerSaves.find((save) => save.slotName === "autosave_latest");
  const previous1 = playerSaves.find((save) => save.slotName === "autosave_previous_1");

  const shifted = saves.map((save) => {
    if (latest && save.id === latest.id) return { ...save, slotName: "autosave_previous_1" };
    if (previous1 && save.id === previous1.id) return { ...save, slotName: "autosave_previous_2" };
    return save;
  });
  writeSaves(shifted.filter((save) => !(save.playerId === params.playerId && save.slotType === "auto" && save.slotName === "autosave_previous_2" && previous1 && save.id !== previous1.id)));

  return createSaveGame({ ...params, slotType: "auto", slotName: "autosave_latest" });
}

export function createEndingArchive(params: {
  playerId: string;
  state: GameState;
  dateLabel: string;
  crisisStage: string;
}): SaveGame {
  return createSaveGame({
    ...params,
    slotType: "ending_archive",
    slotName: `ending_${params.state.ending?.id ?? "unknown"}_${Date.now()}`,
  });
}

export function getSavesForPlayer(playerId: string): SaveGame[] {
  return readSaves()
    .filter((save) => save.playerId === playerId && save.caseId === CASE_ID && !save.deletedAt)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getAllSaves(): SaveGame[] {
  return readSaves().filter((save) => !save.deletedAt);
}

export function deleteSave(saveId: string) {
  writeSaves(readSaves().map((save) => (save.id === saveId ? { ...save, deletedAt: new Date().toISOString() } : save)));
}
