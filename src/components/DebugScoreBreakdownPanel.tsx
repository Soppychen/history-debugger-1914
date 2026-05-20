import type { DebugScoreResult } from "../score/debugScoreTypes";
import type { Language } from "../i18n";

export function DebugScoreBreakdownPanel({ result, language }: { result: DebugScoreResult; language: Language }) {
  const isZh = language === "zh";
  const labels: Record<string, string> = isZh
    ? {
        base: "基础分",
        warProbabilityPenalty: "战争概率惩罚",
        credibilityBonus: "可信度奖励",
        irreversiblePenalty: "不可逆惩罚",
        backlashPenalty: "反噬惩罚",
        lowCredibilityPenalty: "低可信卡惩罚",
        reloadPenalty: "读档惩罚",
        localWarPenalty: "局部战争代价",
        endingBonus: "结局奖励",
        actionEfficiencyBonus: "行动效率",
        intelQualityBonus: "情报质量",
        modeBonus: "模式奖励",
      }
    : {
        base: "Base",
        warProbabilityPenalty: "War Probability",
        credibilityBonus: "Credibility",
        irreversiblePenalty: "Irreversible",
        backlashPenalty: "Backlash",
        lowCredibilityPenalty: "Low Credibility",
        reloadPenalty: "Reload",
        localWarPenalty: "Local War Cost",
        endingBonus: "Ending",
        actionEfficiencyBonus: "Efficiency",
        intelQualityBonus: "Intel Quality",
        modeBonus: "Mode",
      };

  return (
    <section className="debug-score-panel">
      <div className="debug-score-main">
        <span>{isZh ? "HDB 调试评分" : "Historical Debug Score"}</span>
        <strong>{result.score}</strong>
        <b>{result.grade}</b>
      </div>
      <div className="score-breakdown-grid">
        {Object.entries(result.breakdown).map(([key, value]) => (
          <div className="score-breakdown-row" key={key}>
            <span>{labels[key] ?? key}</span>
            <strong>{value > 0 ? "+" : ""}{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
