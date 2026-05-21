import type { DecisionInput, SimulationInput, SimulationResult, YearSnapshot } from '../types';
import { buildAdvancedAnalysis } from './aiAnalysis';
import { decisionToSimulation, DEFAULT_DECISION } from './decisionMapping';
import { generateScenarioOutcomes } from './consequenceEngine';
import { enrichSimulationWithGrok } from './grokEnrichment';
import { getMemoryContextForDecision } from './memoryStore';
import { computeProbabilities, enrichScenarios } from './scenarioEnrichment';

const RISK_VOLATILITY: Record<SimulationInput['riskLevel'], number> = {
  low: 0.04,
  medium: 0.09,
  high: 0.16,
};

const FOCUS_WEIGHTS: Record<
  SimulationInput['focus'],
  { returnBoost: number; incomeGrowth: number }
> = {
  wealth: { returnBoost: 0.015, incomeGrowth: 0.02 },
  career: { returnBoost: 0.005, incomeGrowth: 0.045 },
  balanced: { returnBoost: 0.01, incomeGrowth: 0.03 },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function milestoneForYear(
  year: number,
  age: number,
  wealth: number,
  _focus: SimulationInput['focus'],
  lifeEvent: string
): string | undefined {
  if (year === 0 && lifeEvent.trim()) {
    return `Starting point: ${lifeEvent.trim().slice(0, 80)}`;
  }
  if (year === 1) return `Year 1 checkpoint — age ${age}`;
  if (year === 5) return `Year 5 horizon — age ${age}`;
  if (wealth >= 1_000_000 && year > 0) return `Age ${age}: ${formatCurrency(wealth)} net worth`;
  return undefined;
}

export function runSimulation(decision: DecisionInput): SimulationResult {
  const input = decisionToSimulation(decision);
  const volatility = RISK_VOLATILITY[input.riskLevel];
  const focus = FOCUS_WEIGHTS[input.focus];
  const annualSavings = input.monthlySavings * 12;
  const savingsRate =
    input.annualIncome > 0 ? annualSavings / input.annualIncome : 0;

  const baseReturn = input.investmentReturn / 100 + focus.returnBoost;
  const incomeGrowth = focus.incomeGrowth;
  const inflation = input.inflation / 100;

  let income = input.annualIncome;
  let opt = Math.max(annualSavings * 2, 5_000);
  let real = Math.max(annualSavings, 2_000);
  let pess = Math.max(annualSavings * 0.5, 500);

  const snapshots: YearSnapshot[] = [];

  for (let year = 0; year <= input.yearsAhead; year++) {
    const age = input.currentAge + year;

    if (year > 0) {
      income *= 1 + incomeGrowth - inflation * 0.35;
      const contribution = Math.min(annualSavings, income * 0.45) * (1 + year * 0.01);

      opt = opt * (1 + baseReturn + volatility) + contribution * 1.15;
      real = real * (1 + baseReturn) + contribution;
      pess = pess * (1 + baseReturn - volatility * 0.85) + contribution * 0.75;
    }

    snapshots.push({
      year,
      age,
      optimistic: Math.round(opt),
      realistic: Math.round(real),
      pessimistic: Math.round(pess),
      milestone: milestoneForYear(year, age, real, input.focus, input.lifeEvent),
    });
  }

  const last = snapshots[snapshots.length - 1];
  const confidence = Math.min(
    95,
    Math.round(
      decision.confidenceLevel * 6 +
        savingsRate * 80 -
        volatility * 90 +
        (decision.financialStatus === 'comfortable' ? 12 : decision.financialStatus === 'critical' ? -15 : 0)
    )
  );

  const endWealth = {
    optimistic: last.optimistic,
    realistic: last.realistic,
    pessimistic: last.pessimistic,
  };

  const insights: string[] = [
    `Timeline modeled at Month 1 → Year 5 for best, average, and worst cases.`,
    `Confidence ${confidence}% — emotional state (${decision.emotionalState.replace('_', ' ')}) and ${decision.confidenceLevel}/10 self-rating factored in.`,
    `Average wealth: ${formatCurrency(last.realistic)} by year ${input.yearsAhead}.`,
    decision.relationshipsImpact === 'critical' || decision.relationshipsImpact === 'significant'
      ? 'Relationship impact is high — several stages show family/partner consequences.'
      : 'Relationship impact is moderate — social domains shift slower than finance.',
  ];

  if (decision.biggestFear.trim()) {
    insights.unshift(`Worst-case timeline stress-tests your fear: "${decision.biggestFear.trim().slice(0, 100)}${decision.biggestFear.length > 100 ? '…' : ''}"`);
  }

  const headline = `Three futures for: ${decision.decisionConsidered.slice(0, 70)}${decision.decisionConsidered.length > 70 ? '…' : ''}`;

  const memoryCtx = getMemoryContextForDecision(decision);
  const memoryBias = memoryCtx.isRepeatDecision
    ? { averageBoost: 4, worstBoost: 3 }
    : undefined;
  const probabilities = computeProbabilities(decision, memoryBias);
  const scenarios = generateScenarioOutcomes(decision, input, endWealth);
  const enrichedScenarios = enrichScenarios(scenarios, probabilities, decision);

  if (memoryCtx.referencesUsed.length > 0) {
    insights.unshift(memoryCtx.referencesUsed[0]);
  }

  const advancedAnalysis = buildAdvancedAnalysis(
    decision,
    input,
    scenarios,
    probabilities,
    endWealth,
    memoryCtx,
    confidence
  );

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    decision,
    input,
    snapshots,
    scenarios,
    probabilities,
    enrichedScenarios,
    advancedAnalysis,
    memoryContext: {
      referencesUsed: memoryCtx.referencesUsed,
      isRepeatDecision: memoryCtx.isRepeatDecision,
      priorSimulationCount: memoryCtx.priorSimulationCount,
    },
    summary: {
      endWealth,
      savingsRate,
      confidence,
      headline,
      insights,
      aiSource: 'template',
    },
  };
}

/** Runs the numeric model, then enriches narratives with Grok when configured */
export async function runSimulationAsync(decision: DecisionInput): Promise<SimulationResult> {
  const base = runSimulation(decision);
  return enrichSimulationWithGrok(base);
}

export const DEFAULT_INPUT = DEFAULT_DECISION;

export { formatCurrency };
