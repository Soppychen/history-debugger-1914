import { useState, type ReactNode } from "react";
import {
  getAdvanceTurnConfirmVariant,
  getEndingReportVariant,
  getTimeAdvanceReportVariant,
  getTopStatusBarStatus,
  getVariableBarStatus,
  type AdvanceTurnConfirmVariant,
  type EndingReportVariant,
  type IntelCardVariant,
  type InterventionCardVariant,
  type TimeAdvanceReportVariant,
  type TimelineNodeStatus,
  type TopStatusBarStatus,
  type VariableBarStatus,
} from "./design/componentVariants";
import { getCrisisStageLabel, getRequirementFailure } from "./gameLogic";
import {
  resolveEndingStampAsset,
  resolveEndingVisualAsset,
  resolveCrisisEventIconAsset,
  resolveIntelAsset,
  resolveInterventionCardAsset,
  resolveIrreversibleAsset,
  resolveIrreversibleStampAsset,
  resolveTurnEventAsset,
  resolveUiStateAsset,
} from "./assets/visualAssetManifest";
import { VisualAssetImage } from "./components/VisualAssetImage";
import {
  flagLabel,
  formatTypeList,
  languageLabels,
  t,
  translateText,
  type Language,
} from "./i18n";
import type {
  ActionLogEntry,
  ChangeRecord,
  EndingDefinition,
  GameState,
  IntelCard as IntelCardDefinition,
  IntelReveal,
  IrreversibleNode,
  InterventionCard as InterventionCardDefinition,
  TimelineTurn,
  VariableDefinition,
} from "./types";
import type { AudioSettings, MusicTrack } from "./audio/audioConfig";
import type { EndingReport, RiskLevel } from "./endingReportTypes";
import type { DebugScoreResult } from "./score/debugScoreTypes";
import { DebugScoreBreakdownPanel } from "./components/DebugScoreBreakdownPanel";

export function TopStatusBar(props: {
  turn: number;
  maxTurn: number;
  dateRange: string;
  ap: number;
  maxAp: number;
  warProbability: number;
  riskStage: "stable" | "warning" | "critical";
  onExportState: () => void;
  onRestart: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
  status?: TopStatusBarStatus;
}) {
  const label = props.riskStage === "stable" ? t(props.language, "controllable") : props.riskStage === "warning" ? t(props.language, "dangerous") : t(props.language, "criticalEscalation");
  const status = props.status ?? getTopStatusBarStatus(props.warProbability);
  return (
    <header className={`top-status ${props.riskStage}`} data-status={status}>
      <strong>{t(props.language, "caseTitle")}</strong>
      <span className="status-metric">TURN {props.turn}/{props.maxTurn}</span>
      <span className="status-date">{props.dateRange}</span>
      <span className="status-metric">AP {props.ap}/{props.maxAp}</span>
      <span className="status-metric">WAR {props.warProbability}%</span>
      <span className="status-stage">{t(props.language, "risk")}：{label}</span>
      <CrisisStageBadge status={status} language={props.language} />
      <div className="status-actions">
        <label className="language-switch">
          <span>{t(props.language, "language")}</span>
          <select value={props.language} onChange={(event) => props.onLanguageChange(event.target.value as Language)}>
            <option value="zh">{languageLabels.zh}</option>
            <option value="en">{languageLabels.en}</option>
          </select>
        </label>
        <button className="ui-button" onClick={props.onExportState}>{t(props.language, "exportState")}</button>
        <button className="ui-button" onClick={props.onRestart}>{t(props.language, "restart")}</button>
      </div>
    </header>
  );
}

export function AudioControlPanel(props: {
  settings: AudioSettings;
  currentTrack: MusicTrack;
  unlocked: boolean;
  language: Language;
  onUnlock: () => void;
  onChange: (settings: AudioSettings) => void;
}) {
  const update = (patch: Partial<AudioSettings>) => props.onChange({ ...props.settings, ...patch });
  return (
    <section className="audio-panel" aria-label="音频控制">
      <div className="audio-panel__track">
        <span className="ui-state-label">AUDIO</span>
        <b>{props.language === "en" ? props.currentTrack.titleEn : props.currentTrack.titleZh}</b>
        <small>{props.currentTrack.titleEn}</small>
      </div>
      {!props.unlocked && (
        <button className="ui-button ui-button--primary" onClick={props.onUnlock}>{t(props.language, "enableAudio")}</button>
      )}
      <label>
        <input
          type="checkbox"
          checked={props.settings.musicEnabled}
          onChange={(event) => update({ musicEnabled: event.target.checked })}
        />
        {t(props.language, "music")}
      </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={props.settings.musicVolume}
        aria-label={t(props.language, "musicVolume")}
        onChange={(event) => update({ musicVolume: Number(event.target.value) })}
      />
      <label>
        <input
          type="checkbox"
          checked={props.settings.sfxEnabled}
          onChange={(event) => update({ sfxEnabled: event.target.checked })}
        />
        {t(props.language, "sfx")}
      </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={props.settings.sfxVolume}
        aria-label={t(props.language, "sfxVolume")}
        onChange={(event) => update({ sfxVolume: Number(event.target.value) })}
      />
    </section>
  );
}

export function CrisisStageBadge({ status, language }: { status: TopStatusBarStatus; language: Language }) {
  return (
    <span className="crisis-stage-badge ui-state-label" data-status={status}>
      {t(language, "crisisStage")}：{translateText(getCrisisStageLabel(status), language)}
    </span>
  );
}

