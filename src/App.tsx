import { useEffect, useMemo, useRef, useState } from "react";
import {
  applyCard,
  applyTurnPressure,
  createInitialState,
  deriveCrisisStage,
  findEnding,
  getExpiredCards,
  getExpiringCards,
  getIrreversibleFlags,
  getOpportunityCosts,
  getRequirementFailure,
  getRiskStage,
  getUpcomingCrisisEvents,
  getVisibleCards,
  shouldEndImmediately,
} from "./gameLogic";
import {
  ActionResultModal,
  AdvanceTurnConfirmModal,
  AssetImage,
  AudioControlPanel,
  CardDetailModal,
  CausalGraphPanel,
  EndingReportModal,
  IntelModal,
  IntelTray,
  InterventionCardTray,
  IrreversibleEventBanner,
  OpportunityCostPanel,
  TimelinePanel,
  TimeAdvanceReportModal,
  TopStatusBar,
  TurnBriefingModal,
  UpcomingCrisisEvents,
  VariablePanel,
} from "./components";
import { getTurnEventImage } from "./design/artAssets";
import { generateEndingReport } from "./engine/generateEndingReport";
import {
  isFailureEnding,
  musicTracks,
  resolveMusicTrack,
  type AudioSettings,
  type SfxCueId,
} from "./audio/audioConfig";
import { audioManager, loadAudioSettings, saveAudioSettings } from "./audio/audioManager";
import { localizeDataBundle, t, type Language } from "./i18n";
import {
  initializeAnonymousPlayer,
  loadConsentState,
  recoverPlayerByCode,
  saveConsentState,
  type PlayerSession,
} from "./auth/anonymousAuth";
import { getAdminAnalyticsSnapshot, recordAnalyticsEvent } from "./analytics/analyticsClient";
import { AdminAnalyticsPage } from "./components/AdminAnalyticsPage";
import { LoadByCodeModal } from "./components/LoadByCodeModal";
import { PrivacyConsentModal } from "./components/PrivacyConsentModal";
import { RecoveryCodeModal } from "./components/RecoveryCodeModal";
import { SaveGamePanel } from "./components/SaveGamePanel";
import { createAutosave, createEndingArchive, createSaveGame, getSavesForPlayer } from "./save/saveClient";
import type { AnalyticsEventType, ConsentState, SaveGame } from "./analytics/eventTypes";
import type {
  ActionLogEntry,
  DataBundle,
  EndingDefinition,
  GameState,
  IntelCard,
  InterventionCard,
  TimelineTurn,
  VariableDefinition,
} from "./types";

const DATA_FILES = {
  variables: "/data/variables_1914.json",
  timeline: "/data/timeline_1914.json",
  interventionCards: "/data/intervention_cards_1914.json",
  intelCards: "/data/intel_cards_1914.json",
  endings: "/data/endings_1914.json",
} as const;

async function loadJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`无法读取 ${url}`);
  }
  return response.json() as Promise<T>;
}

