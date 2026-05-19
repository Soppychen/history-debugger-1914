import { useMemo, useState } from "react";
import type { AdminAnalyticsSnapshot, PlayerAnalyticsSummary } from "../analytics/eventTypes";
import type { Language } from "../i18n";

interface AdminAnalyticsPageProps {
  snapshot: AdminAnalyticsSnapshot;
  language: Language;
  onExit: () => void;
  onRefresh: () => void;
}

export function AdminAnalyticsPage({ snapshot, language, onExit, onRefresh }: AdminAnalyticsPageProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const isZh = language === "zh";
  const selectedPlayer = useMemo(() => {
    return snapshot.playerSummaries.find((player) => player.playerId === selectedPlayerId) ?? snapshot.playerSummaries[0] ?? null;
  }, [selectedPlayerId, snapshot.playerSummaries]);

  function exportAnalytics() {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `history-debugger-1914-admin-analytics-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">{isZh ? "隐藏后台" : "Hidden Admin"}</p>
          <h1>{isZh ? "玩家分析后台" : "Player Analytics"}</h1>
          <p>{isZh ? "当前为浏览器 localStorage 模拟数据，仅供试玩调试。" : "This is localStorage mock data for playtest debugging only."}</p>
        </div>
        <div className="admin-actions">
          <button type="button" onClick={onRefresh}>{isZh ? "刷新" : "Refresh"}</button>
          <button type="button" onClick={exportAnalytics}>{isZh ? "导出后台 JSON" : "Export JSON"}</button>
          <button type="button" onClick={onExit}>{isZh ? "返回游戏" : "Back to Game"}</button>
        </div>
      </header>

      <section className="admin-grid">
        <Metric label={isZh ? "玩家数" : "Players"} value={snapshot.playerCount} />
        <Metric label={isZh ? "会话数" : "Sessions"} value={snapshot.sessionCount} />
        <Metric label={isZh ? "存档数" : "Saves"} value={snapshot.saveCount} />
        <Metric label={isZh ? "事件数" : "Events"} value={snapshot.eventCount} />
        <Metric label={isZh ? "平均战争概率" : "Avg War"} value={snapshot.averageWarProbability} />
        <Metric label={isZh ? "读档/回滚" : "Rollbacks"} value={snapshot.rollbackCount} />
      </section>

      <section className="admin-columns">
        <AdminList title={isZh ? "事件分布" : "Event Counts"} rows={Object.entries(snapshot.eventCounts).map(([label, count]) => ({ label, count }))} />
        <AdminList title={isZh ? "卡牌使用" : "Card Usage"} rows={snapshot.cardUsage.map((item) => ({ label: item.cardId, count: item.count }))} />
        <AdminList title={isZh ? "结局分布" : "Ending Distribution"} rows={snapshot.endingCounts.map((item) => ({ label: item.endingId, count: item.count }))} />
        <AdminList title={isZh ? "玩家风格均值" : "Style Averages"} rows={Object.entries(snapshot.styleAverages).map(([label, count]) => ({ label, count }))} />
      </section>

      <section className="admin-player-section">
        <div className="admin-player-list">
          <h2>{isZh ? "单个玩家分析" : "Per-player Analysis"}</h2>
          {snapshot.playerSummaries.length === 0 && <p className="hint">{isZh ? "暂无玩家数据。" : "No player data yet."}</p>}
          {snapshot.playerSummaries.map((player) => (
            <button
              type="button"
              className="admin-player-row"
              data-selected={selectedPlayer?.playerId === player.playerId}
              key={player.playerId}
              onClick={() => setSelectedPlayerId(player.playerId)}
            >
              <strong>{player.playerId.slice(0, 16)}</strong>
              <span>{isZh ? "事件" : "Events"} {player.eventCount} · {isZh ? "存档" : "Saves"} {player.saveCount}</span>
              <small>{isZh ? "最近" : "Seen"} {new Date(player.lastSeenAt).toLocaleString()}</small>
            </button>
          ))}
        </div>
        {selectedPlayer && <PlayerDetail player={selectedPlayer} isZh={isZh} />}
      </section>

      <section className="admin-table-panel">
        <h2>{isZh ? "最近事件" : "Recent Events"}</h2>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>{isZh ? "时间" : "Time"}</th>
              <th>{isZh ? "玩家" : "Player"}</th>
              <th>{isZh ? "事件" : "Event"}</th>
              <th>{isZh ? "回合" : "Turn"}</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.recentEvents.map((event) => (
              <tr key={event.id}>
                <td>{new Date(event.timestamp).toLocaleString()}</td>
                <td>{event.playerId.slice(0, 12)}</td>
                <td>{event.eventType}</td>
                <td>{event.turn ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function PlayerDetail({ player, isZh }: { player: PlayerAnalyticsSummary; isZh: boolean }) {
  return (
    <section className="admin-player-detail">
      <div className="panel-header">
        <span>{isZh ? "玩家画像" : "Player Profile"}</span>
        <strong>{player.playerId}</strong>
      </div>
      <section className="admin-grid compact">
        <Metric label={isZh ? "事件" : "Events"} value={player.eventCount} />
        <Metric label={isZh ? "会话" : "Sessions"} value={player.sessionCount} />
        <Metric label={isZh ? "存档" : "Saves"} value={player.saveCount} />
        <Metric label={isZh ? "最近回合" : "Latest Turn"} value={player.latestTurn ?? 0} />
        <Metric label={isZh ? "最近战争概率" : "Latest War"} value={player.latestWarProbability ?? 0} />
        <Metric label={isZh ? "分析授权" : "Analytics"} value={player.analyticsConsent ? 1 : 0} />
      </section>
      <section className="admin-columns compact">
        <AdminList title={isZh ? "该玩家事件" : "Player Events"} rows={Object.entries(player.eventCounts).map(([label, count]) => ({ label, count }))} />
        <AdminList title={isZh ? "该玩家卡牌" : "Player Cards"} rows={player.cardUsage.map((item) => ({ label: item.cardId, count: item.count }))} />
        <AdminList title={isZh ? "达成结局" : "Endings"} rows={player.endingsReached.map((endingId) => ({ label: endingId, count: 1 }))} />
        <AdminList title={isZh ? "风格评分" : "Style Scores"} rows={Object.entries(player.styleScores).map(([label, count]) => ({ label, count }))} />
      </section>
      <section className="admin-table-panel nested">
        <h2>{isZh ? "该玩家最近行为" : "Recent Player Events"}</h2>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>{isZh ? "时间" : "Time"}</th>
              <th>{isZh ? "事件" : "Event"}</th>
              <th>{isZh ? "回合" : "Turn"}</th>
              <th>{isZh ? "摘要" : "Payload"}</th>
            </tr>
          </thead>
          <tbody>
            {player.recentEvents.map((event) => (
              <tr key={event.id}>
                <td>{new Date(event.timestamp).toLocaleString()}</td>
                <td>{event.eventType}</td>
                <td>{event.turn ?? "-"}</td>
                <td>{summarizePayload(event.payload)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}

function summarizePayload(payload: Record<string, unknown>): string {
  const preferred = ["cardId", "intelId", "endingId", "slotName", "variable", "riskId", "warProbability"];
  const parts = preferred
    .filter((key) => payload[key] !== undefined)
    .map((key) => `${key}:${String(payload[key])}`);
  return parts.length > 0 ? parts.join(" · ") : "-";
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="admin-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function AdminList({ title, rows }: { title: string; rows: Array<{ label: string; count: number }> }) {
  return (
    <section className="admin-list">
      <h2>{title}</h2>
      {rows.length === 0 && <p className="hint">No data</p>}
      {rows.slice(0, 12).map((row) => (
        <div className="admin-list-row" key={row.label}>
          <span>{row.label}</span>
          <strong>{row.count}</strong>
        </div>
      ))}
    </section>
  );
}
