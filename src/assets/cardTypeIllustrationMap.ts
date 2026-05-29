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

const intelTypeFallbacks: Array<[RegExp, keyof typeof cardTypeIllustrationMap]> = [
  [/军事|动员|战略|战争|同盟/, "military"],
  [/制度|内部|会议|评估/, "institutional"],
  [/媒体|社会|国内|政府|政治|信誉/, "domestic_politics"],
  [/国际法|法律|司法/, "international_law"],
  [/外交|电报|声明|文件|观察/, "diplomacy"],
  [/情报|警报|事件|历史|记忆/, "intelligence"],
];

export function getCardTypeIllustration(type: string | string[] | undefined): string {
  const key = Array.isArray(type) ? type.join(" ") : type;
  if (!key) return cardTypeIllustrationMap.intelligence;
  if (!Array.isArray(type) && cardTypeIllustrationMap[key]) return cardTypeIllustrationMap[key];
  const matched = intelTypeFallbacks.find(([pattern]) => pattern.test(key));
  return matched ? cardTypeIllustrationMap[matched[1]] : cardTypeIllustrationMap.intelligence;
}