function App() {
  const [data, setData] = useState<DataBundle | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedIntelId, setSelectedIntelId] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<ActionLogEntry | null>(null);
  const [advanceConfirmOpen, setAdvanceConfirmOpen] = useState(false);
  const [briefingTurn, setBriefingTurn] = useState<number | null>(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => loadAudioSettings());
  const [audioUnlocked, setAudioUnlocked] = useState(() => audioManager.isUnlocked());
  const [language, setLanguage] = useState<Language>(() => (window.localStorage.getItem("history-debugger-1914-language") as Language) || "zh");
  const [playerSession, setPlayerSession] = useState<PlayerSession | null>(null);
  const [consent, setConsent] = useState<ConsentState>(() => loadConsentState());
  const [saves, setSaves] = useState<SaveGame[]>([]);
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);
  const [recoveryCodeOpen, setRecoveryCodeOpen] = useState(false);
  const [loadByCodeOpen, setLoadByCodeOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(() => loadConsentState().decidedAt === null);
  const [isAdminPage, setIsAdminPage] = useState(() => window.location.hash === "#admin");
  const [adminSnapshot, setAdminSnapshot] = useState(() => getAdminAnalyticsSnapshot());
  const lastEndingCueRef = useRef<string | null>(null);
  const sessionRecordedRef = useRef<string | null>(null);

  useEffect(() => {
    const session = initializeAnonymousPlayer();
    setPlayerSession(session);
    setSaves(getSavesForPlayer(session.player.id));
    if (session.isNewPlayer) setRecoveryCodeOpen(true);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const nextIsAdmin = window.location.hash === "#admin";
      setIsAdminPage(nextIsAdmin);
      if (nextIsAdmin) setAdminSnapshot(getAdminAnalyticsSnapshot());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!playerSession || !state || sessionRecordedRef.current === playerSession.anonymousSessionId) return;
    sessionRecordedRef.current = playerSession.anonymousSessionId;
    recordEvent("session_start", { isNewPlayer: playerSession.isNewPlayer }, true);
    recordEvent("case_start", { turn: state.turn, warProbability: state.variables.war_probability }, true);
  }, [playerSession?.anonymousSessionId, state?.turn]);

  useEffect(() => {
    Promise.all([
      loadJson<VariableDefinition[]>(DATA_FILES.variables),
      loadJson<TimelineTurn[]>(DATA_FILES.timeline),
      loadJson<InterventionCard[]>(DATA_FILES.interventionCards),
      loadJson<IntelCard[]>(DATA_FILES.intelCards),
      loadJson<EndingDefinition[]>(DATA_FILES.endings),
    ])
      .then(([variables, timeline, interventionCards, intelCards, endings]) => {
        const bundle = { variables, timeline, interventionCards, intelCards, endings };
        setData(bundle);
        setState(createInitialState(variables));
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : "数据加载失败");
      });
  }, []);

  useEffect(() => {
    audioManager.setSettings(audioSettings);
    saveAudioSettings(audioSettings);
  }, [audioSettings]);

  useEffect(() => {
    window.localStorage.setItem("history-debugger-1914-language", language);
  }, [language]);

  useEffect(() => {
    const unlockOnFirstGesture = () => {
      audioManager.unlockAudio();
      setAudioUnlocked(audioManager.isUnlocked());
    };
    window.addEventListener("pointerdown", unlockOnFirstGesture, { once: true });
    window.addEventListener("keydown", unlockOnFirstGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockOnFirstGesture);
      window.removeEventListener("keydown", unlockOnFirstGesture);
    };
  }, []);

  const displayData = useMemo(() => {
    if (!data) return null;
    return localizeDataBundle(data, language);
  }, [data, language]);

  const currentTurn = useMemo(() => {
    if (!displayData || !state) return null;
    return displayData.timeline.find((item) => item.turn === state.turn) ?? displayData.timeline[0];
  }, [displayData, state]);

  const currentIntel = useMemo(() => {
    if (!displayData || !currentTurn) return [];
    const recommended = new Set(currentTurn.recommendedIntel);
    return displayData.intelCards.filter((card) => recommended.has(card.id));
  }, [currentTurn, displayData]);

  const visibleCards = useMemo(() => {
    if (!displayData || !state) return [];
    return getVisibleCards(displayData, state);
  }, [displayData, state]);

  const selectedCard = visibleCards.find((card) => card.id === selectedCardId) ?? null;
  const selectedIntel = currentIntel.find((intel) => intel.id === selectedIntelId) ?? null;
  const expiringCards = useMemo(() => {
    if (!state) return [];
    return getExpiringCards(visibleCards, state);
  }, [state, visibleCards]);
  const expiredCards = useMemo(() => {
    if (!displayData || !state) return [];
    return getExpiredCards(displayData, state);
  }, [displayData, state]);
  const upcomingEvents = useMemo(() => {
    if (!displayData || !state) return [];
    return getUpcomingCrisisEvents(displayData, state);
  }, [displayData, state]);
  const opportunityCosts = useMemo(() => {
    if (!displayData || !state) return [];
    return getOpportunityCosts(displayData, state, visibleCards);
  }, [displayData, state, visibleCards]);
  const irreversibleFlags = useMemo(() => {
    if (!state) return [];
    return getIrreversibleFlags(state);
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const crisisStage = deriveCrisisStage(state);
    audioManager.playMusic(resolveMusicTrack({ state, crisisStage, ending: state.ending }));
  }, [state?.turn, state?.ending?.id, state?.variables.war_probability, state?.flags.russian_general_mobilization, state?.flags.germany_invaded_belgium]);

  useEffect(() => {
    if (!state?.ending || lastEndingCueRef.current === state.ending.id) return;
    lastEndingCueRef.current = state.ending.id;
    playSfx("ending_report_open");
    window.setTimeout(() => {
      playSfx(isFailureEnding(state.ending!) ? "ending_stamp_failure" : "ending_stamp_success");
    }, 520);
  }, [state?.ending]);

  function refreshSaves(session = playerSession) {
    if (!session) return;
    setSaves(getSavesForPlayer(session.player.id));
  }

  function recordEvent(
    type: AnalyticsEventType,
    payload: Record<string, unknown> = {},
    required = false,
    eventTurn = state?.turn,
    saveId?: string,
  ) {
    if (!playerSession) return null;
    const event = recordAnalyticsEvent(
      {
        playerId: playerSession.player.id,
        anonymousSessionId: playerSession.anonymousSessionId,
        type,
        turn: eventTurn,
        payload,
        required,
        saveId,
      },
      consent,
    );
    if (isAdminPage) setAdminSnapshot(getAdminAnalyticsSnapshot());
    return event;
  }

  function dateForState(nextState: GameState, bundle = displayData): string {
    return bundle?.timeline.find((turn) => turn.turn === nextState.turn)?.dateRange ?? `Turn ${nextState.turn}`;
  }

  function persistAutosave(nextState: GameState, required = true) {
    if (!playerSession) return null;
    const save = createAutosave({
      playerId: playerSession.player.id,
      state: nextState,
      dateLabel: dateForState(nextState),
      crisisStage: deriveCrisisStage(nextState),
    });
    recordEvent("save_created", { slotType: save.slotType, slotName: save.slotName }, required, nextState.turn, save.id);
    refreshSaves();
    return save;
  }

  function persistEndingArchive(nextState: GameState) {
    if (!playerSession || !nextState.ending) return null;
    const save = createEndingArchive({
      playerId: playerSession.player.id,
      state: nextState,
      dateLabel: dateForState(nextState),
      crisisStage: deriveCrisisStage(nextState),
    });
    recordEvent("ending_reached", {
      endingId: nextState.ending.id,
      endingType: nextState.ending.type,
      warProbability: nextState.variables.war_probability,
    }, true, nextState.turn, save.id);
    recordEvent("save_created", { slotType: save.slotType, slotName: save.slotName }, true, nextState.turn, save.id);
    refreshSaves();
    return save;
  }

  function unlockAudio() {
    audioManager.unlockAudio();
    setAudioUnlocked(audioManager.isUnlocked());
  }

  function playSfx(cueId: SfxCueId) {
    unlockAudio();
    audioManager.playSfx(cueId);
  }

  function playChangeCue(action: ActionLogEntry) {
    const allChanges = [
      ...action.effects,
      ...action.risks.flatMap((risk) => risk.effects),
    ];
    if (action.risks.length > 0) {
      playSfx("backlash_trigger");
    } else if (allChanges.some((change) => change.delta > 0)) {
      playSfx("variable_up");
    } else if (allChanges.some((change) => change.delta < 0)) {
      playSfx("variable_down");
    }
  }

  function playWarRiskCue(beforeWarProbability: number, afterWarProbability: number) {
    if (beforeWarProbability < 80 && afterWarProbability >= 80) {
      playSfx("war_threshold");
      return;
    }
    if (beforeWarProbability < 70 && afterWarProbability >= 70) {
      playSfx("risk_critical");
      return;
    }
    if (beforeWarProbability < 40 && afterWarProbability >= 40) {
      playSfx("risk_warning");
    }
  }

  function restart() {
    if (!data) return;
    playSfx("ui_confirm");
    lastEndingCueRef.current = null;
    const nextState = createInitialState(data.variables);
    setState(nextState);
    setSelectedCardId(null);
    setSelectedIntelId(null);
    setLastAction(null);
    setAdvanceConfirmOpen(false);
    setBriefingTurn(1);
    recordEvent("restart_case", { previousTurn: state?.turn, hadEnding: Boolean(state?.ending) }, true);
    persistAutosave(nextState);
  }

  function exportStateJson() {
    if (!state) return;
    playSfx("document_stamp");
    const payload = JSON.stringify(state, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `history-debugger-1914-state-turn-${state.turn}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function readIntel(intelId: string) {
    const alreadyRead = state?.revealedIntelIds.includes(intelId);
    playSfx(alreadyRead ? "intel_open" : "telegram_received");
    setSelectedIntelId(intelId);
    setState((prev) => {
      if (!prev || prev.revealedIntelIds.includes(intelId)) return prev;
      return { ...prev, revealedIntelIds: [...prev.revealedIntelIds, intelId] };
    });
    recordEvent("intel_opened", { intelId, alreadyRead: Boolean(alreadyRead) }, false);
  }

  function selectCard(cardId: string) {
    if (!state) return;
    const card = visibleCards.find((item) => item.id === cardId);
    if (!card) return;
    const failure = getRequirementFailure(card, state);
    const apBlocked = state.ap < card.cost;
    playSfx(failure || apBlocked ? "card_locked" : "card_select");
    setSelectedCardId(cardId);
    recordEvent(failure || apBlocked ? "card_locked_clicked" : "card_selected", {
      cardId,
      cardTypes: card.type,
      failure,
      apBlocked,
      cost: card.cost,
      ap: state.ap,
    }, false);
  }

  function useSelectedCard() {
    if (!data || !state || !selectedCard) return;
    const failure = getRequirementFailure(selectedCard, state);
    if (failure || state.ap < selectedCard.cost) return;

    const beforeWarProbability = state.variables.war_probability ?? 0;
    const next = applyCard(state, selectedCard, data.variables);
    const immediateEnding = shouldEndImmediately(next, data.endings);
    const finalState = immediateEnding ? { ...next, ending: immediateEnding } : next;
    const action = finalState.actionLog[0];
    setState(finalState);
    setLastAction(action);
    setSelectedCardId(null);
    playSfx("card_use");
    playChangeCue(action);
    const afterWarProbability = finalState.variables.war_probability ?? 0;
    playWarRiskCue(beforeWarProbability, afterWarProbability);
    recordEvent("card_used", {
      cardId: selectedCard.id,
      cardTypes: selectedCard.type,
      feasibility: selectedCard.feasibility,
      cost: selectedCard.cost,
      warProbability: afterWarProbability,
      riskCount: action.risks.length,
    }, false, finalState.turn);
    action.effects.forEach((change) => {
      recordEvent("variable_changed", {
        source: "card",
        cardId: selectedCard.id,
        variable: change.variable,
        delta: change.delta,
        before: change.before,
        after: change.after,
      }, false, finalState.turn);
    });
    action.risks.forEach((risk) => {
      recordEvent("risk_triggered", { cardId: selectedCard.id, riskId: risk.id, effectCount: risk.effects.length }, false, finalState.turn);
    });
    persistAutosave(finalState);
    if (finalState.ending) persistEndingArchive(finalState);
  }

  function openAdvanceConfirm() {
    if (!state?.ending) {
      playSfx("ui_confirm");
      setAdvanceConfirmOpen(true);
      recordEvent("advance_turn_clicked", { warProbability: state?.variables.war_probability }, false);
    }
  }

  function advanceTurn() {
    if (!data || !state || !currentTurn || state.ending) return;

    const beforeWarProbability = state.variables.war_probability ?? 0;
    const beforeIrreversible = new Set(getIrreversibleFlags(state));
    const pressured = applyTurnPressure(state, currentTurn, data.variables);
    const ending = pressured.turn >= data.timeline.length ? findEnding(pressured, data.endings) : shouldEndImmediately(pressured, data.endings);
    const nextState = ending
      ? { ...pressured, ending }
      : {
          ...pressured,
          turn: Math.min(pressured.turn + 1, data.timeline.length),
          ap: pressured.maxAp,
        };
    setState(nextState);
    setLastAction(nextState.actionLog[0]);
    setSelectedCardId(null);
    setAdvanceConfirmOpen(false);
    if (!ending) setBriefingTurn(nextState.turn);
    playSfx("time_advance");
    const action = nextState.actionLog[0];
    playChangeCue(action);
    if (getExpiredCards(data, nextState, 1).length > 0) playSfx("card_expired");
    const afterWarProbability = nextState.variables.war_probability ?? 0;
    const afterIrreversible = getIrreversibleFlags(nextState);
    playWarRiskCue(beforeWarProbability, afterWarProbability);
    if (afterIrreversible.some((flag) => !beforeIrreversible.has(flag))) playSfx("irreversible_lock");
    recordEvent("advance_turn_confirmed", {
      fromTurn: state.turn,
      toTurn: nextState.turn,
      warProbability: afterWarProbability,
    }, false, nextState.turn);
    recordEvent("turn_end", { turnTitle: currentTurn.title, warProbability: afterWarProbability }, false, state.turn);
    action.effects.forEach((change) => {
      recordEvent("variable_changed", {
        source: "turn",
        variable: change.variable,
        delta: change.delta,
        before: change.before,
        after: change.after,
      }, false, nextState.turn);
    });
    action.risks.forEach((risk) => {
      recordEvent("risk_triggered", { source: "specialRule", riskId: risk.id, effectCount: risk.effects.length }, false, nextState.turn);
    });
    getExpiredCards(data, nextState, 1).forEach((card) => {
      recordEvent("card_expired", { cardId: card.id, turnRange: card.turnRange }, false, nextState.turn);
    });
    afterIrreversible
      .filter((flag) => !beforeIrreversible.has(flag))
      .forEach((flag) => recordEvent("irreversible_event_triggered", { flag }, false, nextState.turn));
    persistAutosave(nextState);
    if (nextState.ending) persistEndingArchive(nextState);
    if (!ending) {
      window.setTimeout(() => playSfx("turn_briefing"), 360);
    }
  }

  function handleConsentSave(nextConsent: ConsentState) {
    saveConsentState(nextConsent);
    setConsent(nextConsent);
    setPrivacyOpen(false);
    recordEvent("settings_changed", { analyticsAccepted: nextConsent.analyticsAccepted }, true);
  }

  function handleRecover(code: string): boolean {
    const recovered = recoverPlayerByCode(code);
    if (!recovered) return false;
    const recoveredSaves = getSavesForPlayer(recovered.player.id);
    const latestSave = recoveredSaves[0] ?? null;
    const previousTurn = state?.turn ?? latestSave?.turn ?? 1;
    setPlayerSession(recovered);
    setSaves(recoveredSaves);
    if (latestSave) {
      setState(latestSave.gameState);
      setSelectedCardId(null);
      setSelectedIntelId(null);
      setLastAction(null);
      setAdvanceConfirmOpen(false);
      setBriefingTurn(latestSave.gameState.ending ? null : latestSave.gameState.turn);
      lastEndingCueRef.current = latestSave.gameState.ending?.id ?? null;
    }
    recordAnalyticsEvent(
      {
        playerId: recovered.player.id,
        anonymousSessionId: recovered.anonymousSessionId,
        type: "session_start",
        payload: { recoveredByCode: true, loadedLatestSave: Boolean(latestSave) },
        required: true,
      },
      consent,
    );
    if (latestSave) {
      recordAnalyticsEvent(
        {
          playerId: recovered.player.id,
          anonymousSessionId: recovered.anonymousSessionId,
          type: "save_loaded",
          turn: latestSave.turn,
          saveId: latestSave.id,
          payload: {
            saveId: latestSave.id,
            slotType: latestSave.slotType,
            slotName: latestSave.slotName,
            loadedTurn: latestSave.turn,
            previousTurn,
            source: "recovery_code",
          },
          required: true,
        },
        consent,
      );
      if (latestSave.turn < previousTurn) {
        recordAnalyticsEvent(
          {
            playerId: recovered.player.id,
            anonymousSessionId: recovered.anonymousSessionId,
            type: "rollback_detected",
            turn: latestSave.turn,
            saveId: latestSave.id,
            payload: { fromTurn: previousTurn, toTurn: latestSave.turn, saveId: latestSave.id, source: "recovery_code" },
          },
          consent,
        );
      }
    }
    return true;
  }

  function handleManualSave(slotName: string) {
    if (!playerSession || !state) return;
    const save = createSaveGame({
      playerId: playerSession.player.id,
      state,
      dateLabel: dateForState(state),
      crisisStage: deriveCrisisStage(state),
      slotType: "manual",
      slotName,
    });
    recordEvent("save_created", { slotType: save.slotType, slotName: save.slotName }, true, state.turn, save.id);
    refreshSaves();
  }

  function handleLoadSave(save: SaveGame) {
    const previousTurn = state?.turn ?? save.turn;
    setState(save.gameState);
    setSelectedCardId(null);
    setSelectedIntelId(null);
    setLastAction(null);
    setAdvanceConfirmOpen(false);
    setBriefingTurn(save.gameState.ending ? null : save.gameState.turn);
    lastEndingCueRef.current = save.gameState.ending?.id ?? null;
    recordEvent("save_loaded", {
      saveId: save.id,
      slotType: save.slotType,
      slotName: save.slotName,
      loadedTurn: save.turn,
      previousTurn,
    }, true, save.turn, save.id);
    if (save.turn < previousTurn) {
      recordEvent("rollback_detected", { fromTurn: previousTurn, toTurn: save.turn, saveId: save.id }, false, save.turn, save.id);
    }
  }

  if (isAdminPage) {
    return (
      <AdminAnalyticsPage
        snapshot={adminSnapshot}
        language={language}
        onRefresh={() => setAdminSnapshot(getAdminAnalyticsSnapshot())}
        onExit={() => {
          window.location.hash = "";
          setIsAdminPage(false);
        }}
      />
    );
  }

  if (loadError) return <main className="loading">{t(language, "loadFailed")}：{loadError}</main>;
  if (!data || !displayData || !state || !currentTurn) return <main className="loading">{t(language, "loading")}</main>;

  const warProbability = state.variables.war_probability ?? 0;
  const riskStage = getRiskStage(warProbability);
  const crisisStage = deriveCrisisStage(state);
  const currentMusicTrack = musicTracks[resolveMusicTrack({ state, crisisStage, ending: state.ending })];
  const displayEnding = state.ending ? displayData.endings.find((ending) => ending.id === state.ending?.id) ?? state.ending : null;
  const endingReport = displayEnding
    ? generateEndingReport({
        caseId: "CASE-001",
        caseName: t(language, "caseTitle"),
        dateRange: `${displayData.timeline[0]?.dateRange ?? ""} - ${displayData.timeline[displayData.timeline.length - 1]?.dateRange ?? ""}`,
        finalGameState: state,
        variables: displayData.variables,
        timeline: displayData.timeline,
        ending: displayEnding,
        language,
      })
    : null;

  return (
    <div className="app">
      <TopStatusBar
        turn={state.turn}
        maxTurn={displayData.timeline.length}
        dateRange={currentTurn.dateRange}
        ap={state.ap}
        maxAp={state.maxAp}
        warProbability={warProbability}
        riskStage={riskStage}
        status={crisisStage}
        onExportState={exportStateJson}
        onRestart={restart}
        language={language}
        onLanguageChange={setLanguage}
      />
      <AudioControlPanel
        settings={audioSettings}
        currentTrack={currentMusicTrack}
        unlocked={audioUnlocked}
        language={language}
        onUnlock={unlockAudio}
        onChange={setAudioSettings}
      />
      {playerSession && (
        <div className="account-entry">
          <button type="button" onClick={() => setAccountPanelOpen(true)}>
            {language === "zh" ? "玩家 / 存档" : "Player / Saves"}
          </button>
        </div>
      )}

      <main className="main-layout">
        <TimelinePanel timeline={displayData.timeline} currentTurn={state.turn} actionLog={state.actionLog} language={language} />
        <section className="event-panel dossier-panel">
          <div className="panel-header">
            <span>{t(language, "currentEvent")}</span>
            <strong>{currentTurn.title}</strong>
          </div>
          <AssetImage className="event-hero-image" src={getTurnEventImage(state.turn)} fallbackLabel={`Turn ${state.turn}`} />
          <div className="event-dateline">{currentTurn.dateRange}</div>
          <p>{currentTurn.narrative}</p>
          <p className="hint">{currentTurn.goalHint}</p>
          <IrreversibleEventBanner flags={irreversibleFlags} language={language} />
          <UpcomingCrisisEvents events={upcomingEvents} language={language} />
          <CausalGraphPanel state={state} language={language} />
        </section>
        <VariablePanel definitions={displayData.variables} state={state} language={language} />
      </main>

      <section className="bottom-dock">
        <IntelTray cards={currentIntel} state={state} language={language} onReadIntel={readIntel} />
        <InterventionCardTray
          cards={visibleCards}
          state={state}
          language={language}
          onSelect={selectCard}
          onAdvance={openAdvanceConfirm}
        />
        <OpportunityCostPanel items={opportunityCosts} language={language} />
      </section>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          state={state}
          language={language}
          onClose={() => setSelectedCardId(null)}
          onUse={useSelectedCard}
        />
      )}
      {selectedIntel && (
        <IntelModal intel={selectedIntel} language={language} onClose={() => setSelectedIntelId(null)} />
      )}
      {advanceConfirmOpen && (
        <AdvanceTurnConfirmModal
          state={state}
          currentTurn={currentTurn}
          expiringCards={expiringCards}
          upcomingEvents={upcomingEvents}
          warProbability={warProbability}
          language={language}
          onCancel={() => setAdvanceConfirmOpen(false)}
          onConfirm={advanceTurn}
        />
      )}
      {lastAction && !selectedCard && lastAction.kind === "card" && (
        <ActionResultModal action={lastAction} language={language} onClose={() => setLastAction(null)} />
      )}
      {lastAction && !selectedCard && lastAction.kind === "turn" && (
        <TimeAdvanceReportModal action={lastAction} turn={lastAction.turn} turnTitle={lastAction.title} expiredCards={expiredCards} language={language} onClose={() => setLastAction(null)} />
      )}
      {!lastAction && !selectedCard && !selectedIntel && !advanceConfirmOpen && briefingTurn === state.turn && (
        <TurnBriefingModal
          state={state}
          currentTurn={currentTurn}
          upcomingEvents={upcomingEvents}
          opportunityCosts={opportunityCosts}
          expiringCards={expiringCards}
          language={language}
          onClose={() => setBriefingTurn(null)}
        />
      )}
      {displayEnding && (
        <EndingReportModal
          ending={displayEnding}
          report={endingReport!}
          state={state}
          definitions={displayData.variables}
          onRestart={restart}
          onExportState={exportStateJson}
          language={language}
        />
      )}
      {accountPanelOpen && playerSession && (
        <div className="modal-backdrop">
          <SaveGamePanel
            recoveryCode={playerSession.recoveryCode}
            saves={saves}
            language={language}
            onClose={() => setAccountPanelOpen(false)}
            onShowCode={() => setRecoveryCodeOpen(true)}
            onRecover={() => setLoadByCodeOpen(true)}
            onManualSave={handleManualSave}
            onLoadSave={(save) => {
              handleLoadSave(save);
              setAccountPanelOpen(false);
            }}
          />
        </div>
      )}
      {privacyOpen && <PrivacyConsentModal language={language} onSave={handleConsentSave} />}
      {recoveryCodeOpen && playerSession && (
        <RecoveryCodeModal
          recoveryCode={playerSession.recoveryCode}
          language={language}
          onClose={() => setRecoveryCodeOpen(false)}
        />
      )}
      {loadByCodeOpen && (
        <LoadByCodeModal
          language={language}
          onClose={() => setLoadByCodeOpen(false)}
          onRecover={handleRecover}
        />
      )}
    </div>
  );
}

export default App;
