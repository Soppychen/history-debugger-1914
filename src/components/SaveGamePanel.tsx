import type { SaveGame } from "../analytics/eventTypes";
import type { Language } from "../i18n";
import { getGameModeDefinition, type GameMode } from "../modes/gameModes";

interface SaveGamePanelProps {
  recoveryCode: string;
  saves: SaveGame[];
  language: Language;
  mode: GameMode;
  onClose: () => void;
  onShowCode: () => void;
  onRecover: () => void;
  onManualSave: (slotName: string) => void;
  onLoadSave: (save: SaveGame) => void;
}

const manualSlots = ["manual_slot_1", "manual_slot_2", "manual_slot_3", "manual_slot_4", "manual_slot_5"];

export function SaveGamePanel({
  recoveryCode,
  saves,
  language,
  mode,
  onClose,
  onShowCode,
  onRecover,
  onManualSave,
  onLoadSave,
}: SaveGamePanelProps) {
  const isZh = language === "zh";
  const latestSaves = saves.slice(0, 6);
  const modeDefinition = getGameModeDefinition(mode);

  return (
    <section className="account-panel dossier-panel modal">
      <div className="panel-header">
        <span>{isZh ? "玩家与存档" : "Player and Saves"}</span>
        <strong>{recoveryCode}</strong>
        <button type="button" className="panel-close-button" onClick={onClose} aria-label={isZh ? "关闭" : "Close"}>
          ×
        </button>
      </div>
      <div className="account-actions">
        <button type="button" onClick={onShowCode}>{isZh ? "查看编码" : "View Code"}</button>
        <button type="button" onClick={onRecover}>{isZh ? "用编码恢复" : "Recover"}</button>
      </div>
      <div className="manual-save-row">
        {manualSlots.map((slot) => (
          <button type="button" key={slot} disabled={!modeDefinition.allowsManualSave} onClick={() => onManualSave(slot)}>
            {slot.replace("manual_slot_", isZh ? "手动 " : "Manual ")}
          </button>
        ))}
      </div>
      {!modeDefinition.allowsLoad && (
        <p className="system-line">{isZh ? "铁人模式禁止手动读档，当前只保留自动归档。" : "Ironman mode forbids manual loading. Autosaves remain archived only."}</p>
      )}
      <div className="save-list">
        {latestSaves.length === 0 && <p className="hint">{isZh ? "暂无存档。" : "No saves yet."}</p>}
        {latestSaves.map((save) => (
          <button type="button" className="save-row" key={save.id} disabled={!modeDefinition.allowsLoad} onClick={() => onLoadSave(save)}>
            <span>{save.slotType === "auto" ? (isZh ? "自动" : "Auto") : save.slotType === "manual" ? (isZh ? "手动" : "Manual") : (isZh ? "结局" : "Ending")}</span>
            <strong>{save.summary.turnLabel}</strong>
            <small>{save.summary.currentRiskLevel} · WAR {save.warProbability}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
