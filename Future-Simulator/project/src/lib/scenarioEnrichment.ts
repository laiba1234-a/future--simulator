import type {
  DecisionInput,
  EnrichedScenarioCard,
  ProbabilityScores,
  ScenarioCase,
  ScenarioOutcomes,
  ScenarioTier,
  SimulationResult,
} from '../types';

export function collectFromTimeline(
  scenario: ScenarioCase,
  field: 'opportunities' | 'risks' | 'events'
): string[] {
  const items: string[] = [];
  for (const stage of scenario.timeline) {
    const list =
      field === 'opportunities'
        ? stage.opportunities
        : field === 'risks'
          ? stage.risks
          : stage.events;
    for (const item of list) {
      if (!items.includes(item)) items.push(item);
    }
  }
  return items.slice(0, 8);
}

function emotionalLine(decision: DecisionInput, tier: ScenarioTier): string {
  const state = decision.emotionalState.replace('_', ' ');
  const lines: Record<ScenarioTier, string> = {
    best: `Relief and renewed agency — ${state} feelings give way to pride as "${decision.desiredOutcome.slice(0, 60)}" materializes.`,
    average: `Mixed but manageable — ${state} at the start, then hope alternating with doubt as progress stays uneven.`,
    worst: `Grief and regret dominate — the fear of "${decision.biggestFear.slice(0, 70)}" becomes emotionally central for 12–18 months.`,
  };
  return lines[tier];
}

function finalResult(
  scenario: ScenarioCase,
  tier: ScenarioTier,
  decision: DecisionInput
): string {
  const finance = scenario.domains.find((d) => d.id === 'finance');
  const career = scenario.domains.find((d) => d.id === 'career');
  const base = scenario.bullets[0] || scenario.summary;
  if (tier === 'best') {
    return `${base} Career: ${career?.state ?? 'upward'}. Finance: ${finance?.state ?? 'stabilized'}.`;
  }
  if (tier === 'average') {
    return `${base} You reach a workable version of "${decision.desiredOutcome.slice(0, 50)}" — not perfect, not failure.`;
  }
  return `${base} Recovery requires reframing the plan and rebuilding runway before retrying.`;
}

function enrichOne(
  scenario: ScenarioCase,
  tier: ScenarioTier,
  probability: number,
  decision: DecisionInput
): EnrichedScenarioCard {
  const keyEvents = collectFromTimeline(scenario, 'events');
  const opportunities = collectFromTimeline(scenario, 'opportunities');
  const risks = collectFromTimeline(scenario, 'risks');

  const titles: Record<ScenarioTier, EnrichedScenarioCard['title']> = {
    best: 'BEST CASE SCENARIO',
    average: 'MOST LIKELY SCENARIO',
    worst: 'WORST CASE SCENARIO',
  };

  const base: EnrichedScenarioCard = {
    tier,
    title: titles[tier],
    probability,
    timeline: scenario.timeline,
    keyEvents: keyEvents.length > 0 ? keyEvents : scenario.bullets.slice(0, 5),
    emotionalOutcome: emotionalLine(decision, tier),
    finalResult: finalResult(scenario, tier, decision),
    summary: scenario.summary,
  };

  if (tier === 'best') {
    base.opportunities =
      opportunities.length > 0
        ? opportunities
        : scenario.chainReactions[0]?.cascade.slice(0, 4);
  }
  if (tier === 'average') {
    base.challenges = [
      ...risks.slice(0, 3),
      scenario.domains.find((d) => d.trajectory === 'volatile')?.state ?? '',
    ].filter(Boolean);
  }
  if (tier === 'worst') {
    base.failureTriggers = scenario.chainReactions.map((c) => c.trigger).slice(0, 4);
    base.risks = risks.length > 0 ? risks : base.failureTriggers;
    base.emotionalImpact = base.emotionalOutcome;
    base.recoveryPossibilities = [
      'Rebuild runway with stable income for 6–12 months before re-attempting',
      'Shrink scope to a minimum viable version of the original goal',
      'Use skills inventory to pivot adjacent rather than starting from zero',
      decision.relationshipsImpact !== 'minimal'
        ? 'Repair trust through transparent financial planning with key relationships'
        : 'Document lessons learned to avoid repeating the same constraint blind spots',
    ];
  }

  return base;
}

export function computeProbabilities(
  decision: DecisionInput,
  memoryBias?: { averageBoost: number; worstBoost: number }
): ProbabilityScores {
  const conf = decision.confidenceLevel;
  const risk =
    decision.riskTolerance === 'high'
      ? 1.15
      : decision.riskTolerance === 'low'
        ? 0.85
        : 1;
  const emotion =
    decision.emotionalState === 'confident' || decision.emotionalState === 'excited'
      ? 1.1
      : decision.emotionalState === 'anxious' || decision.emotionalState === 'burned_out'
        ? 0.9
        : 1;
  const finance =
    decision.financialStatus === 'comfortable'
      ? 1.08
      : decision.financialStatus === 'critical'
        ? 0.88
        : 1;

  let best = 15 + conf * 2.2 * emotion;
  let worst = 12 + (10 - conf) * 1.8 * risk;
  if (decision.financialStatus === 'critical') worst += 8;
  if (decision.financialStatus === 'comfortable') best += 6;

  best *= finance;
  worst *= risk;

  if (memoryBias) {
    worst += memoryBias.worstBoost;
    best -= memoryBias.averageBoost * 0.3;
  }

  let average = 100 - best - worst;
  if (average < 35) {
    average = 35;
    const scale = (100 - average) / (best + worst);
    best *= scale;
    worst *= scale;
  }
  if (average > 70) {
    const excess = average - 70;
    average = 70;
    best += excess * 0.55;
    worst += excess * 0.45;
  }

  const total = best + average + worst;
  return {
    best: Math.round((best / total) * 100),
    average: Math.round((average / total) * 100),
    worst: Math.round((worst / total) * 100),
  };
}

export function enrichScenarios(
  scenarios: ScenarioOutcomes,
  probabilities: ProbabilityScores,
  decision: DecisionInput
): SimulationResult['enrichedScenarios'] {
  return {
    best: enrichOne(scenarios.best, 'best', probabilities.best, decision),
    average: enrichOne(scenarios.average, 'average', probabilities.average, decision),
    worst: enrichOne(scenarios.worst, 'worst', probabilities.worst, decision),
  };
}
