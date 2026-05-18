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
import { getCardIllustration, getEndingStamp, getTurnEventImage } from "./design/artAssets";
import type {
  ActionLogEntry,
  ChangeRecord,
  EndingDefinition,
  GameState,
  IntelCard as IntelCardDefinition,
  InterventionCard as InterventionCardDefinition,
  TimelineTurn,
  VariableDefinition,
} from "./types";
import type { AudioSettings, MusicTrack } from "./audio/audioConfig";

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
  status?: TopStatusBarStatus;
}) {
  const label = props.riskStage === "stable" ? "可控" : props.riskStage === "warning" ? "危险" : "临界升级";
  const status = props.status ?? getTopStatusBarStatus(props.warProbability);
  return (
    <header className={`top-status ${props.riskStage}`} data-status={status}>
      <strong>Case 001：1914 七月危机</strong>
      <span className="status-metric">TURN {props.turn}/{props.maxTurn}</span>
      <span className="status-date">{props.dateRange}</span>
      <span className="status-metric">AP {props.ap}/{props.maxAp}</span>
      <span className="status-metric">WAR {props.warProbability}%</span>
      <span className="status-stage">风险：{label}</span>
      <CrisisStageBadge status={status} />
      <div className="status-actions">
        <button className="ui-button" onClick={props.onExportState}>导出 GameState JSON</button>
        <button className="ui-button" onClick={props.onRestart}>重新开始</button>
      </div>
    </header>
  );
}

export function AudioControlPanel(props: {
  settings: AudioSettings;
  currentTrack: MusicTrack;
  unlocked: boolean;
  onUnlock: () => void;
  onChange: (settings: AudioSettings) => void;
}) {
  const update = (patch: Partial<AudioSettings>) => props.onChange({ ...props.settings, ...patch });
  return (
    <section className="audio-panel" aria-label="音频控制">
      <div className="audio-panel__track">
        <span className="ui-state-label">AUDIO</span>
        <b>{props.currentTrack.titleZh}</b>
        <small>{props.currentTrack.titleEn}</small>
      </div>
      {!props.unlocked && (
        <button className="ui-button ui-button--primary" onClick={props.onUnlock}>启用音频</button>
      )}
      <label>
        <input
          type="checkbox"
          checked={props.settings.musicEnabled}
          onChange={(event) => update({ musicEnabled: event.target.checked })}
        />
        音乐
      </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={props.settings.musicVolume}
        aria-label="音乐音量"
        onChange={(event) => update({ musicVolume: Number(event.target.value) })}
      />
      <label>
        <input
          type="checkbox"
          checked={props.settings.sfxEnabled}
          onChange={(event) => update({ sfxEnabled: event.target.checked })}
        />
        音效
      </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={props.settings.sfxVolume}
        aria-label="音效音量"
        onChange={(event) => update({ sfxVolume: Number(event.target.value) })}
      />
    </section>
  );
}

export function CrisisStageBadge({ status }: { status: TopStatusBarStatus }) {
  return (
    <span className="crisis-stage-badge ui-state-label" data-status={status}>
      危机阶段：{getCrisisStageLabel(status)}
    </span>
  );
}

export function TimelinePanel(props: { timeline: TimelineTurn[]; currentTurn: number; actionLog: ActionLogEntry[] }) {
  return (
    <aside className="timeline panel">
      <div className="panel-title-row">
        <h2>时间线</h2>
        <span className="ui-state-label">12 TURN RAIL</span>
      </div>
      {props.timeline.map((turn) => {
        const status: TimelineNodeStatus = turn.turn < props.currentTurn ? "past" : turn.turn === props.currentTurn ? "current" : turn.turn - props.currentTurn <= 2 ? "warning" : "future";
        const logs = props.actionLog.filter((log) => log.turn === turn.turn);
        return (
          <TimelineNode key={turn.turn} turn={turn} logsCount={logs.length} status={status} />
        );
      })}
    </aside>
  );
}

