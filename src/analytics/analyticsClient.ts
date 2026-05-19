import { getStoredPlayers } from "../auth/anonymousAuth";
import { getAllSaves } from "../save/saveClient";
import { calculatePlayerStyleFromEvents } from "../profile/playerStyle";
import type {
  AdminAnalyticsSnapshot,
  AnalyticsEvent,
  AnalyticsEventInput,
  ConsentState,
} from "./eventTypes";

const ANALYTICS_STORE_KEY = "hd_analytics_events";
const REQUIRED_EVENTS = new Set(["session_start", "case_start", "save_created", "save_loaded", "ending_reached", "error_occurred"]);

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeEvents(events: AnalyticsEvent[]) {
  window.localStorage.setItem(ANALYTICS_STORE_KEY, JSON.stringify(events.slice(-2000)));
}

function randomId(prefix: string): string {
  const bytes = new Uint8Array(10);
  window.crypto.getRandomValues(bytes);
  return `${prefix}_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function getAnalyticsEvents(): AnalyticsEvent[] {
  return safeRead<AnalyticsEvent[]>(ANALYTICS_STORE_KEY, []);
}

export function recordAnalyticsEvent(input: AnalyticsEventInput, consent: ConsentState): AnalyticsEvent | null {
  const required = input.required || REQUIRED_EVENTS.has(input.type);
  if (!required && !consent.analyticsAccepted) return null;

  const event: AnalyticsEvent = {
    id: randomId("evt"),
    playerId: input.playerId,
    anonymousSessionId: input.anonymousSessionId,
    caseId: "case_1914",
    saveId: input.saveId,
    eventType: input.type,
    turn: input.turn,
    timestamp: new Date().toISOString(),
    payload: input.payload ?? {},
    clientVersion: "prototype-local",
    schemaVersion: "analytics-v1",
  };
  writeEvents([...getAnalyticsEvents(), event]);
  return event;
}

function countBy<T extends string>(items: T[]): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, key) => {
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function sortedCounts(counts: Record<string, number>, label: string) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ [label]: key, count }));
}

export function getAdminAnalyticsSnapshot(): AdminAnalyticsSnapshot {
  const events = getAnalyticsEvents();
  const players = getStoredPlayers();
  const saves = getAllSaves();
  const cardUsageCounts = countBy(
    events
      .filter((event) => event.eventType === "card_used" && typeof event.payload.cardId === "string")
      .map((event) => event.payload.cardId as string),
  );
  const endingCounts = countBy(
    events
      .filter((event) => event.eventType === "ending_reached" && typeof event.payload.endingId === "string")
      .map((event) => event.payload.endingId as string),
  );
  const warSamples = events
    .map((event) => event.payload.warProbability)
    .filter((value): value is number => typeof value === "number");
  const playerStyles = players.map((player) => calculatePlayerStyleFromEvents(events.filter((event) => event.playerId === player.id)));
  const styleTotals = playerStyles.reduce<Record<string, number>>((totals, style) => {
    Object.entries(style).forEach(([key, value]) => {
      totals[key] = (totals[key] ?? 0) + value;
    });
    return totals;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    playerCount: players.length,
    sessionCount: new Set(events.map((event) => event.anonymousSessionId)).size,
    saveCount: saves.length,
    eventCount: events.length,
    eventCounts: countBy(events.map((event) => event.eventType)),
    cardUsage: sortedCounts(cardUsageCounts, "cardId") as Array<{ cardId: string; count: number }>,
    endingCounts: sortedCounts(endingCounts, "endingId") as Array<{ endingId: string; count: number }>,
    averageWarProbability: warSamples.length ? Math.round(warSamples.reduce((sum, value) => sum + value, 0) / warSamples.length) : 0,
    rollbackCount: events.filter((event) => event.eventType === "rollback_detected").length,
    recentEvents: events.slice(-25).reverse(),
    styleAverages: Object.fromEntries(
      Object.entries(styleTotals).map(([key, total]) => [key, playerStyles.length ? Math.round(total / playerStyles.length) : 0]),
    ),
    playerSummaries: players.map((player) => {
      const playerEvents = events.filter((event) => event.playerId === player.id);
      const playerSaves = saves.filter((save) => save.playerId === player.id);
      const playerCardUsage = countBy(
        playerEvents
          .filter((event) => event.eventType === "card_used" && typeof event.payload.cardId === "string")
          .map((event) => event.payload.cardId as string),
      );
      const endingIds = Array.from(
        new Set(
          playerEvents
            .filter((event) => event.eventType === "ending_reached" && typeof event.payload.endingId === "string")
            .map((event) => event.payload.endingId as string),
        ),
      );
      const latestSave = playerSaves.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

      return {
        playerId: player.id,
        createdAt: player.createdAt,
        lastSeenAt: player.lastSeenAt,
        analyticsConsent: player.analyticsConsent,
        eventCount: playerEvents.length,
        sessionCount: new Set(playerEvents.map((event) => event.anonymousSessionId)).size,
        saveCount: playerSaves.length,
        latestTurn: latestSave?.turn ?? null,
        latestWarProbability: latestSave?.warProbability ?? null,
        endingsReached: endingIds,
        cardUsage: sortedCounts(playerCardUsage, "cardId") as Array<{ cardId: string; count: number }>,
        eventCounts: countBy(playerEvents.map((event) => event.eventType)),
        styleScores: calculatePlayerStyleFromEvents(playerEvents),
        recentEvents: playerEvents.slice(-12).reverse(),
      };
    }),
  };
}
