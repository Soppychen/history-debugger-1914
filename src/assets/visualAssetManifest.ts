import { getCardTypeIllustration } from "./cardTypeIllustrationMap";
import { getCrisisStageBackground } from "./crisisStageBackgroundMap";
import { deliveredIntelDocumentVisuals } from "./deliveredIntelDocumentVisuals";
import type { TopStatusBarStatus } from "../design/componentVariants";
import type { EndingDefinition, IntelCard, InterventionCard, TimelineTurn } from "../types";

export type VisualAssetKind =
  | "turn_event"
  | "card_illustration"
  | "intel_document"
  | "irreversible_event"
  | "event_icon"
  | "ui_state"
  | "ending_visual"
  | "background"
  | "stamp";

export interface VisualAsset {
  id: string;
  kind: VisualAssetKind;
  src: string;
  alt: string;
  caption?: string;
  fallback?: string;
}

type ImageCapable = {
  image?: string;
  visual?: string;
  stamp?: string;
  caption?: string;
  imageCaption?: string;
  alt?: string;
};

export const turnEventVisuals: Record<number, VisualAsset> = {
  1: asset("turn_01_sarajevo_aftershock", "turn_event", "/assets/turn-events/turn-01-sarajevo-aftershock.png", "萨拉热窝刺杀后的欧洲震动", "事件的冲击正在从萨拉热窝向欧洲系统扩散。"),
  2: asset("turn_02_blank_check", "turn_event", "/assets/turn-events/turn-02-blank-check.png", "德国空白支票与奥匈外交文件", "支持承诺改变了危机的风险预算。"),
  3: asset("turn_03_ultimatum_drafted", "turn_event", "/assets/turn-events/turn-03-ultimatum-drafted.png", "最后通牒草案与红线批注", "文本正在变成战争机器的一部分。"),
  4: asset("turn_04_press_agitation", "turn_event", "/assets/turn-events/turn-04-press-agitation.png", "报纸与民族主义情绪", "公共舆论开始压缩外交回旋空间。"),
  5: asset("turn_05_countdown", "turn_event", "/assets/turn-events/turn-05-countdown-begins.png", "最后通牒发出前的倒计时", "最后通牒窗口正在关闭。"),
  6: asset("turn_06_serbian_reply", "turn_event", "/assets/turn-events/turn-06-serbian-reply.png", "塞尔维亚回应文件", "接受与拒绝之间的边界变得危险。"),
  7: asset("turn_07_local_war_gate", "turn_event", "/assets/turn-events/turn-07-local-war-gate.png", "巴尔干局部战争之门", "局部战争之门打开，外部红线正在靠近。"),
  8: asset("turn_08_russian_mobilization_pressure", "turn_event", "/assets/turn-events/turn-08-russian-mobilization-pressure.png", "俄国动员压力与铁路图", "动员压力开始改变各国的时间感。"),
  9: asset("turn_09_timetable_takes_over", "turn_event", "/assets/turn-events/turn-09-timetable-takes-over.png", "军事时间表接管政治", "时间表正在替代谈判成为主导逻辑。"),
  10: asset("turn_10_german_ultimatum", "turn_event", "/assets/turn-events/turn-10-german-ultimatum.png", "德国最后通牒与电报", "战争路径开始进入自动化流程。"),
  11: asset("turn_11_belgium_redline", "turn_event", "/assets/turn-events/turn-11-belgium-redline.png", "比利时中立红线", "一条中立边界可能把英国拉入系统。"),
  12: asset("turn_12_system_collapse_or_freeze", "turn_event", "/assets/turn-events/turn-12-system-collapse-or-freeze.png", "欧洲系统最终判定", "事故报告即将写下最终判定。"),
};

export const legacyTurnEventVisuals: Record<number, string> = {
  1: "/assets/turn-events/turn-01-spark-falls.png",
  3: "/assets/turn-events/turn-03-war-in-the-text.png",
  4: "/assets/turn-events/turn-04-press-faster-than-diplomacy.png",
  6: "/assets/turn-events/turn-06-how-much-acceptance.png",
  8: "/assets/turn-events/turn-08-mobilization-slope.png",
  10: "/assets/turn-events/turn-10-first-gate-opens.png",
  12: "/assets/turn-events/turn-12-system-collapse-check.png",
};

