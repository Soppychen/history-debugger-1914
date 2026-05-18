import type { EndingDefinition, GameState } from "../types";
import type { TopStatusBarStatus } from "../design/componentVariants";

export type MusicTrackId =
  | "dawn_of_the_trenches"
  | "iron_torrent"
  | "unknown_soldier"
  | "echoes_of_history";

export interface MusicTrack {
  id: MusicTrackId;
  titleZh: string;
  titleEn: string;
  src: string;
  defaultVolume: number;
  loop: boolean;
  fadeInMs: number;
  fadeOutMs: number;
}

export type SfxCueId =
  | "ui_hover"
  | "ui_click"
  | "ui_confirm"
  | "intel_open"
  | "document_stamp"
  | "telegram_received"
  | "card_select"
  | "card_use"
  | "card_locked"
  | "card_expired"
  | "variable_up"
  | "variable_down"
  | "risk_warning"
  | "risk_critical"
  | "crisis"
  | "time_advance"
  | "turn_briefing"
  | "backlash_trigger"
  | "irreversible_lock"
  | "war_threshold"
  | "ending_report_open"
  | "ending_stamp_success"
  | "ending_stamp_failure";

export interface SfxSprite {
  id: SfxCueId;
  src: string;
  start: number;
  duration: number;
  volume: number;
}

export interface AudioSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}

export const defaultAudioSettings: AudioSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.62,
  sfxVolume: 0.78,
};

const audioRoot = "/assets/audio/music";

export const musicTracks: Record<MusicTrackId, MusicTrack> = {
  dawn_of_the_trenches: {
    id: "dawn_of_the_trenches",
    titleZh: "战壕的黎明",
    titleEn: "Dawn of the Trenches",
    src: `${audioRoot}/dawn_of_the_trenches.wav`,
    defaultVolume: 0.55,
    loop: true,
    fadeInMs: 1800,
    fadeOutMs: 1600,
  },
  iron_torrent: {
    id: "iron_torrent",
    titleZh: "钢铁洪流",
    titleEn: "Iron Torrent",
    src: `${audioRoot}/iron_torrent.wav`,
    defaultVolume: 0.65,
    loop: true,
    fadeInMs: 800,
    fadeOutMs: 1200,
  },
  unknown_soldier: {
    id: "unknown_soldier",
    titleZh: "无名战士",
    titleEn: "Unknown Soldier",
    src: `${audioRoot}/unknown_soldier.wav`,
    defaultVolume: 0.5,
    loop: true,
    fadeInMs: 1800,
    fadeOutMs: 1800,
  },
  echoes_of_history: {
    id: "echoes_of_history",
    titleZh: "历史的回响",
    titleEn: "Echoes of History",
    src: `${audioRoot}/echoes_of_history.wav`,
    defaultVolume: 0.58,
    loop: false,
    fadeInMs: 1400,
    fadeOutMs: 1800,
  },
};