export function TimelinePanel(props: { timeline: TimelineTurn[]; currentTurn: number; actionLog: ActionLogEntry[]; language: Language }) {
  return (
    <aside className="timeline panel">
      <div className="panel-title-row">
        <h2>{t(props.language, "timeline")}</h2>
        <span className="ui-state-label">12 TURN RAIL</span>
      </div>
      {props.timeline.map((turn) => {
        const status: TimelineNodeStatus = turn.turn < props.currentTurn ? "past" : turn.turn === props.currentTurn ? "current" : turn.turn - props.currentTurn <= 2 ? "warning" : "future";
        const logs = props.actionLog.filter((log) => log.turn === turn.turn);
        return (
          <TimelineNode key={turn.turn} turn={turn} logsCount={logs.length} status={status} language={props.language} />
        );
      })}
    </aside>
  );
}

export function TimelineNode(props: { turn: TimelineTurn; logsCount: number; status: TimelineNodeStatus; language: Language }) {
  return (
    <div className="timeline-item timeline-node ui-timeline-node" data-status={props.status}>
      <span className="timeline-index">{String(props.turn.turn).padStart(2, "0")}</span>
      <b>{props.turn.title}</b>
      <span className="timeline-date">{props.turn.dateRange}</span>
      {props.logsCount > 0 && <small>{props.language === "en" ? `${props.logsCount} logs` : `${props.logsCount} 条日志`}</small>}
    </div>
  );
}

export function VariablePanel(props: { definitions: VariableDefinition[]; state: GameState; intelCards?: IntelCardDefinition[]; language: Language }) {
  return (
    <aside className="variables panel">
      <div className="panel-title-row">
        <h2>{t(props.language, "variables")}</h2>
        <span className="ui-state-label">STATE INSPECTOR</span>
      </div>
      {props.definitions.map((definition) => {
        const value = props.state.variables[definition.key] ?? 0;
        const percent = ((value - definition.min) / (definition.max - definition.min)) * 100;
        const delta = props.state.lastChangeDeltas[definition.key] ?? 0;
        const changed = delta !== 0 || props.state.lastChangedVariables.includes(definition.key);
        const status = getVariableBarStatus(delta, value);
        const reveal = findVariableReveal(definition.key, props.intelCards ?? [], props.state, props.language);
        return (
          <div className={`variable-row ${changed ? "changed" : ""}`} key={definition.key} title={definition.description}>
            <div className="variable-label" data-status={status}>
              <span>{definition.label}</span>
              <span className="variable-numbers">
                {changed && <em className="delta ui-delta" data-status={status}>{delta >= 0 ? "+" : ""}{delta}</em>}
                <b>{value}</b>
              </span>
            </div>
            <VariableBar percent={percent} status={status} />
            {reveal && <small className="system-line">{reveal}</small>}
          </div>
        );
      })}
    </aside>
  );
}

function findVariableReveal(variableId: string, intelCards: IntelCardDefinition[], state: GameState, language: Language): string | null {
  const read = new Set(state.revealedIntelIds ?? []);
  for (const card of intelCards) {
    if (!read.has(card.id)) continue;
    const reveal = card.reveals.find((item) => typeof item !== "string" && item.variableId === variableId);
    if (!reveal || typeof reveal === "string") continue;
    const detail = reveal.visibility === "range" && reveal.range
      ? `${language === "zh" ? "约" : "about"} ${reveal.range[0]}-${reveal.range[1]}`
      : reveal.visibility === "rough"
        ? (language === "zh" ? "粗略可见" : "rough signal")
        : reveal.visibility === "exact"
          ? (language === "zh" ? "精确可见" : "exact")
          : (language === "zh" ? "未知" : "unknown");
    return `${language === "zh" ? "情报" : "Intel"} ${card.id}: ${detail}${reveal.confidence ? ` / ${language === "zh" ? "可信度" : "confidence"} ${Math.round(reveal.confidence * 100)}%` : ""}`;
  }
  return null;
}

export function VariableBar(props: { percent: number; status: VariableBarStatus }) {
  return (
    <div className="bar ui-variable-bar" data-status={props.status}>
      <i className="ui-variable-bar__fill" style={{ width: `${props.percent}%` }} />
    </div>
  );
}

export function CausalGraphPanel({ state, language }: { state: GameState; language: Language }) {
  const nodes = language === "en"
    ? ["Assassination", "Ultimatum", "Russian Mobilization", "German Ultimatum", "Belgium", "Alliance Lock-In", "Military Timetables", "Nationalist Pressure", "Diplomatic Trust", "Total War Probability"]
    : ["刺杀", "最后通牒", "俄国动员", "德国最后通牒", "比利时问题", "联盟锁定", "军事时间表", "民族主义压力", "外交信任", "全面战争概率"];
  const hotNode = language === "en" ? "Total War Probability" : "全面战争概率";
  return (
    <div className="causal panel">
      <h2>{t(language, "causalGraph")}</h2>
      <div className="node-grid">
        {nodes.map((node) => (
          <span className={node === hotNode && state.variables.war_probability >= 70 ? "hot" : ""} key={node}>
            {node}
          </span>
        ))}
      </div>
      {Object.keys(state.flags).length > 0 && (
        <div className="flags">
          <b>{t(language, "flags")}</b>
          {Object.entries(state.flags).map(([key, value]) => (
            <small key={key}>{flagLabel(key, language)}: {String(value)}</small>
          ))}
        </div>
      )}
    </div>
  );
}

