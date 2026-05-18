export const cardTypeIllustrationMap: Record<string, string> = {
  diplomacy: "/assets/card-illustrations/card-illo-diplomacy.png",
  military: "/assets/card-illustrations/card-illo-military.png",
  media: "/assets/card-illustrations/card-illo-media.png",
  judicial: "/assets/card-illustrations/card-illo-judicial.png",
  intelligence: "/assets/card-illustrations/card-illo-intelligence.png",
  institutional: "/assets/card-illustrations/card-illo-institutional.png",
  domestic_politics: "/assets/card-illustrations/card-illo-domestic-politics.png",
  symbolic_politics: "/assets/card-illustrations/card-illo-symbolic-politics.png",
  international_law: "/assets/card-illustrations/card-illo-international-law.png",
  crisis_management: "/assets/card-illustrations/card-illo-crisis-management.png",
  war_aims: "/assets/card-illustrations/card-illo-war-aims.png",
  backlash: "/assets/card-illustrations/card-illo-backlash.png",
};

export const turnEventImageMap: Record<number, string> = {
  1: "/assets/turn-events/turn-01-spark-falls.png",
  2: "/assets/turn-events/turn-02-blank-check.png",
  3: "/assets/turn-events/turn-03-war-in-the-text.png",
  4: "/assets/turn-events/turn-04-press-faster-than-diplomacy.png",
  5: "/assets/turn-events/turn-05-countdown-begins.png",
  6: "/assets/turn-events/turn-06-how-much-acceptance.png",
  7: "/assets/turn-events/turn-07-gate-of-local-war.png",
  8: "/assets/turn-events/turn-08-mobilization-slope.png",
  9: "/assets/turn-events/turn-09-timetable-takes-over.png",
  10: "/assets/turn-events/turn-10-first-gate-opens.png",
  11: "/assets/turn-events/turn-11-belgium-redline.png",
  12: "/assets/turn-events/turn-12-system-collapse-check.png",
};

export const endingStampMap: Record<string, string> = {
  total_war: "/assets/stamps/stamp-total-war.svg",
  delayed_war: "/assets/stamps/stamp-delayed-war.svg",
  localized_war: "/assets/stamps/stamp-localized-war.svg",
  conference_freeze: "/assets/stamps/stamp-conference-freeze.svg",
  coercive_peace: "/assets/stamps/stamp-coercive-peace.svg",
  low_credibility_miracle: "/assets/stamps/stamp-low-credibility-miracle.svg",
  temporary_deescalation: "/assets/stamps/stamp-conference-freeze.svg",
};

const intelTypeFallbacks: Array<[RegExp, keyof typeof cardTypeIllustrationMap]> = [
  [/军事|动员|战略|战争|同盟/, "military"],
  [/媒体|社会|国内|政府|政治|信誉/, "domestic_politics"],
  [/国际法|法律|司法/, "international_law"],
  [/外交|电报|声明|文件|观察/, "diplomacy"],
  [/制度|内部|会议|评估/, "institutional"],
  [/情报|警报|事件|历史|记忆/, "intelligence"],
];

export function getCardIllustration(type: string | string[] | undefined): string {
  const key = Array.isArray(type) ? type[0] : type;
  if (!key) return cardTypeIllustrationMap.intelligence;
  if (cardTypeIllustrationMap[key]) return cardTypeIllustrationMap[key];
  const matched = intelTypeFallbacks.find(([pattern]) => pattern.test(key));
  return matched ? cardTypeIllustrationMap[matched[1]] : cardTypeIllustrationMap.intelligence;
}

export function getTurnEventImage(turn: number): string {
  return turnEventImageMap[turn] ?? turnEventImageMap[1];
}

export function getEndingStamp(type: string): string {
  return endingStampMap[type] ?? endingStampMap.total_war;
}