export const intelDocumentVisuals: Record<string, VisualAsset> = deliveredIntelDocumentVisuals;

export const irreversibleEventVisuals: Record<string, VisualAsset> = {
  ultimatum_sent: asset("irreversible_ultimatum_sent", "irreversible_event", "/assets/irreversible-events/irreversible-ultimatum-sent.png", "最后通牒正式发出不可逆节点图", "最后通牒已无法再修改。"),
  serbian_core_rejection: asset("irreversible_serbian_rejection", "irreversible_event", "/assets/irreversible-events/irreversible-serbian-rejection.png", "塞尔维亚拒绝核心条款不可逆节点图"),
  austria_declares_war: asset("irreversible_austria_declares_war", "irreversible_event", "/assets/irreversible-events/irreversible-austria-declares-war.png", "奥匈宣战不可逆节点图"),
  russian_general_mobilization: asset("irreversible_russian_general_mobilization", "irreversible_event", "/assets/irreversible-events/irreversible-russian-general-mobilization.png", "俄国总动员不可逆节点图"),
  german_ultimatum: asset("irreversible_german_ultimatum", "irreversible_event", "/assets/irreversible-events/irreversible-german-ultimatum.png", "德国最后通牒不可逆节点图"),
  belgium_path_open: asset("irreversible_belgium_path_open", "irreversible_event", "/assets/irreversible-events/irreversible-belgium-path-open.png", "比利时路径打开不可逆节点图"),
};

export const irreversibleStampVisual = asset("stamp_irreversible", "stamp", "/assets/stamps/stamp-irreversible.svg", "IRREVERSIBLE node locked stamp");

export const crisisEventIconVisuals: Record<string, VisualAsset> = {
  diplomatic_window: asset("icon_event_diplomatic_window", "event_icon", "/assets/icons/icon-event-diplomatic-window.svg", "外交窗口事件图标"),
  ultimatum: asset("icon_event_ultimatum", "event_icon", "/assets/icons/icon-event-ultimatum.svg", "最后通牒事件图标"),
  mobilization: asset("icon_event_mobilization", "event_icon", "/assets/icons/icon-event-mobilization.svg", "动员事件图标"),
  media_pressure: asset("icon_event_media_pressure", "event_icon", "/assets/icons/icon-event-media-pressure.svg", "舆论升温事件图标"),
  irreversible: asset("icon_event_irreversible", "event_icon", "/assets/icons/icon-event-irreversible.svg", "不可逆节点事件图标"),
  war_threshold: asset("icon_event_war_threshold", "event_icon", "/assets/icons/icon-event-war-threshold.svg", "战争阈值事件图标"),
};

export const uiStateIconVisuals: Record<string, VisualAsset> = {
  countdown: asset("icon_countdown_marker", "ui_state", "/assets/icons/icon-countdown-marker.svg", "倒计时状态标记"),
  red_lock: asset("icon_red_lock", "ui_state", "/assets/icons/icon-red-lock.svg", "红锁状态标记"),
  window_closed: asset("icon_window_closed", "ui_state", "/assets/icons/icon-window-closed.svg", "窗口关闭状态标记"),
};

export const intelTemplateVisuals: Record<string, VisualAsset> = {
  telegram: asset("intel_template_diplomatic_telegram", "intel_document", "/assets/intel-documents/template-diplomatic-telegram.png", "外交电报情报模板"),
  newspaper: asset("intel_template_newspaper_clipping", "intel_document", "/assets/intel-documents/template-newspaper-clipping.png", "报纸剪报情报模板"),
  cabinet: asset("intel_template_cabinet_minutes", "intel_document", "/assets/intel-documents/template-cabinet-minutes.png", "内阁会议纪要情报模板"),
  dossier: asset("intel_template_secret_dossier", "intel_document", "/assets/intel-documents/template-secret-dossier.png", "密件档案情报模板"),
};

