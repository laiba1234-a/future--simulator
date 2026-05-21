import type {
  ComparisonRow,
  DecisionInput,
  ParallelUniverseComparison,
  ParallelUniverseInput,
  RiskLevel,
  SimulationResult,
} from '../types';
import { enrichParallelComparison } from './grokBranches';
import { formatCurrency, runSimulationAsync } from './simulation';

function shiftRisk(level: RiskLevel, dir: 'up' | 'down'): RiskLevel {
  if (dir === 'up') {
    if (level === 'low') return 'medium';
    if (level === 'medium') return 'high';
    return 'high';
  }
  if (level === 'high') return 'medium';
  if (level === 'medium') return 'low';
  return 'low';
}

function isBoldChoice(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes('quit') ||
    t.includes('leave') ||
    t.includes('start') ||
    t.includes('startup') ||
    t.includes('risk') ||
    t.includes('drop out')
  );
}

export function decisionForOption(
  base: DecisionInput,
  choice: string,
  preferHighRisk: boolean
): DecisionInput {
  const bold = preferHighRisk || isBoldChoice(choice);
  return {
    ...base,
    decisionConsidered: choice.trim() || base.decisionConsidered,
    riskTolerance: bold ? shiftRisk(base.riskTolerance, 'up') : shiftRisk(base.riskTolerance, 'down'),
    confidenceLevel: bold
      ? Math.max(3, base.confidenceLevel - 1)
      : Math.min(10, base.confidenceLevel + 1),
  };
}

function stressLabel(result: SimulationResult): string {
  const mental = result.scenarios.average.domains.find((d) => d.id === 'mentalHealth');
  const score = result.advancedAnalysis.riskProfileScore;
  if (mental?.trajectory === 'down' || score >= 65) return 'Higher stress';
  if (score <= 40) return 'Lower stress';
  return 'Moderate stress';
}

function stabilityLabel(result: SimulationResult): string {
  const score = result.advancedAnalysis.riskProfileScore;
  if (score <= 38) return 'More stable';
  if (score >= 62) return 'Less stable';
  return 'Balanced stability';
}

function buildRows(a: SimulationResult, b: SimulationResult): ComparisonRow[] {
  const rows: ComparisonRow[] = [
    {
      dimension: 'Life stability',
      optionA: stabilityLabel(a),
      optionB: stabilityLabel(b),
      lean: a.advancedAnalysis.riskProfileScore < b.advancedAnalysis.riskProfileScore ? 'a' : 'b',
    },
    {
      dimension: 'Stress & emotional load',
      optionA: stressLabel(a),
      optionB: stressLabel(b),
      lean:
        a.advancedAnalysis.riskProfileScore < b.advancedAnalysis.riskProfileScore ? 'a' : 'b',
    },
    {
      dimension: 'Most likely path',
      optionA: `${a.probabilities.average}% likely · ${formatCurrency(a.summary.endWealth.realistic)}`,
      optionB: `${b.probabilities.average}% likely · ${formatCurrency(b.summary.endWealth.realistic)}`,
      lean:
        a.summary.endWealth.realistic > b.summary.endWealth.realistic
          ? 'a'
          : b.summary.endWealth.realistic > a.summary.endWealth.realistic
            ? 'b'
            : 'neutral',
    },
    {
      dimension: 'Upside (best case)',
      optionA: `${a.probabilities.best}% · ${formatCurrency(a.summary.endWealth.optimistic)}`,
      optionB: `${b.probabilities.best}% · ${formatCurrency(b.summary.endWealth.optimistic)}`,
      lean:
        a.summary.endWealth.optimistic > b.summary.endWealth.optimistic
          ? 'a'
          : b.summary.endWealth.optimistic > a.summary.endWealth.optimistic
            ? 'b'
            : 'neutral',
    },
    {
      dimension: 'Downside (worst case)',
      optionA: `${a.probabilities.worst}% · ${formatCurrency(a.summary.endWealth.pessimistic)}`,
      optionB: `${b.probabilities.worst}% · ${formatCurrency(b.summary.endWealth.pessimistic)}`,
      lean:
        a.summary.endWealth.pessimistic > b.summary.endWealth.pessimistic
          ? 'a'
          : b.summary.endWealth.pessimistic > a.summary.endWealth.pessimistic
            ? 'b'
            : 'neutral',
    },
    {
      dimension: 'Confidence',
      optionA: `${a.summary.confidence}%`,
      optionB: `${b.summary.confidence}%`,
      lean: a.summary.confidence > b.summary.confidence ? 'a' : 'b',
    },
    {
      dimension: 'Risk profile',
      optionA: `${a.advancedAnalysis.riskProfileScore}/100`,
      optionB: `${b.advancedAnalysis.riskProfileScore}/100`,
      lean:
        a.advancedAnalysis.riskProfileScore < b.advancedAnalysis.riskProfileScore ? 'a' : 'b',
    },
  ];

  return rows;
}

function buildVerdict(
  labelA: string,
  labelB: string,
  a: SimulationResult,
  b: SimulationResult
): string {
  const stableWins = a.advancedAnalysis.riskProfileScore < b.advancedAnalysis.riskProfileScore;
  const rewardWins = b.summary.endWealth.optimistic > a.summary.endWealth.optimistic;

  if (stableWins && rewardWins) {
    return `${labelA} leans stable and lower stress; ${labelB} carries more upside and uncertainty — neither dominates every dimension.`;
  }
  if (stableWins) {
    return `${labelA} projects as the steadier universe; ${labelB} trades comfort for higher variance.`;
  }
  if (rewardWins) {
    return `${labelB} shows stronger upside potential; ${labelA} keeps more predictable outcomes.`;
  }
  return `Both universes overlap — compare worst-case wealth and stress before committing.`;
}

export async function runParallelUniverseAsync(
  base: DecisionInput,
  parallel: ParallelUniverseInput
): Promise<ParallelUniverseComparison> {
  const [resultA, resultB] = await Promise.all([
    runSimulationAsync(decisionForOption(base, parallel.optionAChoice, false)),
    runSimulationAsync(decisionForOption(base, parallel.optionBChoice, true)),
  ]);

  const comparison: ParallelUniverseComparison = {
    optionALabel: parallel.optionALabel,
    optionBLabel: parallel.optionBLabel,
    resultA,
    resultB,
    rows: buildRows(resultA, resultB),
    verdict: buildVerdict(parallel.optionALabel, parallel.optionBLabel, resultA, resultB),
  };

  return enrichParallelComparison(comparison);
}

export const DEFAULT_PARALLEL: ParallelUniverseInput = {
  optionALabel: 'Option A',
  optionAChoice: '',
  optionBLabel: 'Option B',
  optionBChoice: '',
};
