import type { Language } from "../i18n";

interface RecoveryCodeModalProps {
  recoveryCode: string;
  language: Language;
  onClose: () => void;
}

export function RecoveryCodeModal({ recoveryCode, language, onClose }: RecoveryCodeModalProps) {
  const isZh = language === "zh";

  async function copyCode() {
    await window.navigator.clipboard?.writeText(recoveryCode);
  }

  return (
    <div className="modal-backdrop">
      <section className="modal account-modal">
        <div className="panel-header">
          <span>{isZh ? "玩家编码" : "Player Code"}</span>
          <strong>{isZh ? "请妥善保存" : "Keep it safe"}</strong>
        </div>
        <p>
          {isZh
            ? "这个编码可以恢复你的身份和存档。拥有编码的人也可能读取你的本地模拟存档。"
            : "This code recovers your identity and saves. Anyone with it may recover your local mock save data."}
        </p>
        <div className="recovery-code">{recoveryCode}</div>
        <div className="modal-actions">
          <button type="button" onClick={copyCode}>{isZh ? "复制编码" : "Copy code"}</button>
          <button type="button" className="primary" onClick={onClose}>{isZh ? "我已保存" : "Saved"}</button>
        </div>
      </section>
    </div>
  );
}
