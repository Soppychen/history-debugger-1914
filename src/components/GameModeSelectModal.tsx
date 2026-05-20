import { currentWeeklyChallenge } from "../challenges/weeklyArchiveChallenge";
import { gameModes, type GameMode } from "../modes/gameModes";
import type { Language } from "../i18n";

interface GameModeSelectModalProps {
  language: Language;
  currentMode: GameMode;
  onStart: (mode: GameMode) => void;
  onClose?: () => void;
}

export function GameModeSelectModal({ language, currentMode, onStart, onClose }: GameModeSelectModalProps) {
  const isZh = language === "zh";
  return (
    <div className="modal-backdrop">
      <section className="modal mode-modal">
        <div className="panel-header">
          <span>{isZh ? "调试模式" : "Debug Mode"}</span>
          <strong>{isZh ? "选择本局规则" : "Choose run rules"}</strong>
          {onClose && <button className="panel-close-button" type="button" onClick={onClose}>×</button>}
        </div>
        <div className="mode-grid">
          {gameModes.map((mode) => (
            <button
              type="button"
              className="mode-card"
              data-current={mode.id === currentMode}
              key={mode.id}
              onClick={() => onStart(mode.id)}
            >
              <b>{isZh ? mode.labelZh : mode.labelEn}</b>
              <span>{isZh ? mode.descriptionZh : mode.descriptionEn}</span>
              <small>
                {mode.leaderboardEligible ? (isZh ? "可进入榜单" : "Leaderboard eligible") : (isZh ? "仅个人历史" : "Personal history only")}
              </small>
            </button>
          ))}
        </div>
        <aside className="weekly-challenge-callout">
          <b>{isZh ? currentWeeklyChallenge.titleZh : currentWeeklyChallenge.titleEn}</b>
          <p>{isZh ? currentWeeklyChallenge.descriptionZh : currentWeeklyChallenge.descriptionEn}</p>
        </aside>
      </section>
    </div>
  );
}
