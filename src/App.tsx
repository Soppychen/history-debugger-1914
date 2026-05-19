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
  const lastEndingCueRef = useRef<string | null>(null);

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
    setState(createInitialState(data.variables));
    setSelectedCardId(null);
    setSelectedIntelId(null);
    setLastAction(null);
    setAdvanceConfirmOpen(false);
    setBriefingTurn(1);
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
  }

  function selectCard(cardId: string) {
    if (!state) return;
    const card = visibleCards.find((item) => item.id === cardId);
    if (!card) return;
    const failure = getRequirementFailure(card, state);
    const apBlocked = state.ap < card.cost;
    playSfx(failure || apBlocked ? "card_locked" : "card_select");
    setSelectedCardId(cardId);
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
  }

  function openAdvanceConfirm() {
    if (!state?.ending) {
      playSfx("ui_confirm");
      setAdvanceConfirmOpen(true);
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
    if (!ending) {
      window.setTimeout(() => playSfx("turn_briefing"), 360);
    }
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
    </div>
  );
}

export default App;