export const endingVisuals: Record<string, VisualAsset> = {
  total_war: asset("ending_total_war", "ending_visual", "/assets/ending-visuals/ending-total-war.png", "欧洲系统进入全面战争的结局档案图", "系统崩溃：全面战争。"),
  delayed_war: asset("ending_delayed_war", "ending_visual", "/assets/ending-visuals/ending-delayed-war.png", "战争被推迟但系统未修复的结局档案图"),
  localized_war: asset("ending_localized_war", "ending_visual", "/assets/ending-visuals/ending-localized-war.png", "战争被限制在巴尔干的结局档案图"),
  conference_freeze: asset("ending_conference_freeze", "ending_visual", "/assets/ending-visuals/ending-conference-freeze.png", "国际会议冻结危机的结局档案图"),
  coercive_peace: asset("ending_coercive_peace", "ending_visual", "/assets/ending-visuals/ending-coercive-peace.png", "高压和平的结局档案图"),
  low_credibility_miracle: asset("ending_low_credibility_miracle", "ending_visual", "/assets/ending-visuals/ending-low-credibility-miracle.png", "低可信奇迹的结局档案图"),
  temporary_deescalation: asset("ending_temporary_deescalation", "ending_visual", "/assets/ending-visuals/ending-conference-freeze.png", "危机暂时降温的结局档案图"),
};

export const endingStampVisuals: Record<string, VisualAsset> = {
  total_war: asset("stamp_total_war", "stamp", "/assets/stamps/stamp-total-war.svg", "全面战争结局印章"),
  delayed_war: asset("stamp_delayed_war", "stamp", "/assets/stamps/stamp-delayed-war.svg", "延迟战争结局印章"),
  localized_war: asset("stamp_localized_war", "stamp", "/assets/stamps/stamp-localized-war.svg", "局部战争结局印章"),
  conference_freeze: asset("stamp_conference_freeze", "stamp", "/assets/stamps/stamp-conference-freeze.svg", "国际会议冻结结局印章"),
  coercive_peace: asset("stamp_coercive_peace", "stamp", "/assets/stamps/stamp-coercive-peace.svg", "高压和平结局印章"),
  low_credibility_miracle: asset("stamp_low_credibility_miracle", "stamp", "/assets/stamps/stamp-low-credibility-miracle.svg", "低可信奇迹结局印章"),
  temporary_deescalation: asset("stamp_temporary_deescalation", "stamp", "/assets/stamps/stamp-conference-freeze.svg", "危机降温结局印章"),
};

export const visualAssets: Record<string, VisualAsset> = {
  ...Object.fromEntries(Object.values(turnEventVisuals).map((item) => [item.id, item])),
  ...Object.fromEntries(Object.values(intelDocumentVisuals).map((item) => [item.id, item])),
  ...Object.fromEntries(Object.values(irreversibleEventVisuals).map((item) => [item.id, item])),
  ...Object.fromEntries(Object.values(crisisEventIconVisuals).map((item) => [item.id, item])),
  ...Object.fromEntries(Object.values(uiStateIconVisuals).map((item) => [item.id, item])),
  [irreversibleStampVisual.id]: irreversibleStampVisual,
  ...Object.fromEntries(Object.values(endingVisuals).map((item) => [item.id, item])),
  ...Object.fromEntries(Object.values(endingStampVisuals).map((item) => [item.id, item])),
};

export function resolveTurnEventAsset(turn: Pick<TimelineTurn, "turn" | "title"> & ImageCapable): VisualAsset {
  const explicit = fromImageFields(`turn_${turn.turn}_json`, "turn_event", turn, `${turn.title} 事件图`);
  if (explicit) return explicit;
  const mapped = turnEventVisuals[turn.turn];
  if (mapped) return { ...mapped, fallback: legacyTurnEventVisuals[turn.turn] };
  return asset("turn_event_fallback", "turn_event", "", `${turn.title} 事件图`);
}

export function resolveInterventionCardAsset(card: InterventionCard & ImageCapable): VisualAsset {
  const explicit = fromImageFields(`${card.id}_json`, "card_illustration", card, `${card.name} 卡牌图`);
  if (explicit) return explicit;
  return asset(`${card.id}_type_illustration`, "card_illustration", getCardTypeIllustration(card.type), `${card.name} 类型图例`, formatCardTypes(card.type));
}

