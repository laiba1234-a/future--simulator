import type { DecisionInput, ScenarioFocus, SimulationInput } from '../types';

const TIMEFRAME_YEARS: Record<DecisionInput['timeframe'], number> = {
  '6months': 1,
  '1year': 1,
  '3years': 3,
  '5years': 5,
  '10years': 10,
};

const FINANCIAL_DEFAULTS: Record<
  DecisionInput['financialStatus'],
  { income: number; savings: number }
> = {
  comfortable: { income: 95_000, savings: 1_400 },
  stable: { income: 65_000, savings: 700 },
  tight: { income: 42_000, savings: 250 },
  critical: { income: 28_000, savings: 80 },
};

export const DEFAULT_DECISION: DecisionInput = {
  currentSituation: '',
  decisionConsidered: '',
  desiredOutcome: '',
  biggestFear: '',
  financialStatus: 'stable',
  emotionalState: 'uncertain',
  confidenceLevel: 5,
  timeframe: '3years',
  riskTolerance: 'medium',
  relationshipsImpact: 'moderate',
  existingSkills: '',
  externalConstraints: '',
  skillTags: [],
  constraintTags: [],
  currentAge: 28,
  annualIncome: 0,
  monthlySavings: 0,
};

export function detectFocus(decision: DecisionInput): ScenarioFocus {
  const text = `${decision.decisionConsidered} ${decision.desiredOutcome}`.toLowerCase();
  if (
    text.includes('invest') ||
    text.includes('save') ||
    text.includes('wealth') ||
    text.includes('retire')
  ) {
    return 'wealth';
  }
  if (
    text.includes('degree') ||
    text.includes('job') ||
    text.includes('career') ||
    text.includes('promot') ||
    text.includes('engineer')
  ) {
    return 'career';
  }
  return 'balanced';
}

export function decisionToSimulation(decision: DecisionInput): SimulationInput {
  const fin = FINANCIAL_DEFAULTS[decision.financialStatus];
  const years = TIMEFRAME_YEARS[decision.timeframe];

  return {
    currentAge: decision.currentAge,
    yearsAhead: Math.max(years, 5),
    annualIncome: decision.annualIncome || fin.income,
    monthlySavings: decision.monthlySavings || fin.savings,
    investmentReturn: 7,
    inflation: 3,
    riskLevel: decision.riskTolerance,
    focus: detectFocus(decision),
    lifeEvent: decision.decisionConsidered.trim(),
  };
}

export function buildDecisionLabel(decision: DecisionInput): string {
  const short =
    decision.decisionConsidered.length > 48
      ? `${decision.decisionConsidered.slice(0, 48)}…`
      : decision.decisionConsidered;
  return `${short} · ${decision.timeframe}`;
}
