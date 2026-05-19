import type { AnalyticsEvent } from "../analytics/eventTypes";

export interface PlayerStyleScores {
  archivist: number;
  diplomat: number;
  deterrence: number;
  institutionalist: number;
  riskTaker: number;
  rollbackExplorer: number;
}

const emptyScores: PlayerStyleScores = {
  archivist: 0,
  diplomat: 0,
  deterrence: 0,
  institutionalist: 0,
  riskTaker: 0,
  rollbackExplorer: 0,
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculatePlayerStyleFromEvents(events: AnalyticsEvent[]): PlayerStyleScores {
  const scores = { ...emptyScores };

  events.forEach((event) => {
    if (event.eventType === "intel_opened") scores.archivist += 8;
    if (event.eventType === "save_loaded" || event.eventType === "rollback_detected") scores.rollbackExplorer += 12;
    if (event.eventType === "risk_triggered") scores.riskTaker += 14;
    if (event.eventType !== "card_used") return;

    const cardTypes = Array.isArray(event.payload.cardTypes) ? event.payload.cardTypes.map(String) : [];
    if (cardTypes.some((type) => /diplomacy|media|crisis/i.test(type))) scores.diplomat += 10;
    if (cardTypes.some((type) => /military|war/i.test(type))) scores.deterrence += 10;
    if (cardTypes.some((type) => /institutional|law|judicial/i.test(type))) scores.institutionalist += 10;
    if (event.payload.feasibility === "C") scores.riskTaker += 8;
  });

  return {
    archivist: clampScore(scores.archivist),
    diplomat: clampScore(scores.diplomat),
    deterrence: clampScore(scores.deterrence),
    institutionalist: clampScore(scores.institutionalist),
    riskTaker: clampScore(scores.riskTaker),
    rollbackExplorer: clampScore(scores.rollbackExplorer),
  };
}
