import type {
  FutureTreeNode,
  ParallelUniverseComparison,
  ScenarioTier,
  SimulationResult,
} from '../types';

export function parseDecisionFork(text: string): [string, string] | null {
  const trimmed = text.trim();
  const vs = trimmed.split(/\s+vs\.?\s+/i);
  if (vs.length === 2 && vs[0] && vs[1]) {
    return [vs[0].trim(), vs[1].trim()];
  }
  const or = trimmed.split(/\s+or\s+/i);
  if (or.length === 2 && or[0] && or[1]) {
    return [or[0].trim(), or[1].trim()];
  }
  return null;
}

function leafOutcomes(result: SimulationResult, tier: ScenarioTier): string[] {
  const scenario = result.scenarios[tier];
  const fromDomains = scenario.domains
    .slice(0, 3)
    .map((d) => d.state.slice(0, 72) + (d.state.length > 72 ? '…' : ''));
  const fromChains = scenario.chainReactions[0]?.cascade.slice(0, 2) ?? [];
  const bullets = scenario.bullets.slice(0, 2);
  const merged = [...fromDomains, ...fromChains, ...bullets].filter(Boolean);
  return merged.length > 0 ? merged.slice(0, 3) : [scenario.summary.slice(0, 90)];
}

function pathChildren(result: SimulationResult, glow: boolean): FutureTreeNode[] {
  const tiers: { tier: ScenarioTier; label: string }[] = [
    { tier: 'best', label: 'Best path' },
    { tier: 'average', label: 'Likely path' },
    { tier: 'worst', label: 'Worst path' },
  ];

  return tiers.flatMap(({ tier, label }) => {
    const leaves = leafOutcomes(result, tier);
    const parent: FutureTreeNode = {
      id: `${result.id}-${tier}`,
      label,
      probability: result.probabilities[tier],
      tier,
      glow: tier === 'average' && glow,
      children: leaves.map((leaf, i) => ({
        id: `${result.id}-${tier}-${i}`,
        label: leaf,
        tier,
      })),
    };
    return [parent];
  });
}

function branchFromResult(
  id: string,
  label: string,
  result: SimulationResult,
  glow: boolean
): FutureTreeNode {
  const short =
    label.length > 48 ? `${label.slice(0, 48)}…` : label;
  return {
    id,
    label: short,
    subtitle: `${result.probabilities.average}% most likely`,
    glow,
    children: pathChildren(result, glow),
  };
}

export function buildFutureTreeFromResult(result: SimulationResult): FutureTreeNode {
  const fork = parseDecisionFork(result.decision.decisionConsidered);

  if (fork) {
    return {
      id: 'root',
      label: 'Your crossroads',
      subtitle: 'Two futures branch from here',
      glow: true,
      children: [
        branchFromResult('fork-a', fork[0], result, false),
        branchFromResult('fork-b', fork[1], result, true),
      ],
    };
  }

  return {
    id: 'root',
    label: result.decision.decisionConsidered.slice(0, 56) || 'Your decision',
    subtitle: result.scenarios.pathLabel,
    glow: true,
    children: [
      {
        id: 'tier-best',
        label: 'Best case universe',
        probability: result.probabilities.best,
        tier: 'best',
        children: leafOutcomes(result, 'best').map((l, i) => ({
          id: `best-${i}`,
          label: l,
          tier: 'best',
        })),
      },
      {
        id: 'tier-avg',
        label: 'Most likely universe',
        probability: result.probabilities.average,
        tier: 'average',
        glow: true,
        children: leafOutcomes(result, 'average').map((l, i) => ({
          id: `avg-${i}`,
          label: l,
          tier: 'average',
        })),
      },
      {
        id: 'tier-worst',
        label: 'Worst case universe',
        probability: result.probabilities.worst,
        tier: 'worst',
        children: leafOutcomes(result, 'worst').map((l, i) => ({
          id: `worst-${i}`,
          label: l,
          tier: 'worst',
        })),
      },
    ],
  };
}

export function buildParallelFutureTree(
  comparison: ParallelUniverseComparison
): FutureTreeNode {
  return {
    id: 'parallel-root',
    label: 'Parallel universes',
    subtitle: comparison.verdict.slice(0, 100),
    glow: true,
    children: [
      branchFromResult(
        'uni-a',
        comparison.optionALabel,
        comparison.resultA,
        false
      ),
      branchFromResult(
        'uni-b',
        comparison.optionBLabel,
        comparison.resultB,
        true
      ),
    ],
  };
}
