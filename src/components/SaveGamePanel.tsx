import type { SaveGame } from "../analytics/eventTypes";
import type { Language } from "../i18n";

interface SaveGamePanelProps {
  recoveryCode: string;
  saves: SaveGame[];
  language: Language;
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
  onClose,
  onShowCode,
  onRecover,
  onManualSave,
  onLoadSave,
}: SaveGamePanelProps) {
  const isZh = language === "zh";
  const latestSaves = saves.slice(0, 6);

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
          <button type="button" key={slot} onClick={() => onManualSave(slot)}>
            {slot.replace("manual_slot_", isZh ? "手动 " : "Manual ")}
          </button>
        ))}
      </div>
      <div className="save-list">
        {latestSaves.length === 0 && <p className="hint">{isZh ? "暂无存档。" : "No saves yet."}</p>}
        {latestSaves.map((save) => (
          <button type="button" className="save-row" key={save.id} onClick={() => onLoadSave(save)}>
            <span>{save.slotType === "auto" ? (isZh ? "自动" : "Auto") : save.slotType === "manual" ? (isZh ? "手动" : "Manual") : (isZh ? "结局" : "Ending")}</span>
            <strong>{save.summary.turnLabel}</strong>
            <small>{save.summary.currentRiskLevel} · WAR {save.warProbability}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
