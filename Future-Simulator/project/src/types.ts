export type RiskLevel = 'low' | 'medium' | 'high';

export type ScenarioFocus = 'wealth' | 'career' | 'balanced';

export type ScenarioTier = 'best' | 'average' | 'worst';

export type FinancialStatus =
  | 'comfortable'
  | 'stable'
  | 'tight'
  | 'critical';

export type EmotionalStateOption =
  | 'excited'
  | 'anxious'
  | 'uncertain'
  | 'confident'
  | 'burned_out'
  | 'hopeful';

export type TimeframeOption =
  | '6months'
  | '1year'
  | '3years'
  | '5years'
  | '10years';

export type RelationshipsImpact =
  | 'minimal'
  | 'moderate'
  | 'significant'
  | 'critical';

export type LifeDomain =
  | 'time'
  | 'relationships'
  | 'career'
  | 'finance'
  | 'mentalHealth'
  | 'education'
  | 'reputation'
  | 'opportunities'
  | 'riskFactors'
  | 'emotionalEffects';

export type DomainTrajectory = 'up' | 'steady' | 'down' | 'volatile';

export type TimelineMarker = 'month1' | 'month3' | 'month6' | 'year1' | 'year5';

export interface DecisionInput {
  currentSituation: string;
  decisionConsidered: string;
  desiredOutcome: string;
  biggestFear: string;
  financialStatus: FinancialStatus;
  emotionalState: EmotionalStateOption;
  confidenceLevel: number;
  timeframe: TimeframeOption;
  riskTolerance: RiskLevel;
  relationshipsImpact: RelationshipsImpact;
  existingSkills: string;
  externalConstraints: string;
  skillTags: string[];
  constraintTags: string[];
  currentAge: number;
  annualIncome: number;
  monthlySavings: number;
}

export interface ParallelUniverseInput {
  optionALabel: string;
  optionAChoice: string;
  optionBLabel: string;
  optionBChoice: string;
}

export interface ComparisonRow {
  dimension: string;
  optionA: string;
  optionB: string;
  lean?: 'a' | 'b' | 'neutral';
}

export interface ParallelUniverseComparison {
  optionALabel: string;
  optionBLabel: string;
  resultA: SimulationResult;
  resultB: SimulationResult;
  rows: ComparisonRow[];
  verdict: string;
  aiSource?: 'grok' | 'template';
  aiInsights?: string[];
  winnerLean?: 'a' | 'b' | 'neutral';
  futureTree?: FutureTreeNode;
}

export interface FutureTreeNode {
  id: string;
  label: string;
  subtitle?: string;
  probability?: number;
  tier?: ScenarioTier;
  glow?: boolean;
  children?: FutureTreeNode[];
}

/** @deprecated Legacy shape — derived from DecisionInput */
export interface SimulationInput {
  currentAge: number;
  yearsAhead: number;
  annualIncome: number;
  monthlySavings: number;
  investmentReturn: number;
  inflation: number;
  riskLevel: RiskLevel;
  focus: ScenarioFocus;
  lifeEvent: string;
}

export interface YearSnapshot {
  year: number;
  age: number;
  optimistic: number;
  realistic: number;
  pessimistic: number;
  milestone?: string;
}

export interface DomainOutcome {
  id: LifeDomain;
  label: string;
  state: string;
  trajectory: DomainTrajectory;
  why: string;
}

export interface ChainReaction {
  trigger: string;
  cascade: string[];
  why: string;
}

export interface TimelineStage {
  marker: TimelineMarker;
  label: string;
  events: string[];
  consequences: string[];
  emotionalChanges: string[];
  opportunities: string[];
  risks: string[];
}

export interface ScenarioCase {
  title: 'BEST CASE' | 'AVERAGE CASE' | 'WORST CASE';
  tier: ScenarioTier;
  summary: string;
  domains: DomainOutcome[];
  chainReactions: ChainReaction[];
  timeline: TimelineStage[];
  bullets: string[];
}

export interface ScenarioOutcomes {
  best: ScenarioCase;
  average: ScenarioCase;
  worst: ScenarioCase;
  pathLabel: string;
  drivingFactors: string[];
}

export interface ProbabilityScores {
  best: number;
  average: number;
  worst: number;
}

export interface EnrichedScenarioCard {
  tier: ScenarioTier;
  title: 'BEST CASE SCENARIO' | 'MOST LIKELY SCENARIO' | 'WORST CASE SCENARIO';
  probability: number;
  timeline: TimelineStage[];
  keyEvents: string[];
  opportunities?: string[];
  challenges?: string[];
  failureTriggers?: string[];
  risks?: string[];
  emotionalOutcome: string;
  emotionalImpact?: string;
  finalResult: string;
  recoveryPossibilities?: string[];
  summary: string;
}

