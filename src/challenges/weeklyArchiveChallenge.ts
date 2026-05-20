import type { GameMode } from "../modes/gameModes";

export interface WeeklyArchiveChallenge {
  id: string;
  caseId: string;
  seed: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  startsAt: string;
  endsAt: string;
  variableOverrides: Record<string, number>;
  allowedModes: GameMode[];
}

export const currentWeeklyChallenge: WeeklyArchiveChallenge = {
  id: "1914-W21",
  caseId: "case_1914",
  seed: "1914-W21-BALKAN-PRESSURE",
  titleZh: "1914-W21：模糊的红线",
  titleEn: "1914-W21: Blurred Red Lines",
  descriptionZh: "英国红线更模糊，媒体煽动更高，德国风险判断更低。",
  descriptionEn: "British red lines are blurrier, press agitation is higher, and German risk perception is lower.",
  startsAt: "2026-05-18T00:00:00.000Z",
  endsAt: "2026-05-25T00:00:00.000Z",
  variableOverrides: {
    british_redline_clarity: -8,
    media_agitation: 10,
    german_risk_perception: -6,
  },
  allowedModes: ["challenge", "ironman"],
};
