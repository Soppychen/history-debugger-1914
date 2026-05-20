import { currentWeeklyChallenge } from "../challenges/weeklyArchiveChallenge";
import type { GameMode } from "../modes/gameModes";
import type { Language } from "../i18n";

export function WeeklyChallengePanel(props: {
  language: Language;
  mode: GameMode;
  seed: string;
  appliedDeltas: Record<string, number>;
  onOpenModeSelect: () => void;
  onOpenLeaderboard: () => void;
}) {
  const isZh = props.language === "zh";
  const title = isZh ? currentWeeklyChallenge.titleZh : currentWeeklyChallenge.titleEn;
  const description = isZh ? currentWeeklyChallenge.descriptionZh : currentWeeklyChallenge.descriptionEn;
  return (
    <section className="weekly-panel">
      <div>
        <span className="ui-state-label">{props.mode.toUpperCase()} · SEED {props.seed}</span>
        <b>{title}</b>
        <p>{description}</p>
      </div>
      <div className="scenario-deltas">
        {Object.entries(props.appliedDeltas).slice(0, 4).map(([key, delta]) => (
          <span key={key}>{key} {delta >= 0 ? "+" : ""}{delta}</span>
        ))}
      </div>
      <div className="weekly-actions">
        <button type="button" onClick={props.onOpenModeSelect}>{isZh ? "切换模式" : "Mode"}</button>
        <button type="button" onClick={props.onOpenLeaderboard}>{isZh ? "查看榜单" : "Leaderboard"}</button>
      </div>
    </section>
  );
}
