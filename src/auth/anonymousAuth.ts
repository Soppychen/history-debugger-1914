import type { ConsentState } from "../analytics/eventTypes";

const PLAYER_STORE_KEY = "hd_players";
const DEVICE_TOKEN_KEY = "hd_device_token";
const CURRENT_PLAYER_ID_KEY = "hd_current_player_id";
const CURRENT_RECOVERY_CODE_KEY = "hd_current_recovery_code";
const CONSENT_KEY = "hd_consent_state";
const CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const CONSENT_VERSION = "account-analytics-v1";

export interface Player {
  id: string;
  recoveryCodeHash: string;
  createdAt: string;
  lastSeenAt: string;
  status: "active" | "deleted" | "banned";
  consentVersion: string;
  analyticsConsent: boolean;
}

export interface DeviceSession {
  id: string;
  playerId: string;
  deviceTokenHash: string;
  createdAt: string;
  lastSeenAt: string;
  userAgentHash?: string;
  revokedAt?: string | null;
}

export interface StoredAuthData {
  players: Player[];
  devices: DeviceSession[];
}

export interface PlayerSession {
  player: Player;
  recoveryCode: string;
  deviceToken: string;
  anonymousSessionId: string;
  isNewPlayer: boolean;
}

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

function readStore(): StoredAuthData {
  return safeRead<StoredAuthData>(PLAYER_STORE_KEY, { players: [], devices: [] });
}

function writeStore(store: StoredAuthData) {
  writeJson(PLAYER_STORE_KEY, store);
}

function randomId(prefix: string): string {
  const bytes = new Uint8Array(12);
  window.crypto.getRandomValues(bytes);
  return `${prefix}_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function randomCodeGroup(): string {
  const bytes = new Uint8Array(4);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => CODE_CHARSET[byte % CODE_CHARSET.length]).join("");
}

export function generateRecoveryCode(): string {
  return `HD-${randomCodeGroup()}-${randomCodeGroup()}-${randomCodeGroup()}-${randomCodeGroup()}`;
}

export function normalizeRecoveryCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

// Local mock hash only. A real backend should use a server-side cryptographic hash.
export function hashIdentitySecret(value: string): string {
  let hash = 2166136261;
  for (const char of normalizeRecoveryCode(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `h_${(hash >>> 0).toString(16)}`;
}

export function getDefaultConsentState(): ConsentState {
  return {
    version: CONSENT_VERSION,
    necessaryAccepted: true,
    analyticsAccepted: false,
    decidedAt: null,
  };
}

export function loadConsentState(): ConsentState {
  const stored = safeRead<ConsentState | null>(CONSENT_KEY, null);
  if (!stored || stored.version !== CONSENT_VERSION) return getDefaultConsentState();
  return stored;
}

export function saveConsentState(consent: ConsentState) {
  writeJson(CONSENT_KEY, consent);
  const playerId = window.localStorage.getItem(CURRENT_PLAYER_ID_KEY);
  if (!playerId) return;
  const store = readStore();
  const nextPlayers = store.players.map((player) =>
    player.id === playerId
      ? { ...player, analyticsConsent: consent.analyticsAccepted, consentVersion: consent.version, lastSeenAt: new Date().toISOString() }
      : player,
  );
  writeStore({ ...store, players: nextPlayers });
}

function persistCurrentIdentity(player: Player, recoveryCode: string, deviceToken: string) {
  window.localStorage.setItem(CURRENT_PLAYER_ID_KEY, player.id);
  window.localStorage.setItem(CURRENT_RECOVERY_CODE_KEY, recoveryCode);
  window.localStorage.setItem(DEVICE_TOKEN_KEY, deviceToken);
}

function sessionFromPlayer(player: Player, recoveryCode: string, deviceToken: string, isNewPlayer: boolean): PlayerSession {
  return {
    player,
    recoveryCode,
    deviceToken,
    anonymousSessionId: randomId("ses"),
    isNewPlayer,
  };
}

export function initializeAnonymousPlayer(): PlayerSession {
  const now = new Date().toISOString();
  const store = readStore();
  const currentPlayerId = window.localStorage.getItem(CURRENT_PLAYER_ID_KEY);
  const currentRecoveryCode = window.localStorage.getItem(CURRENT_RECOVERY_CODE_KEY);
  const deviceToken = window.localStorage.getItem(DEVICE_TOKEN_KEY);
  const existing = currentPlayerId ? store.players.find((player) => player.id === currentPlayerId) : null;

  if (existing && currentRecoveryCode && deviceToken) {
    const nextPlayer = { ...existing, lastSeenAt: now };
    writeStore({
      ...store,
      players: store.players.map((player) => (player.id === nextPlayer.id ? nextPlayer : player)),
    });
    return sessionFromPlayer(nextPlayer, currentRecoveryCode, deviceToken, false);
  }

  const recoveryCode = generateRecoveryCode();
  const nextDeviceToken = randomId("dev");
  const consent = loadConsentState();
  const player: Player = {
    id: randomId("plr"),
    recoveryCodeHash: hashIdentitySecret(recoveryCode),
    createdAt: now,
    lastSeenAt: now,
    status: "active",
    consentVersion: consent.version,
    analyticsConsent: consent.analyticsAccepted,
  };
  const device: DeviceSession = {
    id: randomId("dvc"),
    playerId: player.id,
    deviceTokenHash: hashIdentitySecret(nextDeviceToken),
    createdAt: now,
    lastSeenAt: now,
    userAgentHash: hashIdentitySecret(window.navigator.userAgent || "unknown"),
    revokedAt: null,
  };

  writeStore({ players: [...store.players, player], devices: [...store.devices, device] });
  persistCurrentIdentity(player, recoveryCode, nextDeviceToken);
  return sessionFromPlayer(player, recoveryCode, nextDeviceToken, true);
}

export function recoverPlayerByCode(code: string): PlayerSession | null {
  const normalized = normalizeRecoveryCode(code);
  const store = readStore();
  const player = store.players.find((item) => item.recoveryCodeHash === hashIdentitySecret(normalized));
  if (!player || player.status !== "active") return null;

  const now = new Date().toISOString();
  const deviceToken = randomId("dev");
  const updatedPlayer = { ...player, lastSeenAt: now };
  const device: DeviceSession = {
    id: randomId("dvc"),
    playerId: player.id,
    deviceTokenHash: hashIdentitySecret(deviceToken),
    createdAt: now,
    lastSeenAt: now,
    userAgentHash: hashIdentitySecret(window.navigator.userAgent || "unknown"),
    revokedAt: null,
  };

  writeStore({
    players: store.players.map((item) => (item.id === player.id ? updatedPlayer : item)),
    devices: [...store.devices, device],
  });
  persistCurrentIdentity(updatedPlayer, normalized, deviceToken);
  return sessionFromPlayer(updatedPlayer, normalized, deviceToken, false);
}

export function getStoredPlayers(): Player[] {
  return readStore().players;
}

export function resetLocalIdentity() {
  window.localStorage.removeItem(CURRENT_PLAYER_ID_KEY);
  window.localStorage.removeItem(CURRENT_RECOVERY_CODE_KEY);
  window.localStorage.removeItem(DEVICE_TOKEN_KEY);
}