// Timecodes are the current sprite map inferred from the composer-provided pause-separated masters.
// Keep all cue cuts here so final music department timecodes can be dropped in without touching UI code.
export const sfxSprites: Record<SfxCueId, SfxSprite> = {
  ui_hover: { id: "ui_hover", src: `${audioRoot}/ui_intel_sfx.wav`, start: 0.05, duration: 0.45, volume: 0.28 },
  ui_click: { id: "ui_click", src: `${audioRoot}/ui_intel_sfx.wav`, start: 3.42, duration: 0.42, volume: 0.48 },
  ui_confirm: { id: "ui_confirm", src: `${audioRoot}/ui_intel_sfx.wav`, start: 7.42, duration: 1.05, volume: 0.58 },
  intel_open: { id: "intel_open", src: `${audioRoot}/ui_intel_sfx.wav`, start: 9.42, duration: 1.05, volume: 0.62 },
  document_stamp: { id: "document_stamp", src: `${audioRoot}/ui_intel_sfx.wav`, start: 11.42, duration: 1.45, volume: 0.7 },
  telegram_received: { id: "telegram_received", src: `${audioRoot}/ui_intel_sfx.wav`, start: 27.4, duration: 0.85, volume: 0.6 },
  card_select: { id: "card_select", src: `${audioRoot}/card_sfx.wav`, start: 0.38, duration: 0.18, volume: 0.62 },
  card_use: { id: "card_use", src: `${audioRoot}/card_sfx.wav`, start: 1.05, duration: 1.15, volume: 0.7 },
  card_locked: { id: "card_locked", src: `${audioRoot}/card_sfx.wav`, start: 2.82, duration: 0.62, volume: 0.62 },
  card_expired: { id: "card_expired", src: `${audioRoot}/card_sfx.wav`, start: 3.5, duration: 1.4, volume: 0.56 },
  variable_up: { id: "variable_up", src: `${audioRoot}/risk_sfx.wav`, start: 0.05, duration: 1.1, volume: 0.52 },
  variable_down: { id: "variable_down", src: `${audioRoot}/risk_sfx.wav`, start: 4.12, duration: 1.3, volume: 0.5 },
  risk_warning: { id: "risk_warning", src: `${audioRoot}/risk_sfx.wav`, start: 27.08, duration: 2.2, volume: 0.6 },
  risk_critical: { id: "risk_critical", src: `${audioRoot}/risk_sfx.wav`, start: 44.5, duration: 1.1, volume: 0.72 },
  crisis: { id: "crisis", src: `${audioRoot}/risk_sfx.wav`, start: 46.1, duration: 4.2, volume: 0.65 },
  time_advance: { id: "time_advance", src: `${audioRoot}/time_lock_sfx.wav`, start: 0.05, duration: 0.28, volume: 0.62 },
  turn_briefing: { id: "turn_briefing", src: `${audioRoot}/time_lock_sfx.wav`, start: 1.08, duration: 0.36, volume: 0.6 },
  backlash_trigger: { id: "backlash_trigger", src: `${audioRoot}/time_lock_sfx.wav`, start: 2.08, duration: 2.25, volume: 0.72 },
  irreversible_lock: { id: "irreversible_lock", src: `${audioRoot}/time_lock_sfx.wav`, start: 5.08, duration: 3.1, volume: 0.74 },
  war_threshold: { id: "war_threshold", src: `${audioRoot}/time_lock_sfx.wav`, start: 18.08, duration: 4.6, volume: 0.76 },
  ending_report_open: { id: "ending_report_open", src: `${audioRoot}/ending_sfx.wav`, start: 0.56, duration: 2.6, volume: 0.72 },
  ending_stamp_success: { id: "ending_stamp_success", src: `${audioRoot}/ending_sfx.wav`, start: 34.9, duration: 2.2, volume: 0.76 },
  ending_stamp_failure: { id: "ending_stamp_failure", src: `${audioRoot}/ending_sfx.wav`, start: 52.0, duration: 3.8, volume: 0.78 },
};

export function resolveMusicTrack(params: {
  state: GameState;
  crisisStage: TopStatusBarStatus;
  ending: EndingDefinition | null;
}): MusicTrackId {
  const warProbability = params.state.variables.war_probability ?? 0;
  if (params.ending) {
    if (params.ending.type === "total_war" || params.ending.type === "delayed_war") {
      return "unknown_soldier";
    }
    if (params.ending.type === "localized_war" && warProbability >= 60) {
      return "unknown_soldier";
    }
    return "echoes_of_history";
  }

  if (
    params.state.flags.russian_general_mobilization ||
    params.state.flags.germany_invaded_belgium ||
    params.crisisStage === "warImminent" ||
    params.crisisStage === "irreversible" ||
    warProbability >= 80
  ) {
    return "iron_torrent";
  }

  if (params.crisisStage === "mobilization") {
    return "iron_torrent";
  }

  return "dawn_of_the_trenches";
}

export function isFailureEnding(ending: EndingDefinition): boolean {
  return ["total_war", "delayed_war"].includes(ending.type);
}