export function TimelineNode(props: { turn: TimelineTurn; logsCount: number; status: TimelineNodeStatus }) {
  return (
    <div className="timeline-item timeline-node ui-timeline-node" data-status={props.status}>
      <span className="timeline-index">{String(props.turn.turn).padStart(2, "0")}</span>
      <b>{props.turn.title}</b>
      <span className="timeline-date">{props.turn.dateRange}</span>
      {props.logsCount > 0 && <small>{props.logsCount} 条日志</small>}
    </div>
  );
}

export function VariablePanel(props: { definitions: VariableDefinition[]; state: GameState }) {
  return (
    <aside className="variables panel">
      <div className="panel-title-row">
        <h2>变量</h2>
        <span className="ui-state-label">STATE INSPECTOR</span>
      </div>
      {props.definitions.map((definition) => {
        const value = props.state.variables[definition.key] ?? 0;
        const percent = ((value - definition.min) / (definition.max - definition.min)) * 100;
        const delta = props.state.lastChangeDeltas[definition.key] ?? 0;
        const changed = delta !== 0 || props.state.lastChangedVariables.includes(definition.key);
        const status = getVariableBarStatus(delta, value);
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
          </div>
        );
      })}
    </aside>
  );
}

export function VariableBar(props: { percent: number; status: VariableBarStatus }) {
  return (
    <div className="bar ui-variable-bar" data-status={props.status}>
      <i className="ui-variable-bar__fill" style={{ width: `${props.percent}%` }} />
    </div>
  );
}

