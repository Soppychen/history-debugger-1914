import { useMemo, useState } from "react";
import { getLeaderboardEntries } from "../leaderboard/mockLeaderboardClient";
import { leaderboardDefinitions, type LeaderboardType } from "../leaderboard/leaderboardTypes";
import type { Language } from "../i18n";

export function LeaderboardPage(props: {
  language: Language;
  playerId?: string;
  onClose: () => void;
}) {
  const [activeType, setActiveType] = useState<LeaderboardType>("debug_score");
  const isZh = props.language === "zh";
  const entries = useMemo(() => getLeaderboardEntries(activeType, activeType === "personal" ? props.playerId : undefined), [activeType, props.playerId]);
  return (
    <div className="modal-backdrop">
      <section className="modal leaderboard-modal">
        <div className="panel-header">
          <span>{isZh ? "天梯 / 挑战榜" : "Ladders"}</span>
          <strong>{isZh ? "本地 mock 排行榜" : "Local mock leaderboard"}</strong>
          <button className="panel-close-button" type="button" onClick={props.onClose}>×</button>
        </div>
        <div className="leaderboard-tabs">
          {leaderboardDefinitions.map((definition) => (
            <button type="button" data-active={activeType === definition.type} key={definition.id} onClick={() => setActiveType(definition.type)}>
              {isZh ? definition.titleZh : definition.titleEn}
            </button>
          ))}
        </div>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{isZh ? "玩家" : "Player"}</th>
              <th>{isZh ? "模式" : "Mode"}</th>
              <th>{isZh ? "结局" : "Ending"}</th>
              <th>HDB</th>
              <th>{isZh ? "评级" : "Grade"}</th>
              <th>WAR</th>
              <th>{isZh ? "可信度" : "Cred."}</th>
              <th>{isZh ? "用卡" : "Cards"}</th>
              <th>{isZh ? "读档" : "Loads"}</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr><td colSpan={10}>{isZh ? "暂无成绩。完成一局后会写入本地榜单。" : "No entries yet. Finish a run to populate the local ladder."}</td></tr>
            )}
            {entries.map((entry, index) => (
              <tr key={entry.id}>
                <td>{index + 1}</td>
                <td>{entry.displayName}</td>
                <td>{entry.mode}</td>
                <td>{entry.endingType}</td>
                <td>{entry.debugScore}</td>
                <td>{entry.grade}</td>
                <td>{entry.finalWarProbability}%</td>
                <td>{entry.historicalCredibility}%</td>
                <td>{entry.usedCardCount}</td>
                <td>{entry.reloadCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="system-line">{isZh ? "当前榜单只保存在本机。真实上线时应由后端重算分数并验证 actionSequenceHash。" : "This ladder is local only. A production backend should recompute scores and verify actionSequenceHash."}</p>
      </section>
    </div>
  );
}