export interface EmotionalTrajectoryPoint {
  phase: string;
  emotion: string;
  driver: string;
}

export interface ScenarioBranch {
  id: string;
  label: string;
  probability: number;
  outcome: string;
  parentTier: ScenarioTier;
}

export interface OutcomeDriver {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  explanation: string;
}

export interface PersonalityProfile {
  traits: string[];
  patterns: string[];
  summary: string;
}

export interface AdvancedAIAnalysis {
  personalityProfile: PersonalityProfile;
  riskProfileScore: number;
  riskLabel: string;
  confidenceEstimate: number;
  strategicAdvice: string[];
  emotionalTrajectory: EmotionalTrajectoryPoint[];
  scenarioBranches: ScenarioBranch[];
  outcomeDrivers: OutcomeDriver[];
  memoryReferences: string[];
  relationshipImpact: string;
  financialProjection: string;
  careerTrajectory: string;
  lifeMapInsight: string;
  whatChangedOutcome: string;
}

export interface ConversationTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  simulationId?: string;
  createdAt: string;
}

export interface DecisionTimelineEntry {
  id: string;
  simulationId: string;
  label: string;
  decisionSnippet: string;
  outcomeTier: ScenarioTier;
  confidenceAtTime: number;
  riskTolerance: RiskLevel;
  emotionalState: EmotionalStateOption;
  createdAt: string;
}

export interface ScenarioMemoryEntry {
  id: string;
  simulationId: string;
  label: string;
  decisionConsidered: string;
  desiredOutcome: string;
  biggestFear: string;
  bestProbability: number;
  averageProbability: number;
  worstProbability: number;
  dominantTier: ScenarioTier;
  headline: string;
  createdAt: string;
}

export interface UserProfile {
  longTermGoals: string[];
  recurringFears: string[];
  riskBehavior: {
    averageTolerance: RiskLevel;
    confidenceTrend: number;
    simulationsCount: number;
  };
  personalitySignals: {
    dominantEmotionalStates: EmotionalStateOption[];
    decisionThemes: string[];
  };
  historicalOutcomes: {
    tier: ScenarioTier;
    count: number;
  }[];
  lastUpdated: string;
}

export interface UserMemoryStore {
  profile: UserProfile;
  conversations: ConversationTurn[];
  decisionTimeline: DecisionTimelineEntry[];
  scenarioSummaries: ScenarioMemoryEntry[];
  updatedAt: string;
}

export interface SimulationResult {
  id: string;
  createdAt: string;
  decision: DecisionInput;
  input: SimulationInput;
  snapshots: YearSnapshot[];
  scenarios: ScenarioOutcomes;
  probabilities: ProbabilityScores;
  enrichedScenarios: {
    best: EnrichedScenarioCard;
    average: EnrichedScenarioCard;
    worst: EnrichedScenarioCard;
  };
  advancedAnalysis: AdvancedAIAnalysis;
  /** AI-personalized branching tree; built after simulation */
  futureTree?: FutureTreeNode;
  memoryContext: {
    referencesUsed: string[];
    isRepeatDecision: boolean;
    priorSimulationCount: number;
  };
  summary: {
    endWealth: { optimistic: number; realistic: number; pessimistic: number };
    savingsRate: number;
    confidence: number;
    headline: string;
    insights: string[];
    /** Present when AI narrates results; omitted on older saved runs */
    aiSource?: 'grok' | 'template';
    /** Set when AI was configured but the request failed */
    aiError?: string;
  };
}

export interface SavedSimulation {
  id: string;
  label: string;
  created_at: string;
  payload: SimulationResult;
}

export const DOMAIN_LABELS: Record<LifeDomain, string> = {
  time: 'Time',
  relationships: 'Relationships',
  career: 'Career',
  finance: 'Finance',
  mentalHealth: 'Mental health',
  education: 'Education',
  reputation: 'Reputation',
  opportunities: 'Opportunities',
  riskFactors: 'Risk factors',
  emotionalEffects: 'Emotional effects',
};

export const TIMELINE_MARKERS: { marker: TimelineMarker; label: string; months: number }[] = [
  { marker: 'month1', label: 'Month 1', months: 1 },
  { marker: 'month3', label: 'Month 3', months: 3 },
  { marker: 'month6', label: 'Month 6', months: 6 },
  { marker: 'year1', label: 'Year 1', months: 12 },
  { marker: 'year5', label: 'Year 5', months: 60 },
];