export function CausalGraphPanel({ state }: { state: GameState }) {
  const nodes = [
    "刺杀",
    "最后通牒",
    "俄国动员",
    "德国最后通牒",
    "比利时问题",
    "联盟锁定",
    "军事时间表",
    "民族主义压力",
    "外交信任",
    "全面战争概率",
  ];
  return (
    <div className="causal panel">
      <h2>因果链 MVP</h2>
      <div className="node-grid">
        {nodes.map((node) => (
          <span className={node === "全面战争概率" && state.variables.war_probability >= 70 ? "hot" : ""} key={node}>
            {node}
          </span>
        ))}
      </div>
      {Object.keys(state.flags).length > 0 && (
        <div className="flags">
          <b>系统标记</b>
          {Object.entries(state.flags).map(([key, value]) => (
            <small key={key}>{key}: {String(value)}</small>
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
  }>;
}) {
  return (
    <section className="upcoming-events">
      <div className="panel-title-row">
        <h2>即将发生</h2>
        <span className="ui-state-label">NEXT CRISIS EVENTS</span>
      </div>
      <div className="upcoming-event-list">
        {props.events.map((event) => (
          <article className="upcoming-event" data-severity={event.severity} key={event.id}>
            <div>
              <b>{event.turnsUntil} 回合后：{event.title}</b>
              <span>{event.dateRange}</span>
            </div>
            <p>{event.riskSummary}</p>
            <div className="intel-card__refs">
              {event.relatedVariables.map((variable) => <span key={`${event.id}-${variable}`}>{variable}</span>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function OpportunityCostPanel({ items }: { items: string[] }) {
  return (
    <section className="opportunity-cost">
      <div className="panel-title-row">
        <h2>未处理风险</h2>
        <span className="ui-state-label">OPPORTUNITY COST</span>
      </div>
      {items.length === 0 ? <p>当前没有突出的未处理风险。</p> : (
        <ul>
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      )}
    </section>
  );
}

export function IrreversibleEventBanner({ flags }: { flags: string[] }) {
  if (flags.length === 0) return null;
  return (
    <section className="irreversible-banner">
      <b>不可逆节点已触发</b>
      <span>{flags.join(" / ")}</span>
    </section>
  );
}

export function IntelTray(props: { cards: IntelCardDefinition[]; state: GameState; onReadIntel: (intelId: string) => void }) {
  return (
    <section className="panel">
      <div className="panel-title-row">
        <h2>当前回合情报</h2>
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
              onReadIntel={props.onReadIntel}
            />
          );
        })}
      </div>
    </section>
  );
}

export function IntelCard(props: { card: IntelCardDefinition; variant: IntelCardVariant; onReadIntel: (intelId: string) => void }) {
  return (
    <button className={`intel-card ui-card ${props.variant === "read" ? "read" : ""}`} data-variant={props.variant} onClick={() => props.onReadIntel(props.card.id)}>
      <div className="intel-card__header">
        <span className="card-meta ui-card__meta">{props.card.id} · {props.card.type}</span>
        <span className="ui-state-label">{props.variant === "read" ? "已阅读" : "SEALED"}</span>
      </div>
      <AssetImage
        className="card-media"
        src={getCardIllustration(props.card.type)}
        fallbackLabel={props.card.type}
      />
      <b>{props.card.title}</b>
      <p>{props.card.summary.slice(0, 78)}...</p>
      <div className="intel-card__refs">
        {props.card.reveals.slice(0, 2).map((item) => <span key={item}>{item}</span>)}
        {props.card.unlocks.length > 0 && <span>解锁 {props.card.unlocks.join("/")}</span>}
      </div>
    </button>
  );
}

export function InterventionCardTray(props: {
  cards: InterventionCardDefinition[];
  state: GameState;
  onSelect: (cardId: string) => void;
  onAdvance: () => void;
}) {
  return (
    <section className="panel">
      <div className="card-tray-header">
        <div className="panel-title-row">
          <h2>可用干预</h2>
          <span className="ui-state-label">ACTION CARDS</span>
        </div>
        <button className="advance ui-button ui-button--primary" onClick={props.onAdvance}>推进时间</button>
      </div>
      <div className="tray-grid intervention-grid">
        {props.cards.map((card) => {
          const failure = getRequirementFailure(card, props.state);
          const apBlocked = props.state.ap < card.cost;
          const missed = card.turnRange[1] < props.state.turn && !props.state.usedCardIds.includes(card.id);
          const blockedReason = missed ? `已错过：行动窗口 T${card.turnRange[0]}-T${card.turnRange[1]} 已关闭` : failure ?? (apBlocked ? `AP 不足：需要 ${card.cost}，当前 ${props.state.ap}` : null);
          const expiring = card.turnRange[1] === props.state.turn;
          const variant: InterventionCardVariant = props.state.usedCardIds.includes(card.id)
            ? "used"
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
  onSelect: (cardId: string) => void;
}) {
  return (
    <button
      className={`intervention-card ui-card is-${props.variant}`}
      data-variant={props.variant}
      onClick={() => props.onSelect(props.card.id)}
    >
      <div className="intervention-card__topline">
        <span className="card-meta ui-card__meta">{props.card.id} · {props.card.type.join("/")}</span>
        <span className="ap-badge">{props.card.cost} AP</span>
      </div>
      <AssetImage
        className="card-media"
        src={getCardIllustration(props.card.type)}
        fallbackLabel={props.card.type[0] ?? "intervention"}
      />
      <b>{props.card.name}</b>
      <div className="intervention-card__meta-strip">
        <span>可行性 {props.card.feasibility}</span>
        <span>窗口 T{props.card.turnRange[0]}-T{props.card.turnRange[1]}</span>
      </div>
      <p>{props.card.description}</p>
      {props.blockedReason ? (
        <small className="lock-reason ui-lock-reason">锁定原因：{props.blockedReason}</small>
      ) : (
        <ul className="effect-list">
          {props.card.effects.slice(0, 4).map((effect) => (
            <li key={`${props.card.id}-${effect.variable}`}>
              <span>{effect.variable}</span>
              <b>{effect.delta > 0 ? "+" : ""}{effect.delta}</b>
            </li>
          ))}
        </ul>
      )}
      <div className="card-footer-state">
        {props.variant === "expiringThisTurn" ? <span className="ui-state-label">本回合后窗口关闭</span> : props.variant === "expiredMissedWindow" ? <span className="ui-state-label">MISSED / 已错过</span> : <span className="ui-state-label">REQ CHECK</span>}
        {props.card.risks.length > 0 && <span className="risk-tag">RISK {props.card.risks.length}</span>}
      </div>
    </button>
  );
}

export function CardDetailModal(props: { card: InterventionCardDefinition; state: GameState; onClose: () => void; onUse: () => void }) {
  const failure = getRequirementFailure(props.card, props.state);
  const apBlocked = props.state.ap < props.card.cost;
  const blockedReason = failure ?? (apBlocked ? `AP 不足：需要 ${props.card.cost}，当前 ${props.state.ap}` : null);
  return (
    <Modal onClose={props.onClose}>
      <h2>{props.card.name}</h2>
      <AssetImage
        className="modal-hero-image"
        src={getCardIllustration(props.card.type)}
        fallbackLabel={props.card.type.join(" / ")}
      />
      <p>{props.card.description}</p>
      <blockquote>{props.card.flavor}</blockquote>
      <h3>效果</h3>
      <ChangeList changes={props.card.effects.map((effect) => ({ ...effect, before: 0, after: 0 }))} preview />
      <h3>潜在反噬</h3>
      {props.card.risks.length === 0 ? <p>无显性反噬。</p> : props.card.risks.map((risk) => <p key={risk.id}>{risk.description}</p>)}
      <div className="modal-actions">
        {blockedReason && <span className="blocked">{blockedReason}</span>}
        <button className="ui-button" onClick={props.onClose}>取消</button>
        <button className="primary ui-button ui-button--primary" disabled={Boolean(blockedReason)} onClick={props.onUse}>确认用卡</button>
      </div>
    </Modal>
  );
}

export function IntelModal({ intel, onClose }: { intel: IntelCardDefinition; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <h2>{intel.title}</h2>
      <AssetImage
        className="modal-hero-image"
        src={getCardIllustration(intel.type)}
        fallbackLabel={intel.type}
      />
      <p>{intel.summary}</p>
      <blockquote>{intel.quote}</blockquote>
      <p>揭示变量：{intel.reveals.join("、") || "无"}</p>
      <p>解锁卡牌：{intel.unlocks.join("、") || "无"}</p>
      <div className="tags">{intel.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    </Modal>
  );
}

export function ActionResultModal({ action, onClose }: { action: ActionLogEntry; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <h2>{action.title}</h2>
      <p>{action.description}</p>
      {action.flavor && <blockquote>{action.flavor}</blockquote>}
      <h3>变量变化</h3>
      <ChangeList changes={action.effects} />
      <h3>反噬 / 特殊规则</h3>
      {action.risks.length === 0 ? <p>未触发。</p> : action.risks.map((risk) => (
        <div className="risk" key={risk.id}>
          <b>{risk.description}</b>
          <ChangeList changes={risk.effects} />
        </div>
      ))}
      {action.flagsAdded.length > 0 && <p>新增标记：{action.flagsAdded.map((flag) => `${flag.flag}=${String(flag.value)}`).join("，")}</p>}
    </Modal>
  );
}

export function EndingReportModal(props: {
  ending: EndingDefinition;
  state: GameState;
  definitions: VariableDefinition[];
  onRestart: () => void;
  onExportState: () => void;
  variant?: EndingReportVariant;
}) {
  const keyActions = props.state.actionLog.filter((log) => log.kind === "card").slice(0, 8);
  const variant = props.variant ?? getEndingReportVariant(props.ending.type);
  return (
    <Modal onClose={() => undefined} persistent className="ui-ending-report" variant={variant}>
      <AssetImage
        className="report-stamp-image"
        src={getEndingStamp(props.ending.type)}
        fallbackLabel={variant === "totalWar" ? "FAILED" : "REPORT"}
        ariaHidden
      />
      <h2>历史事故报告：{props.ending.title}</h2>
      <p className="rating">评级 {props.ending.rating} · 可信度 {props.ending.credibilityScore}</p>
      <p>{props.ending.summary}</p>
      <blockquote>{props.ending.reportTemplate}</blockquote>
      <h3>最终变量</h3>
      <div className="final-vars">
        {props.definitions.map((definition) => (
          <span key={definition.key}>{definition.label}: {props.state.variables[definition.key]}</span>
        ))}
      </div>
      <h3>关键行动日志</h3>
      {keyActions.length === 0 ? <p>未使用干预卡。</p> : keyActions.map((entry) => (
        <div className="report-log" key={entry.id}>
          <b>第 {entry.turn} 回合：{entry.title}</b>
          <small>{entry.effects.map((effect) => `${effect.variable} ${effect.delta > 0 ? "+" : ""}${effect.delta}`).join(" / ") || "无变量变化"}</small>
        </div>
      ))}
      <h3>分享句</h3>
      <blockquote>{props.ending.shareLine}</blockquote>
      <div className="modal-actions">
        <button className="ui-button" onClick={props.onExportState}>导出 GameState JSON</button>
        <button className="primary ui-button ui-button--primary" onClick={props.onRestart}>重新开始</button>
      </div>
    </Modal>
  );
}

export function AdvanceTurnConfirmModal(props: {
  state: GameState;
  currentTurn: TimelineTurn;
  expiringCards: InterventionCardDefinition[];
  upcomingEvents: Array<{ id: string; title: string; turnsUntil: number; severity: string }>;
  warProbability: number;
  onCancel: () => void;
  onConfirm: () => void;
  variant?: AdvanceTurnConfirmVariant;
}) {
  const variant = props.variant ?? getAdvanceTurnConfirmVariant(props.warProbability);
  return (
    <Modal onClose={props.onCancel} className="ui-advance-confirm" variant={variant}>
      <h2>推进时间确认</h2>
      <p className="modal-kicker">Before the player clicks advance time, they should understand what possibilities they are giving up.</p>
      <div className="advance-summary">
        <span className="ui-state-label">当前回合 {props.state.turn}</span>
        <span className="ui-state-label">未使用 AP {props.state.ap}</span>
        <span className="ui-state-label">WAR {props.warProbability}%</span>
      </div>
      <h3>推进后将发生</h3>
      <ChangeList changes={props.currentTurn.defaultPressure.map((effect) => ({ ...effect, before: 0, after: 0 }))} preview />
      <h3>可能触发的特殊规则</h3>
      {props.currentTurn.specialRules.length === 0 ? <p>无特殊规则。</p> : props.currentTurn.specialRules.map((rule) => <p className="system-line" key={rule.id}>{rule.description}</p>)}
      <h3>即将触发的关键事件</h3>
      {props.upcomingEvents.length === 0 ? <p>暂无未来事件。</p> : props.upcomingEvents.slice(0, 3).map((event) => <p className="system-line" key={event.id}>{event.turnsUntil} 回合后：{event.title}</p>)}
      <h3>即将关闭的行动窗口</h3>
      {props.expiringCards.length === 0 ? <p>本回合没有可见卡牌窗口关闭。</p> : props.expiringCards.map((card) => <p className="system-line" key={card.id}>{card.id} {card.name}</p>)}
      <div className="modal-actions">
        <button className="ui-button" onClick={props.onCancel}>取消</button>
        <button className="primary ui-button ui-button--primary" onClick={props.onConfirm}>确认推进时间</button>
      </div>
    </Modal>
  );
}

export function TimeAdvanceReportModal(props: {
  action: ActionLogEntry;
  turn: number;
  turnTitle: string;
  expiredCards: InterventionCardDefinition[];
  onClose: () => void;
  variant?: TimeAdvanceReportVariant;
}) {
  const maxDelta = Math.max(0, ...props.action.effects.map((effect) => effect.delta));
  const variant = props.variant ?? getTimeAdvanceReportVariant(maxDelta);
  return (
    <Modal onClose={props.onClose} className="ui-time-report" variant={variant}>
      <h2>时间推进报告：{props.turnTitle}</h2>
      <AssetImage
        className="modal-hero-image"
        src={getTurnEventImage(props.turn)}
        fallbackLabel={`Turn ${props.turn}`}
      />
      <p>{props.action.description}</p>
      <h3>历史压力变化</h3>
      <ChangeList changes={props.action.effects} />
      <h3>特殊规则 / 不可逆节点</h3>
      {props.action.risks.length === 0 ? <p>未触发。</p> : props.action.risks.map((risk) => (
        <div className="risk" key={risk.id}>
          <b>{risk.description}</b>
          <ChangeList changes={risk.effects} />
        </div>
      ))}
      <h3>失效卡牌</h3>
      {props.expiredCards.length === 0 ? <p>本次推进没有新的可见卡牌失效。</p> : props.expiredCards.map((card) => <p className="system-line" key={card.id}>{card.id}「{card.name}」已错过</p>)}
      {props.action.flagsAdded.length > 0 && <p className="system-line">新增标记：{props.action.flagsAdded.map((flag) => `${flag.flag}=${String(flag.value)}`).join("，")}</p>}
    </Modal>
  );
}

export function TurnBriefingModal(props: {
  state: GameState;
  currentTurn: TimelineTurn;
  upcomingEvents: Array<{ id: string; title: string; turnsUntil: number; severity: string }>;
  opportunityCosts: string[];
  expiringCards: InterventionCardDefinition[];
  onClose: () => void;
}) {
  return (
    <Modal onClose={props.onClose} className="ui-turn-briefing" variant="standard">
      <h2>第 {props.state.turn} 回合：{props.currentTurn.title}</h2>
      <AssetImage
        className="modal-hero-image"
        src={getTurnEventImage(props.currentTurn.turn)}
        fallbackLabel={`Turn ${props.currentTurn.turn}`}
      />
      <p className="modal-kicker">{props.currentTurn.dateRange} · AP {props.state.ap}/{props.state.maxAp}</p>
      <p>{props.currentTurn.narrative}</p>
      <blockquote>{props.currentTurn.goalHint}</blockquote>
      <h3>本回合主要风险</h3>
      {props.opportunityCosts.length === 0 ? <p>暂无突出风险。</p> : props.opportunityCosts.slice(0, 4).map((item) => <p className="system-line" key={item}>{item}</p>)}
      <h3>即将触发事件</h3>
      {props.upcomingEvents.slice(0, 3).map((event) => <p className="system-line" key={event.id}>{event.turnsUntil} 回合后：{event.title}</p>)}
      <h3>本回合可能失效</h3>
      {props.expiringCards.length === 0 ? <p>没有可见卡牌将在本回合后失效。</p> : props.expiringCards.map((card) => <p className="system-line" key={card.id}>{card.id}「{card.name}」</p>)}
    </Modal>
  );
}

function ChangeList({ changes, preview = false }: { changes: ChangeRecord[]; preview?: boolean }) {
  if (changes.length === 0) return <p>无变量变化。</p>;
  return (
    <ul className="changes">
      {changes.map((change, index) => (
        <li key={`${change.variable}-${index}`}>
          <b>{change.variable}</b>
          <span className="delta ui-delta" data-status={change.delta >= 0 ? "increasedThisTurn" : "decreasedThisTurn"}>{change.delta > 0 ? "+" : ""}{change.delta}</span>
          {!preview && <small>{change.before} → {change.after}</small>}
          <em>{change.reason}</em>
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
