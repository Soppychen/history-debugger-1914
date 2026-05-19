export type EndingGrade = "S" | "A" | "B" | "C" | "D" | "F";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type VariablePolarity = "higher_is_better" | "higher_is_worse" | "neutral";

export interface EndingReport {
  id: string;
  caseId: string;
  caseName: string;
  dateRange: string;
  endingType: string;
  endingTitle: string;
  grade: EndingGrade;
  historicalCredibility: number;
  finalWarProbability: number;
  executiveSummary: string;
  finalVariables: FinalVariableReport[];
  keyCausalChain: CausalChainNode[];
  keyPlayerActions: PlayerActionSummary[];
  analysis: EndingAnalysis;
  playerStyle: PlayerStyleSummary;
  shareCard: ShareCardData;
  createdAt: string;
}

export interface FinalVariableReport {
  id: string;
  label: string;
  value: number;
  initialValue: number;
  delta: number;
  polarity: VariablePolarity;
  riskLevel: RiskLevel;
  explanation: string;
}

export interface CausalChainNode {
  id: string;
  label: string;
  type: "event" | "variable" | "player_action" | "irreversible" | "ending";
  turn?: number;
  dateLabel?: string;
  severity: RiskLevel;
  description: string;
}

export interface PlayerActionSummary {
  cardId: string;
  cardName: string;
  turn: number;
  effectSummary: string;
  variableDeltas: Record<string, number>;
  evaluation: "effective" | "mixed" | "harmful" | "too_late";
  explanation: string;
}

export interface EndingAnalysis {
  mode: "failure" | "stability" | "mixed";
  primaryFactors: EndingFactor[];
  credibilityNote: string;
  residualRisks: string[];
}

export interface EndingFactor {
  title: string;
  severity: RiskLevel;
  explanation: string;
  relatedVariables: string[];
  relatedEvents: string[];
}

export interface PlayerStyleSummary {
  label: string;
  description: string;
  tags: string[];
}

export interface ShareCardData {
  title: string;
  endingTitle: string;
  grade: EndingGrade;
  historicalCredibility: number;
  finalWarProbability: number;
  playerStyleLabel: string;
  quote: string;
}
