import { useState } from "react";
import type { Language } from "../i18n";

interface LoadByCodeModalProps {
  language: Language;
  onClose: () => void;
  onRecover: (code: string) => boolean;
}

export function LoadByCodeModal({ language, onClose, onRecover }: LoadByCodeModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isZh = language === "zh";

  function recover() {
    if (onRecover(code)) {
      onClose();
      return;
    }
    setError(isZh ? "没有找到这个玩家编码。请检查格式。" : "No player found for this code. Check the format.");
  }

  return (
    <div className="modal-backdrop">
      <section className="modal account-modal">
        <div className="panel-header">
          <span>{isZh ? "恢复玩家" : "Recover Player"}</span>
          <strong>{isZh ? "输入编码" : "Enter Code"}</strong>
        </div>
        <input
          className="account-input"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="HD-XXXX-XXXX-XXXX-XXXX"
        />
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" onClick={onClose}>{isZh ? "取消" : "Cancel"}</button>
          <button type="button" className="primary" onClick={recover}>{isZh ? "恢复" : "Recover"}</button>
        </div>
      </section>
    </div>
  );
}