export function resolveIntelAsset(card: IntelCard & ImageCapable): VisualAsset {
  const explicit = fromImageFields(`${card.id}_json`, "intel_document", card, `${card.title} 情报档案图`);
  if (explicit) return explicit;
  return intelDocumentVisuals[card.id] ?? resolveIntelTemplateAsset(card) ?? asset(`${card.id}_type_document`, "intel_document", getCardTypeIllustration([card.type, card.title]), `${card.title} 档案缩略图`, card.type);
}

export function resolveIrreversibleAsset(flag: string): VisualAsset {
  return irreversibleEventVisuals[flag] ?? asset(`irrev_${flag}`, "irreversible_event", "", `${flag} 不可逆节点图`);
}

export function resolveIrreversibleStampAsset(): VisualAsset {
  return irreversibleStampVisual;
}

export function resolveCrisisEventIconAsset(eventType?: string): VisualAsset {
  if (eventType && crisisEventIconVisuals[eventType]) return crisisEventIconVisuals[eventType];
  return asset("icon_event_default", "event_icon", "/assets/icons/icon-event.svg", "危机事件图标");
}

export function resolveUiStateAsset(state: "countdown" | "red_lock" | "window_closed"): VisualAsset {
  return uiStateIconVisuals[state];
}

export function resolveEndingVisualAsset(ending: EndingDefinition & ImageCapable): VisualAsset {
  const explicit = fromImageFields(`${ending.id}_visual`, "ending_visual", ending, `${ending.title} 结局主视觉`);
  if (explicit) return explicit;
  return endingVisuals[ending.type] ?? asset(`${ending.id}_ending_visual`, "ending_visual", "", `${ending.title} 结局主视觉`);
}

export function resolveEndingStampAsset(ending: EndingDefinition & ImageCapable): VisualAsset {
  if (ending.stamp) return asset(`${ending.id}_stamp_json`, "stamp", ending.stamp, `${ending.title} 结局印章`);
  return endingStampVisuals[ending.type] ?? endingStampVisuals.total_war;
}

export function resolveBackgroundAsset(status: TopStatusBarStatus): VisualAsset {
  return asset(`background_${status}`, "background", getCrisisStageBackground(status), `${status} 危机阶段背景`);
}

export function getVisualFallback(kind: VisualAssetKind): string {
  switch (kind) {
    case "turn_event":
      return "archive-map-gradient";
    case "card_illustration":
      return "card-paper-texture";
    case "intel_document":
      return "document-placeholder";
    case "irreversible_event":
      return "red-lock-archive";
    case "event_icon":
      return "event-icon-placeholder";
    case "ui_state":
      return "ui-state-placeholder";
    case "ending_visual":
      return "ending-report-placeholder";
    case "background":
      return "dark-archive-background";
    case "stamp":
      return "stamp-placeholder";
  }
}

function resolveIntelTemplateAsset(card: IntelCard): VisualAsset | null {
  const text = `${card.type} ${card.title} ${card.tags?.join(" ") ?? ""}`;
  if (/报|媒体|新闻|press|media|newspaper/i.test(text)) return intelTemplateVisuals.newspaper;
  if (/内阁|会议|cabinet|minutes/i.test(text)) return intelTemplateVisuals.cabinet;
  if (/电报|外交|telegram|diplomatic/i.test(text)) return intelTemplateVisuals.telegram;
  if (/密|备忘录|档案|dossier|memo|secret/i.test(text)) return intelTemplateVisuals.dossier;
  return null;
}

function asset(id: string, kind: VisualAssetKind, src: string, alt: string, caption?: string): VisualAsset {
  return { id, kind, src, alt, caption, fallback: getVisualFallback(kind) };
}

function fromImageFields(id: string, kind: VisualAssetKind, item: ImageCapable, alt: string): VisualAsset | null {
  const src = item.image ?? item.visual;
  if (!src) return null;
  return asset(id, kind, src, item.alt ?? alt, item.caption ?? item.imageCaption);
}

function formatCardTypes(type: string | string[]): string {
  return Array.isArray(type) ? type.join(" / ") : type;
}
