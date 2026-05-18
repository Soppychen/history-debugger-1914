export type VariableKey = string;

export interface VariableDefinition {
  key: VariableKey;
  label: string;
  initialValue: number;
  min: number;
  max: number;
  description: string;
}

export interface VariableEffect {
  variable: VariableKey;
  delta: number;
  reason: string;
}

export interface FlagEffect {
  flag: string;
  value: boolean | string | number;
}

export interface Condition {
  type:
    | "variable_min"
    | "variable_max"
    | "flag_exists"
    | "turn_min"
    | "turn_max"
    | "card_used"
    | "cards_used_min";
  key?: string;
  value: boolean | string | number;
}

export interface RiskDefinition {
  id: string;
  description: string;
  conditions: Condition[];
  effects: VariableEffect[];
}

export interface InterventionCard {
  id: string;
  name: string;
  type: string[];
  cost: number;
  feasibility: string;
  turnRange: [number, number];
  requirements: Condition[];
  effects: VariableEffect[];
  risks: RiskDefinition[];
  description: string;
  flavor: string;
  flagsAdded?: FlagEffect[];
  flags?: FlagEffect[];
  unlocks?: string[];
}

export interface IntelCard {
  id: string;
  title: string;
  type: string;
  turnRange: [number, number];
  summary: string;
  reveals: string[];
  unlocks: string[];
  tags: string[];
  quote: string;
}

export interface SpecialRule {
  id: string;
  description: string;
  conditions: Condition[];
  effects: VariableEffect[];
  flags?: FlagEffect[];
}

export interface TimelineTurn {
  turn: number;
  dateRange: string;
  title: string;
  narrative: string;
  defaultPressure: VariableEffect[];
  recommendedIntel: string[];
  recommendedCards: string[];
  goalHint: string;
  specialRules: SpecialRule[];
}

export interface EndingDefinition {
  id: string;
  type: string;
  title: string;
  priority: number;
  conditions: Condition[];
  rating: string;
  credibilityScore: number;
  summary: string;
  reportTemplate: string;
  shareLine: string;
}

export type VariableMap = Record<VariableKey, number>;
export type FlagMap = Record<string, boolean | string | number>;

export interface DataBundle {
  variables: VariableDefinition[];
  timeline: TimelineTurn[];
  interventionCards: InterventionCard[];
  intelCards: IntelCard[];
  endings: EndingDefinition[];
}

export interface ChangeRecord extends VariableEffect {
  before: number;
  after: number;
}

export interface ActionLogEntry {
  id: string;
  turn: number;
  kind: "card" | "turn";
  title: string;
  description: string;
  effects: ChangeRecord[];
  risks: Array<{
    id: string;
    description: string;
    effects: ChangeRecord[];
  }>;
  flagsAdded: FlagEffect[];
  flavor?: string;
}

export interface GameState {
  turn: number;
  ap: number;
  maxAp: number;
  variables: VariableMap;
  flags: FlagMap;
  usedCardIds: string[];
  lowFeasibilityCardsUsed: number;
  revealedIntelIds: string[];
  actionLog: ActionLogEntry[];
  ending: EndingDefinition | null;
  lastChangedVariables: string[];
  lastChangeDeltas: Record<string, number>;
}
