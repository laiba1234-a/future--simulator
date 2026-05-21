import type { DecisionInput } from '../types';
import { detectFocus } from './decisionMapping';

const FINANCIAL_KEYWORDS = [
  'money',
  'income',
  'salary',
  'wage',
  'debt',
  'loan',
  'mortgage',
  'rent',
  'bills',
  'invest',
  'savings',
  'save',
  'wealth',
  'retire',
  'retirement',
  'financial',
  'finance',
  'budget',
  'runway',
  'profit',
  'revenue',
  'earn',
  'afford',
  'cost',
  'expensive',
  'bankrupt',
  'tuition',
  'pay',
  '$',
  '/month',
  'per month',
  'k/mo',
];

function decisionText(decision: DecisionInput): string {
  return [
    decision.decisionConsidered,
    decision.desiredOutcome,
    decision.currentSituation,
    decision.biggestFear,
    decision.existingSkills,
    decision.externalConstraints,
    decision.skillTags.join(' '),
    decision.constraintTags.join(' '),
  ]
    .join(' ')
    .toLowerCase();
}

/** True when the user's decision is primarily about money, income, or wealth outcomes */
export function isFinancialDecision(decision: DecisionInput): boolean {
  if (detectFocus(decision) === 'wealth') return true;

  const text = decisionText(decision);
  if (FINANCIAL_KEYWORDS.some((kw) => text.includes(kw))) return true;

  if (decision.annualIncome > 0 || decision.monthlySavings > 0) {
    return text.length > 0;
  }

  return false;
}
