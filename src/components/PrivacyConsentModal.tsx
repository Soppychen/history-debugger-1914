import type { ConsentState } from "../analytics/eventTypes";
import type { Language } from "../i18n";

interface PrivacyConsentModalProps {
  language: Language;
  onSave: (consent: ConsentState) => void;
}

export function PrivacyConsentModal({ language, onSave }: PrivacyConsentModalProps) {
  const isZh = language === "zh";

  function save(analyticsAccepted: boolean) {
    onSave({
      version: "account-analytics-v1",
      necessaryAccepted: true,
      analyticsAccepted,
      decidedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="modal-backdrop">
      <section className="modal account-modal">
        <div className="panel-header">
          <span>{isZh ? "隐私与匿名数据" : "Privacy and anonymous data"}</span>
          <strong>{isZh ? "匿名优先" : "Anonymous first"}</strong>
        </div>
        <p>
          {isZh
            ? "我们会在本机创建匿名玩家编码，用于保存进度、恢复存档和改进玩法。不会要求邮箱、手机号或真实姓名。"
            : "The prototype creates an anonymous player code for saves, recovery, and playtest improvement. It does not ask for email, phone, or real name."}
        </p>
        <ul className="privacy-list">
          <li>{isZh ? "必要数据：玩家编码、本地存档、恢复状态。" : "Necessary: player code, local saves, recovery state."}</li>
          <li>{isZh ? "可选数据：卡牌选择、读档、结局与匿名玩法事件。" : "Optional: card choices, loads, endings, and anonymous play events."}</li>
          <li>{isZh ? "当前版本是本地模拟，不会上传到服务器。" : "This build is local mock only and does not upload to a server."}</li>
        </ul>
        <div className="modal-actions">
          <button type="button" onClick={() => save(false)}>
            {isZh ? "只保留必要数据" : "Necessary only"}
          </button>
          <button type="button" className="primary" onClick={() => save(true)}>
            {isZh ? "同意匿名玩法分析" : "Allow anonymous analytics"}
          </button>
        </div>
      </section>
    </div>
  );
}
