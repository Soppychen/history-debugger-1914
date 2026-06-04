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
    | "cards_used_min"
    | "node_active";
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
  image?: string;
  caption?: string;
  imageCaption?: string;
}

export interface IntelCard {
  id: string;
  title: string;
  type: string;
  turnRange: [number, number];
  summary: string;
  reveals: Array<string | IntelReveal>;
  unlocks: string[];
  tags: string[];
  quote: string;
  image?: string;
  caption?: string;
  imageCaption?: string;
}

export type VariableVisibility = "hidden" | "unknown" | "rough" | "range" | "exact";

export interface IntelReveal {
  variableId: string;
  visibility: VariableVisibility;
  range?: [number, number];
  confidence?: number;
  note?: string;
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
  briefing?: TurnBriefing;
  image?: string;
  caption?: string;
  imageCaption?: string;
}

export interface TurnBriefing {
  briefingTitle: string;
  briefingText: string;
  keyRisks: string[];
  focusVariableIds: string[];
  expiringCardIds: string[];
  upcomingEventIds: string[];
}

export interface CrisisEvent {
  id: string;
  title: string;
  turn: number;
  description: string;
  eventType:
    | "diplomatic_window"
    | "ultimatum"
    | "mobilization"
    | "media_pressure"
    | "irreversible"
    | "war_threshold";
  effectsPreview: VariableEffect[];
  relatedCardIds: string[];
  interventionWindow?: {
    startTurn: number;
    endTurn: number;
  };
  irreversibleNodeId?: string;
}

export interface IrreversibleNode {
  id: string;
  title: string;
  triggerTurn?: number;
  conditions: Condition[];
  effects: VariableEffect[];
  lockedCardIds: string[];
  unlockedCardIds: string[];
  variableImpactSummary: string[];
  reportText: string;
  visual?: {
    image?: string;
    caption?: string;
    stamp?: string;
  };
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
  image?: string;
  visual?: string;
  stamp?: string;
  caption?: string;
  imageCaption?: string;
}

export type VariableMap = Record<VariableKey, number>;
export type FlagMap = Record<string, boolean | string | number>;

export interface DataBundle {
  variables: VariableDefinition[];
  timeline: TimelineTurn[];
  interventionCards: InterventionCard[];
  intelCards: IntelCard[];
  endings: EndingDefinition[];
  crisisEvents: CrisisEvent[];
  irreversibleNodes: IrreversibleNode[];
}

export interface ChangeRecord extends VariableEffect {
  before: number;
  after: number;
}

export interface ActionLogEntry {
  id: string;
  turn: number;
  kind: "card" | "turn" | "irreversible";
  nodeId?: string;
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
  triggeredNodeIds: string[];
  lockedCardIds: string[];
  unlockedCardIds: string[];
  actionLog: ActionLogEntry[];
  ending: EndingDefinition | null;
  lastChangedVariables: string[];
  lastChangeDeltas: Record<string, number>;
}