export function UpcomingCrisisEvents(props: {
  events: Array<{
    id: string;
    title: string;
    dateRange: string;
    turnsUntil: number;
    riskSummary: string;
    relatedVariables: string[];
    severity: string;
    eventType?: string;
    interventionWindow?: { startTurn: number; endTurn: number };
  }>;
  language: Language;
}) {
  return (
    <section className="upcoming-events">
      <div className="panel-title-row">
        <h2>{t(props.language, "upcoming")}</h2>
        <span className="ui-state-label">NEXT CRISIS EVENTS</span>
      </div>
      <div className="upcoming-event-list">
        {props.events.map((event) => (
          <article className="upcoming-event" data-severity={event.severity} key={event.id}>
            <div className="upcoming-event__topline">
              <VisualAssetImage
                className="event-type-icon"
                asset={resolveCrisisEventIconAsset(event.eventType)}
                fallbackLabel={event.eventType ?? "event"}
                ariaHidden
              />
              <div>
                <b>{props.language === "en" ? `${event.turnsUntil} ${t(props.language, "turnsAfter")}: ${event.title}` : `${event.turnsUntil} 回合后：${event.title}`}</b>
                <span>{event.dateRange}</span>
              </div>
              {event.interventionWindow && event.turnsUntil <= 1 && (
                <VisualAssetImage
                  className="ui-state-icon"
                  asset={resolveUiStateAsset("countdown")}
                  fallbackLabel={props.language === "zh" ? "倒计时" : "countdown"}
                  ariaHidden
                />
              )}
            </div>
            <p>{event.riskSummary}</p>
            <div className="intel-card__refs">
              {event.relatedVariables.map((variable) => <span key={`${event.id}-${variable}`}>{translateText(variable, props.language)}</span>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function OpportunityCostPanel({ items, language }: { items: string[]; language: Language }) {
  return (
    <section className="opportunity-cost">
      <div className="panel-title-row">
        <h2>{t(language, "opportunityCost")}</h2>
        <span className="ui-state-label">OPPORTUNITY COST</span>
      </div>
      {items.length === 0 ? <p>{t(language, "noOpportunityCost")}</p> : (
        <ul>
          {items.map((item) => <li key={item}>{translateText(item, language)}</li>)}
        </ul>
      )}
    </section>
  );
}

export function IrreversibleEventBanner({ flags, language }: { flags: string[]; language: Language }) {
  if (flags.length === 0) return null;
  return (
    <section className="irreversible-banner">
      <b>{t(language, "irreversible")}</b>
      <span>{flags.map((flag) => flagLabel(flag, language)).join(" / ")}</span>
    </section>
  );
}

export function IntelTray(props: { cards: IntelCardDefinition[]; state: GameState; language: Language; onReadIntel: (intelId: string) => void }) {
  return (
    <section className="panel">
      <div className="panel-title-row">
        <h2>{t(props.language, "intelTray")}</h2>
        <span className="ui-state-label">TELEGRAM / DOSSIER</span>
      </div>
      <div className="tray-grid">
        {props.cards.map((card) => {
          const read = props.state.revealedIntelIds.includes(card.id);
          return (
            <IntelCard
              key={card.id}
              card={card}
              variant={read ? "read" : "unread"}
              language={props.language}
              onReadIntel={props.onReadIntel}
            />
          );
        })}
      </div>
    </section>
  );
}

export function IntelCard(props: { card: IntelCardDefinition; variant: IntelCardVariant; language: Language; onReadIntel: (intelId: string) => void }) {
  return (
    <button className={`intel-card ui-card ${props.variant === "read" ? "read" : ""}`} data-variant={props.variant} onClick={() => props.onReadIntel(props.card.id)}>
      <div className="intel-card__header">
        <span className="card-meta ui-card__meta">{props.card.id} · {props.card.type}</span>
        <span className="ui-state-label">{props.variant === "read" ? t(props.language, "read") : t(props.language, "sealed")}</span>
      </div>
      <VisualAssetImage
        className="card-media"
        asset={resolveIntelAsset(props.card)}
        fallbackLabel={props.card.type}
      />
      <b>{props.card.title}</b>
      <p>{props.card.summary.slice(0, 78)}...</p>
      <div className="intel-card__refs">
        {props.card.reveals.slice(0, 2).map((item) => <span key={typeof item === "string" ? item : item.variableId}>{formatIntelReveal(item, props.language)}</span>)}
        {props.card.unlocks.length > 0 && <span>{t(props.language, "unlock")} {props.card.unlocks.join("/")}</span>}
      </div>
    </button>
  );
}

export function InterventionCardTray(props: {
  cards: InterventionCardDefinition[];
  state: GameState;
  language: Language;
  onSelect: (cardId: string) => void;
  onAdvance: () => void;
}) {
  return (
    <section className="panel">
      <div className="card-tray-header">
        <div className="panel-title-row">
          <h2>{t(props.language, "interventionTray")}</h2>
          <span className="ui-state-label">ACTION CARDS</span>
        </div>
        <button className="advance ui-button ui-button--primary" onClick={props.onAdvance}>{t(props.language, "advanceTime")}</button>
      </div>
      <div className="tray-grid intervention-grid">
        {props.cards.map((card) => {
          const failure = getRequirementFailure(card, props.state);
          const apBlocked = props.state.ap < card.cost;
          const missed = card.turnRange[1] < props.state.turn && !props.state.usedCardIds.includes(card.id);
          const eventLocked = (props.state.lockedCardIds ?? []).includes(card.id);
          const blockedReason = missed ? `${t(props.language, "missed")}：${t(props.language, "window")} T${card.turnRange[0]}-T${card.turnRange[1]}` : failure ?? (apBlocked ? `${t(props.language, "lockReason")}：AP ${card.cost}/${props.state.ap}` : null);
          const expiring = card.turnRange[1] === props.state.turn;
          const variant: InterventionCardVariant = props.state.usedCardIds.includes(card.id)
            ? "used"
            : eventLocked
              ? "eventLocked"
            : missed
              ? "expiredMissedWindow"
              : failure
                ? "requirementLocked"
                : apBlocked
                  ? "apInsufficient"
                  : expiring
                    ? "expiringThisTurn"
                    : "default";
          return (
            <InterventionCard
              key={card.id}
              card={card}
              variant={variant}
              blockedReason={blockedReason}
              language={props.language}
              onSelect={props.onSelect}
            />
          );
        })}
      </div>
    </section>
  );
}

export function InterventionCard(props: {
  card: InterventionCardDefinition;
  variant: InterventionCardVariant;
  blockedReason: string | null;
  language: Language;
  onSelect: (cardId: string) => void;
}) {
  return (
    <button
      className={`intervention-card ui-card is-${props.variant}`}
      data-variant={props.variant}
      onClick={() => props.onSelect(props.card.id)}
    >
      <div className="intervention-card__topline">
        <span className="card-meta ui-card__meta">{props.card.id} · {formatTypeList(props.card.type, props.language)}</span>
        <span className="ap-badge">{props.card.cost} AP</span>
      </div>
      <VisualAssetImage
        className="card-media"
        asset={resolveInterventionCardAsset(props.card)}
        fallbackLabel={props.card.type[0] ?? "intervention"}
      />
      <b>{props.card.name}</b>
      <div className="intervention-card__meta-strip">
        <span>{t(props.language, "feasibility")} {props.card.feasibility}</span>
        <span>{t(props.language, "window")} T{props.card.turnRange[0]}-T{props.card.turnRange[1]}</span>
      </div>
      <p>{props.card.description}</p>
      {props.blockedReason ? (
        <small className="lock-reason ui-lock-reason">{t(props.language, "lockReason")}：{translateText(props.blockedReason, props.language)}</small>
      ) : (
        <ul className="effect-list">
          {props.card.effects.slice(0, 4).map((effect) => (
            <li key={`${props.card.id}-${effect.variable}`}>
              <span>{translateText(effect.variable, props.language)}</span>
              <b>{effect.delta > 0 ? "+" : ""}{effect.delta}</b>
            </li>
          ))}
        </ul>
      )}
      <div className="card-footer-state">
        {props.variant === "eventLocked" && (
          <VisualAssetImage className="ui-state-icon" asset={resolveUiStateAsset("red_lock")} fallbackLabel="locked" ariaHidden />
        )}
        {props.variant === "expiringThisTurn" && (
          <VisualAssetImage className="ui-state-icon" asset={resolveUiStateAsset("countdown")} fallbackLabel="countdown" ariaHidden />
        )}
        {props.variant === "expiredMissedWindow" && (
          <VisualAssetImage className="ui-state-icon" asset={resolveUiStateAsset("window_closed")} fallbackLabel="closed" ariaHidden />
        )}
        {props.variant === "eventLocked" ? <span className="ui-state-label">{props.language === "zh" ? "事件锁死" : "Event locked"}</span> : props.variant === "expiringThisTurn" ? <span className="ui-state-label">{t(props.language, "expiring")}</span> : props.variant === "expiredMissedWindow" ? <span className="ui-state-label">{t(props.language, "missed")}</span> : <span className="ui-state-label">{t(props.language, "requirementCheck")}</span>}
        {props.card.risks.length > 0 && <span className="risk-tag">{t(props.language, "riskCount")} {props.card.risks.length}</span>}
      </div>
    </button>
  );
}

export function CardDetailModal(props: { card: InterventionCardDefinition; state: GameState; language: Language; onClose: () => void; onUse: () => void }) {
  const failure = getRequirementFailure(props.card, props.state);
  const apBlocked = props.state.ap < props.card.cost;
  const blockedReason = failure ?? (apBlocked ? `${t(props.language, "lockReason")}：AP ${props.card.cost}/${props.state.ap}` : null);
  return (
    <Modal onClose={props.onClose}>
      <h2>{props.card.name}</h2>
      <VisualAssetImage
        className="modal-hero-image"
        asset={resolveInterventionCardAsset(props.card)}
        fallbackLabel={props.card.type.join(" / ")}
        showCaption
      />
      <p>{props.card.description}</p>
      {props.language === "zh" && <blockquote>{props.card.flavor}</blockquote>}
      <h3>{t(props.language, "effects")}</h3>
      <ChangeList changes={props.card.effects.map((effect) => ({ ...effect, before: 0, after: 0 }))} language={props.language} preview />
      <h3>{t(props.language, "backlash")}</h3>
      {props.card.risks.length === 0 ? <p>{t(props.language, "noBacklash")}</p> : props.card.risks.map((risk) => <p key={risk.id}>{props.language === "en" ? "Conditional backlash may apply." : risk.description}</p>)}
      <div className="modal-actions">
        {blockedReason && <span className="blocked">{translateText(blockedReason, props.language)}</span>}
        <button className="ui-button" onClick={props.onClose}>{t(props.language, "cancel")}</button>
        <button className="primary ui-button ui-button--primary" disabled={Boolean(blockedReason)} onClick={props.onUse}>{t(props.language, "useCard")}</button>
      </div>
    </Modal>
  );
}

export function IntelModal({ intel, language, onClose }: { intel: IntelCardDefinition; language: Language; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <h2>{intel.title}</h2>
      <VisualAssetImage
        className="modal-hero-image"
        asset={resolveIntelAsset(intel)}
        fallbackLabel={intel.type}
        showCaption
      />
      <p>{intel.summary}</p>
      {language === "zh" && <blockquote>{intel.quote}</blockquote>}
      <p>{t(language, "revealedVariables")}：{intel.reveals.map((item) => formatIntelReveal(item, language)).join("、") || t(language, "none")}</p>
      <p>{t(language, "unlockedCards")}：{intel.unlocks.join("、") || t(language, "none")}</p>
      {language === "zh" && <div className="tags">{intel.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
    </Modal>
  );
}

export function ActionResultModal({ action, language, onClose }: { action: ActionLogEntry; language: Language; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <h2>{translateText(action.title, language)}</h2>
      <p>{translateText(action.description, language)}</p>
      {language === "zh" && action.flavor && <blockquote>{action.flavor}</blockquote>}
      <h3>{t(language, "variableChanges")}</h3>
      <ChangeList changes={action.effects} language={language} />
      <h3>{t(language, "specialOrIrreversible")}</h3>
      {action.risks.length === 0 ? <p>{t(language, "noTriggered")}</p> : action.risks.map((risk) => (
        <div className="risk" key={risk.id}>
          <b>{language === "en" ? "Backlash triggered." : risk.description}</b>
          <ChangeList changes={risk.effects} language={language} />
        </div>
      ))}
      {action.flagsAdded.length > 0 && <p>{t(language, "flagsAdded")}：{action.flagsAdded.map((flag) => `${flagLabel(flag.flag, language)}=${String(flag.value)}`).join("，")}</p>}
    </Modal>
  );
}

export function EndingReportModal(props: {
  ending: EndingDefinition;
  report: EndingReport;
  state: GameState;
  definitions: VariableDefinition[];
  onRestart: () => void;
  onExportState: () => void;
  language: Language;
  debugScore?: DebugScoreResult;
  variant?: EndingReportVariant;
}) {
  const [showFullLog, setShowFullLog] = useState(false);
  const variant = props.variant ?? getEndingReportVariant(props.ending.type);
  const copySummary = () => {
    const summary = `${props.report.shareCard.title}\n${props.report.endingTitle}\n${t(props.language, "rating")} ${props.report.grade} · ${t(props.language, "historicalCredibility")} ${props.report.historicalCredibility}%\nWAR ${props.report.finalWarProbability}%\n${props.report.shareCard.quote}`;
    navigator.clipboard?.writeText(summary).catch(() => undefined);
  };
  const saveShareCard = () => {
    const svg = buildShareCardSvg(props.report);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `history-debugger-1914-${props.report.endingType}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal onClose={() => undefined} persistent className="ui-ending-report" variant={variant}>
      <section className="ending-report-header">
        <div>
          <span className="ui-state-label">{props.report.caseId}</span>
          <h2>{props.report.caseName}</h2>
          <p>{props.report.dateRange}</p>
          <h3>{props.report.endingTitle}</h3>
          <div className="report-metrics">
            <span>{t(props.language, "rating")} <b>{props.report.grade}</b></span>
            <span>{t(props.language, "historicalCredibility")} <b>{props.report.historicalCredibility}%</b></span>
            <span>{t(props.language, "finalWarProbability")} <b>{props.report.finalWarProbability}%</b></span>
            <span>{t(props.language, "reportStatus")} <b>{t(props.language, "archived")}</b></span>
          </div>
        </div>
        <VisualAssetImage
          className="report-hero-image"
          asset={resolveEndingVisualAsset(props.ending)}
          fallbackLabel={props.report.endingTitle}
          showCaption
        />
        <VisualAssetImage
          className="report-stamp-image"
          asset={resolveEndingStampAsset(props.ending)}
          fallbackLabel={variant === "totalWar" ? "FAILED" : "REPORT"}
          ariaHidden
        />
      </section>

      <section className="report-section">
        <h3>{t(props.language, "executiveSummary")}</h3>
        <p>{props.report.executiveSummary}</p>
        <blockquote>{props.report.shareCard.quote}</blockquote>
      </section>

      {props.debugScore && (
        <section className="report-section">
          <DebugScoreBreakdownPanel result={props.debugScore} language={props.language} />
        </section>
      )}

      <section className="report-section">
        <h3>{t(props.language, "finalVariables")}</h3>
        <div className="report-variable-grid">
          {props.report.finalVariables.map((variable) => (
            <article className="report-variable" data-risk={variable.riskLevel} key={variable.id}>
              <div>
                <b>{variable.label}</b>
                <span>{variable.value}/100 <em>{variable.delta >= 0 ? "+" : ""}{variable.delta}</em></span>
              </div>
              <div className="report-variable-bar"><i style={{ width: `${variable.value}%` }} /></div>
              <small>{riskLabel(variable.riskLevel, props.language)} · {variable.explanation}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="report-section">
        <h3>{t(props.language, "keyCausalChain")}</h3>
        <ol className="causal-chain">
          {props.report.keyCausalChain.map((node) => (
            <li data-severity={node.severity} data-type={node.type} key={node.id}>
              <b>{node.label}</b>
              <span>{node.turn ? `${t(props.language, "turn")} ${node.turn}${props.language === "zh" ? props.language === "zh" && t(props.language, "turnSuffix") : ""}` : node.type}</span>
              <p>{node.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="report-section">
        <h3>{props.language === "zh" ? "错过窗口" : "Missed Windows"}</h3>
        {props.report.missedWindows.length === 0 ? <p>{t(props.language, "none")}</p> : (
          <ul>
            {props.report.missedWindows.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}
      </section>

      <section className="report-section">
        <h3>{props.language === "zh" ? "不可逆节点" : "Irreversible Nodes"}</h3>
        {props.report.irreversibleNodesTriggered.length === 0 ? <p>{t(props.language, "none")}</p> : (
          <div className="tags">
            {props.report.irreversibleNodesTriggered.map((nodeId) => <span key={nodeId}>{flagLabel(nodeId, props.language)}</span>)}
          </div>
        )}
      </section>

      <section className="report-section">
        <h3>{props.language === "zh" ? "最终变量高亮" : "Final Variable Highlights"}</h3>
        {props.report.finalVariableHighlights.length === 0 ? <p>{t(props.language, "none")}</p> : props.report.finalVariableHighlights.map((item) => (
          <p className="system-line" key={item.variableId}>{translateText(item.variableId, props.language)} {item.value}/100 · {item.reason}</p>
        ))}
      </section>

      <section className="report-section">
        <h3>{t(props.language, "keyActions")}</h3>
        {props.report.keyPlayerActions.length === 0 ? <p>{t(props.language, "noInterventions")}</p> : (
          <div className="key-action-grid">
            {props.report.keyPlayerActions.map((action) => (
              <article className="key-action-card" data-evaluation={action.evaluation} key={`${action.cardId}-${action.turn}`}>
                <span className="ui-state-label">{props.language === "en" ? `Turn ${action.turn}` : `第 ${action.turn} 回合`}</span>
                <b>{translateText(action.cardName, props.language)}</b>
                <small>{translateText(action.effectSummary, props.language)}</small>
                <p>{action.explanation}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="report-section">
        <h3>{t(props.language, "endingAnalysis")}</h3>
        <div className="analysis-grid">
          <div>
            <h4>{t(props.language, "primaryFactors")}</h4>
            {props.report.analysis.primaryFactors.map((factor) => (
              <article className="analysis-factor" data-severity={factor.severity} key={factor.title}>
                <b>{factor.title}</b>
                <p>{factor.explanation}</p>
              </article>
            ))}
          </div>
          <div>
            <h4>{t(props.language, "residualRisks")}</h4>
            {props.report.analysis.residualRisks.length === 0 ? <p>{t(props.language, "none")}</p> : (
              <ul>
                {props.report.analysis.residualRisks.map((risk) => <li key={risk}>{risk}</li>)}
              </ul>
            )}
            <p className="system-line">{props.report.analysis.credibilityNote}</p>
          </div>
        </div>
      </section>

      <section className="report-section">
        <h3>{t(props.language, "playerStyle")}</h3>
        <p><b>{props.report.playerStyle.label}</b></p>
        <p>{props.report.playerStyle.description}</p>
        <div className="tags">{props.report.playerStyle.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </section>

      <section className="report-section share-card-panel">
        <h3>{t(props.language, "shareCard")}</h3>
        <div className="share-card">
          <span>{props.report.shareCard.title}</span>
          <b>{props.report.shareCard.endingTitle}</b>
          <div>{t(props.language, "rating")} {props.report.shareCard.grade} · {t(props.language, "historicalCredibility")} {props.report.shareCard.historicalCredibility}%</div>
          <div>{t(props.language, "finalWarProbability")} {props.report.shareCard.finalWarProbability}%</div>
          <small>{props.report.shareCard.playerStyleLabel}</small>
          <blockquote>{props.report.shareCard.quote}</blockquote>
        </div>
      </section>

      {showFullLog && (
        <section className="report-section">
          <h3>{t(props.language, "fullLog")}</h3>
          {props.state.actionLog.map((entry) => (
            <div className="report-log" key={entry.id}>
              <b>{props.language === "en" ? `Turn ${entry.turn}: ${translateText(entry.title, props.language)}` : `第 ${entry.turn} 回合：${entry.title}`}</b>
              <small>{entry.effects.map((effect) => `${translateText(effect.variable, props.language)} ${effect.delta > 0 ? "+" : ""}${effect.delta}`).join(" / ") || t(props.language, "noVariableChanges")}</small>
            </div>
          ))}
        </section>
      )}

      <div className="modal-actions">
        <button className="ui-button" onClick={copySummary}>{t(props.language, "copySummary")}</button>
        <button className="ui-button" onClick={saveShareCard}>{t(props.language, "saveShareCard")}</button>
        <button className="ui-button" onClick={() => setShowFullLog((value) => !value)}>{showFullLog ? t(props.language, "hideFullLog") : t(props.language, "fullLog")}</button>
        <button className="ui-button" onClick={props.onExportState}>{t(props.language, "exportState")}</button>
        <button className="primary ui-button ui-button--primary" onClick={props.onRestart}>{t(props.language, "restart")}</button>
      </div>
    </Modal>
  );
}

function riskLabel(risk: RiskLevel, language: Language): string {
  if (language === "en") return risk.toUpperCase();
  if (risk === "critical") return "临界";
  if (risk === "high") return "高";
  if (risk === "medium") return "中";
  return "低";
}

function formatIntelReveal(reveal: string | IntelReveal, language: Language): string {
  if (typeof reveal === "string") return translateText(reveal, language);
  const variable = translateText(reveal.variableId, language);
  if (reveal.visibility === "range" && reveal.range) {
    return `${variable} ${language === "zh" ? "约" : "about"} ${reveal.range[0]}-${reveal.range[1]}`;
  }
  if (reveal.visibility === "rough") return `${variable} ${language === "zh" ? "粗略可见" : "rough signal"}`;
  if (reveal.visibility === "exact") return `${variable} ${language === "zh" ? "精确可见" : "exact"}`;
  return `${variable} ${language === "zh" ? "未知" : "unknown"}`;
}

function buildShareCardSvg(report: EndingReport): string {
  const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
  <rect width="1200" height="1500" fill="#171a1d"/>
  <rect x="72" y="72" width="1056" height="1356" fill="#202428" stroke="#9a7a3d" stroke-width="4"/>
  <text x="120" y="170" fill="#c6a15b" font-family="serif" font-size="44">${escape(report.shareCard.title)}</text>
  <text x="120" y="300" fill="#ded6bd" font-family="serif" font-size="76">${escape(report.shareCard.endingTitle)}</text>
  <text x="120" y="410" fill="#ded6bd" font-family="monospace" font-size="42">GRADE ${escape(report.shareCard.grade)} · CRED ${report.shareCard.historicalCredibility}%</text>
  <text x="120" y="490" fill="#f0b0a6" font-family="monospace" font-size="42">WAR ${report.shareCard.finalWarProbability}%</text>
  <text x="120" y="600" fill="#d09a36" font-family="serif" font-size="46">${escape(report.shareCard.playerStyleLabel)}</text>
  <foreignObject x="120" y="700" width="960" height="520">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color:#ded6bd;font-family:serif;font-size:48px;line-height:1.5;">${escape(report.shareCard.quote)}</div>
  </foreignObject>
  <text x="120" y="1340" fill="#a79f88" font-family="monospace" font-size="28">CASE 001 / HISTORY DEBUGGER 1914</text>
</svg>`;
}

export function AdvanceTurnConfirmModal(props: {
  state: GameState;
  currentTurn: TimelineTurn;
  expiringCards: InterventionCardDefinition[];
  upcomingEvents: Array<{ id: string; title: string; turnsUntil: number; severity: string }>;
  warProbability: number;
  language: Language;
  onCancel: () => void;
  onConfirm: () => void;
  variant?: AdvanceTurnConfirmVariant;
}) {
  const variant = props.variant ?? getAdvanceTurnConfirmVariant(props.warProbability);
  return (
    <Modal onClose={props.onCancel} className="ui-advance-confirm" variant={variant}>
      <h2>{t(props.language, "advanceConfirm")}</h2>
      <p className="modal-kicker">{t(props.language, "advanceHint")}</p>
      <div className="advance-summary">
        <span className="ui-state-label">{t(props.language, "currentTurn")} {props.state.turn}</span>
        <span className="ui-state-label">{t(props.language, "unusedAp")} {props.state.ap}</span>
        <span className="ui-state-label">WAR {props.warProbability}%</span>
      </div>
      <h3>{t(props.language, "willHappen")}</h3>
      <ChangeList changes={props.currentTurn.defaultPressure.map((effect) => ({ ...effect, before: 0, after: 0 }))} language={props.language} preview />
      <h3>{t(props.language, "specialRules")}</h3>
      {props.currentTurn.specialRules.length === 0 ? <p>{t(props.language, "none")}</p> : props.currentTurn.specialRules.map((rule) => <p className="system-line" key={rule.id}>{props.language === "en" ? "Conditional special rule may apply." : rule.description}</p>)}
      <h3>{t(props.language, "keyEvents")}</h3>
      {props.upcomingEvents.length === 0 ? <p>{t(props.language, "noFutureEvents")}</p> : props.upcomingEvents.slice(0, 3).map((event) => <p className="system-line" key={event.id}>{props.language === "en" ? `${event.turnsUntil} ${t(props.language, "turnsAfter")}: ${event.title}` : `${event.turnsUntil} 回合后：${event.title}`}</p>)}
      <h3>{t(props.language, "closingWindows")}</h3>
      {props.expiringCards.length === 0 ? <p>{t(props.language, "noClosingWindows")}</p> : props.expiringCards.map((card) => <p className="system-line" key={card.id}>{card.id} {card.name}</p>)}
      <div className="modal-actions">
        <button className="ui-button" onClick={props.onCancel}>{t(props.language, "cancel")}</button>
        <button className="primary ui-button ui-button--primary" onClick={props.onConfirm}>{t(props.language, "confirmAdvance")}</button>
      </div>
    </Modal>
  );
}

export function TimeAdvanceReportModal(props: {
  action: ActionLogEntry;
  turn: number;
  turnTitle: string;
  expiredCards: InterventionCardDefinition[];
  language: Language;
  onClose: () => void;
  variant?: TimeAdvanceReportVariant;
}) {
  const maxDelta = Math.max(0, ...props.action.effects.map((effect) => effect.delta));
  const variant = props.variant ?? getTimeAdvanceReportVariant(maxDelta);
  return (
    <Modal onClose={props.onClose} className="ui-time-report" variant={variant}>
      <h2>{t(props.language, "timeReport")}：{translateText(props.turnTitle, props.language)}</h2>
      <VisualAssetImage
        className="modal-hero-image"
        asset={resolveTurnEventAsset({ turn: props.turn, title: props.turnTitle })}
        fallbackLabel={`Turn ${props.turn}`}
        showCaption
      />
      <p>{translateText(props.action.description, props.language)}</p>
      <h3>{t(props.language, "pressureChanges")}</h3>
      <ChangeList changes={props.action.effects} language={props.language} />
      <h3>{t(props.language, "specialOrIrreversible")}</h3>
      {props.action.risks.length === 0 ? <p>{t(props.language, "noTriggered")}</p> : props.action.risks.map((risk) => (
        <div className="risk" key={risk.id}>
          <b>{props.language === "en" ? "Special rule triggered." : risk.description}</b>
          <ChangeList changes={risk.effects} language={props.language} />
        </div>
      ))}
      <h3>{t(props.language, "expiredCards")}</h3>
      {props.expiredCards.length === 0 ? <p>{t(props.language, "noExpiredCards")}</p> : props.expiredCards.map((card) => <p className="system-line" key={card.id}>{card.id}「{card.name}」{t(props.language, "missed")}</p>)}
      {props.action.flagsAdded.length > 0 && (
        <div className="irreversible-visual-strip">
          {props.action.flagsAdded.map((flag) => (
            <VisualAssetImage
              key={flag.flag}
              className="irreversible-thumb"
              asset={resolveIrreversibleAsset(flag.flag)}
              fallbackLabel={flagLabel(flag.flag, props.language)}
            />
          ))}
        </div>
      )}
      {props.action.flagsAdded.length > 0 && <p className="system-line">{t(props.language, "flagsAdded")}：{props.action.flagsAdded.map((flag) => `${flagLabel(flag.flag, props.language)}=${String(flag.value)}`).join("，")}</p>}
    </Modal>
  );
}

export function IrreversibleNodeModal(props: {
  nodes: IrreversibleNode[];
  cards: InterventionCardDefinition[];
  language: Language;
  onClose: () => void;
}) {
  if (props.nodes.length === 0) return null;
  const lockedCardNames = new Map(props.cards.map((card) => [card.id, card.name]));
  return (
    <Modal onClose={props.onClose} className="ui-time-report" variant="irreversible">
      <h2>{props.language === "zh" ? "不可逆节点已触发" : "Irreversible Node Triggered"}</h2>
      {props.nodes.map((node) => (
        <section className="report-section" key={node.id}>
          <h3>{node.title}</h3>
          <VisualAssetImage
            className="modal-hero-image"
            asset={resolveIrreversibleAsset(node.id)}
            fallbackLabel={node.title}
            showCaption
          />
          <VisualAssetImage
            className="irreversible-stamp-overlay"
            asset={resolveIrreversibleStampAsset()}
            fallbackLabel="IRREVERSIBLE"
            ariaHidden
          />
          <p>{node.reportText}</p>
          <h4>{props.language === "zh" ? "变量影响" : "Variable impact"}</h4>
          <ChangeList changes={node.effects.map((effect) => ({ ...effect, before: 0, after: 0 }))} language={props.language} preview />
          <h4>{props.language === "zh" ? "窗口关闭" : "Closed windows"}</h4>
          {node.lockedCardIds.length === 0 ? <p>{t(props.language, "none")}</p> : (
            <ul>
              {node.lockedCardIds.map((cardId) => <li key={cardId}>{cardId} {lockedCardNames.get(cardId) ?? ""}</li>)}
            </ul>
          )}
          {node.unlockedCardIds.length > 0 && (
            <>
              <h4>{props.language === "zh" ? "新解锁窗口" : "New windows"}</h4>
              <p>{node.unlockedCardIds.join(" / ")}</p>
            </>
          )}
          {node.variableImpactSummary.length > 0 && (
            <div className="system-line">{node.variableImpactSummary.map((item) => translateText(item, props.language)).join(" / ")}</div>
          )}
        </section>
      ))}
      <div className="modal-actions">
        <button className="primary ui-button ui-button--primary" onClick={props.onClose}>{props.language === "zh" ? "确认" : "Confirm"}</button>
      </div>
    </Modal>
  );
}

export function TurnBriefingModal(props: {
  state: GameState;
  currentTurn: TimelineTurn;
  upcomingEvents: Array<{ id: string; title: string; turnsUntil: number; severity: string }>;
  opportunityCosts: string[];
  expiringCards: InterventionCardDefinition[];
  language: Language;
  onClose: () => void;
}) {
  const briefing = props.currentTurn.briefing;
  return (
    <Modal onClose={props.onClose} className="ui-turn-briefing" variant="standard">
      <h2>{props.language === "en" ? `Turn ${props.state.turn}: ${props.currentTurn.title}` : `第 ${props.state.turn} 回合：${briefing?.briefingTitle ?? props.currentTurn.title}`}</h2>
      <VisualAssetImage
        className="modal-hero-image"
        asset={resolveTurnEventAsset(props.currentTurn)}
        fallbackLabel={`Turn ${props.currentTurn.turn}`}
        showCaption
      />
      <p className="modal-kicker">{props.currentTurn.dateRange} · AP {props.state.ap}/{props.state.maxAp}</p>
      <p>{briefing?.briefingText ?? props.currentTurn.narrative}</p>
      <blockquote>{props.currentTurn.goalHint}</blockquote>
      <h3>{t(props.language, "briefingRisks")}</h3>
      {(briefing?.keyRisks.length ? briefing.keyRisks : props.opportunityCosts).length === 0 ? <p>{t(props.language, "noMajorRisks")}</p> : (briefing?.keyRisks.length ? briefing.keyRisks : props.opportunityCosts).slice(0, 4).map((item) => <p className="system-line" key={item}>{translateText(item, props.language)}</p>)}
      <h3>{props.language === "zh" ? "重点变量" : "Focus Variables"}</h3>
      {(briefing?.focusVariableIds ?? props.currentTurn.defaultPressure.map((effect) => effect.variable)).slice(0, 4).map((variableId) => <p className="system-line" key={variableId}>{translateText(variableId, props.language)}</p>)}
      <h3>{t(props.language, "upcomingEvents")}</h3>
      {props.upcomingEvents.slice(0, 3).map((event) => <p className="system-line" key={event.id}>{props.language === "en" ? `${event.turnsUntil} ${t(props.language, "turnsAfter")}: ${event.title}` : `${event.turnsUntil} 回合后：${event.title}`}</p>)}
      <h3>{t(props.language, "possiblyExpire")}</h3>
      {props.expiringCards.length === 0 ? <p>{t(props.language, "noExpireThisTurn")}</p> : props.expiringCards.map((card) => <p className="system-line" key={card.id}>{card.id}「{card.name}」</p>)}
    </Modal>
  );
}

function ChangeList({ changes, language, preview = false }: { changes: ChangeRecord[]; language: Language; preview?: boolean }) {
  if (changes.length === 0) return <p>{t(language, "noVariableChanges")}</p>;
  return (
    <ul className="changes">
      {changes.map((change, index) => (
        <li key={`${change.variable}-${index}`}>
          <b>{translateText(change.variable, language)}</b>
          <span className="delta ui-delta" data-status={change.delta >= 0 ? "increasedThisTurn" : "decreasedThisTurn"}>{change.delta > 0 ? "+" : ""}{change.delta}</span>
          {!preview && <small>{change.before} → {change.after}</small>}
          <em>{language === "en" ? "Rule effect" : change.reason}</em>
        </li>
      ))}
    </ul>
  );
}

function Modal({
  children,
  onClose,
  persistent = false,
  className = "",
  variant,
}: {
  children: ReactNode;
  onClose: () => void;
  persistent?: boolean;
  className?: string;
  variant?: string;
}) {
  return (
    <div className="modal-backdrop">
      <div className={`modal ui-modal ${className}`} data-variant={variant}>
        {!persistent && <button className="close" onClick={onClose}>×</button>}
        {children}
      </div>
    </div>
  );
}

export function AssetImage({
  src,
  className,
  fallbackLabel,
  ariaHidden = false,
}: {
  src: string;
  className: string;
  fallbackLabel: string;
  ariaHidden?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`${className} asset-fallback`} aria-hidden={ariaHidden}>
        <span>{fallbackLabel}</span>
      </div>
    );
  }
  return (
    <img
      className={className}
      src={src}
      alt=""
      aria-hidden={ariaHidden}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
