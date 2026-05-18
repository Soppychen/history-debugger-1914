import {
  defaultAudioSettings,
  musicTracks,
  sfxSprites,
  type AudioSettings,
  type MusicTrackId,
  type SfxCueId,
} from "./audioConfig";

const settingsKey = "history-debugger-1914-audio-settings";

function canUseAudio(): boolean {
  return typeof window !== "undefined" && typeof Audio !== "undefined";
}

function clampVolume(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function loadAudioSettings(): AudioSettings {
  if (typeof window === "undefined") return defaultAudioSettings;
  try {
    const raw = window.localStorage.getItem(settingsKey);
    if (!raw) return defaultAudioSettings;
    return { ...defaultAudioSettings, ...JSON.parse(raw) };
  } catch {
    return defaultAudioSettings;
  }
}

export function saveAudioSettings(settings: AudioSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(settingsKey, JSON.stringify(settings));
}

class AudioManager {
  private settings: AudioSettings = defaultAudioSettings;
  private unlocked = false;
  private activeMusic: HTMLAudioElement | null = null;
  private currentTrackId: MusicTrackId | null = null;
  private pendingTrackId: MusicTrackId | null = null;
  private fadeTimers = new Set<number>();

  isUnlocked() {
    return this.unlocked;
  }

  setSettings(settings: AudioSettings) {
    this.settings = {
      musicEnabled: settings.musicEnabled,
      sfxEnabled: settings.sfxEnabled,
      musicVolume: clampVolume(settings.musicVolume),
      sfxVolume: clampVolume(settings.sfxVolume),
    };
    if (!this.settings.musicEnabled) {
      this.stopMusic(500);
    } else if (this.pendingTrackId) {
      this.playMusic(this.pendingTrackId);
    } else if (this.activeMusic && this.currentTrackId) {
      const track = musicTracks[this.currentTrackId];
      this.activeMusic.volume = this.getMusicVolume(track.defaultVolume);
    }
  }

  async unlockAudio() {
    if (!canUseAudio()) return;
    if (this.unlocked) return;
    this.unlocked = true;

    const unlocker = new Audio();
    unlocker.muted = true;
    try {
      await unlocker.play();
      unlocker.pause();
    } catch {
      // Browsers may reject silent unlock probes. The next user-initiated audio call can still succeed.
    }

    if (this.pendingTrackId && this.settings.musicEnabled) {
      this.playMusic(this.pendingTrackId, true);
    }
  }

  playMusic(trackId: MusicTrackId, force = false) {
    this.pendingTrackId = trackId;
    if (!canUseAudio() || !this.settings.musicEnabled) return;
    if (!this.unlocked && !force) return;
    if (this.currentTrackId === trackId && this.activeMusic && !this.activeMusic.paused) return;

    const track = musicTracks[trackId];
    const nextAudio = new Audio(track.src);
    nextAudio.loop = track.loop;
    nextAudio.volume = 0;
    nextAudio.preload = "auto";

    const previous = this.activeMusic;
    this.activeMusic = nextAudio;
    this.currentTrackId = trackId;

    nextAudio.play().then(() => {
      this.fade(nextAudio, this.getMusicVolume(track.defaultVolume), track.fadeInMs);
      if (previous) this.fadeOutAndStop(previous, track.fadeOutMs);
    }).catch(() => {
      nextAudio.pause();
      if (previous) {
        this.activeMusic = previous;
      }
    });
  }

  stopMusic(fadeMs = 700) {
    if (!this.activeMusic) return;
    const audio = this.activeMusic;
    this.activeMusic = null;
    this.currentTrackId = null;
    this.fadeOutAndStop(audio, fadeMs);
  }

  playSfx(cueId: SfxCueId) {
    if (!canUseAudio() || !this.unlocked || !this.settings.sfxEnabled) return;
    const sprite = sfxSprites[cueId];
    const audio = new Audio(sprite.src);
    audio.volume = clampVolume(sprite.volume * this.settings.sfxVolume);
    audio.preload = "auto";

    const startPlayback = () => {
      try {
        audio.currentTime = sprite.start;
      } catch {
        return;
      }
      audio.play().catch(() => undefined);
      window.setTimeout(() => {
        audio.pause();
        audio.src = "";
      }, Math.max(50, sprite.duration * 1000));
    };

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      startPlayback();
    } else {
      audio.addEventListener("loadedmetadata", startPlayback, { once: true });
      audio.load();
    }
  }

  private getMusicVolume(defaultVolume: number) {
    return clampVolume(defaultVolume * this.settings.musicVolume);
  }

  private fade(audio: HTMLAudioElement, targetVolume: number, durationMs: number) {
    const fromVolume = audio.volume;
    const startedAt = window.performance.now();
    const timer = window.setInterval(() => {
      const progress = durationMs <= 0 ? 1 : Math.min(1, (window.performance.now() - startedAt) / durationMs);
      audio.volume = clampVolume(fromVolume + (targetVolume - fromVolume) * progress);
      if (progress >= 1) {
        window.clearInterval(timer);
        this.fadeTimers.delete(timer);
      }
    }, 50);
    this.fadeTimers.add(timer);
  }

  private fadeOutAndStop(audio: HTMLAudioElement, durationMs: number) {
    const fromVolume = audio.volume;
    const startedAt = window.performance.now();
    const timer = window.setInterval(() => {
      const progress = durationMs <= 0 ? 1 : Math.min(1, (window.performance.now() - startedAt) / durationMs);
      audio.volume = clampVolume(fromVolume * (1 - progress));
      if (progress >= 1) {
        window.clearInterval(timer);
        this.fadeTimers.delete(timer);
        audio.pause();
        audio.src = "";
      }
    }, 50);
    this.fadeTimers.add(timer);
  }
}

export const audioManager = new AudioManager();
