import type {
  AdvancedAIAnalysis,
  DecisionInput,
  EmotionalTrajectoryPoint,
  OutcomeDriver,
  ProbabilityScores,
  ScenarioBranch,
  ScenarioOutcomes,
  SimulationInput,
  UserMemoryStore,
} from '../types';
import { formatCurrency } from './simulation';

interface MemoryContext {
  referencesUsed: string[];
  store: UserMemoryStore;
  isRepeatDecision: boolean;
  priorSimulationCount: number;
}

const EMOTIONAL_WEIGHT: Record<DecisionInput['emotionalState'], number> = {
  excited: 0.85,
  hopeful: 0.75,
  confident: 0.7,
  uncertain: 0.5,
  anxious: 0.35,
  burned_out: 0.25,
};

function riskScore(decision: DecisionInput, input: SimulationInput): number {
  const base =
    decision.riskTolerance === 'high'
      ? 72
      : decision.riskTolerance === 'low'
        ? 28
        : 50;
  const confAdj = (10 - decision.confidenceLevel) * 2.5;
  const savings =
    input.annualIncome > 0
      ? ((input.monthlySavings * 12) / input.annualIncome) * 40
      : 10;
  const rel =
    decision.relationshipsImpact === 'critical'
      ? 18
      : decision.relationshipsImpact === 'significant'
        ? 12
        : decision.relationshipsImpact === 'moderate'
          ? 6
          : 0;
  const fin =
    decision.financialStatus === 'critical'
      ? 15
      : decision.financialStatus === 'tight'
        ? 8
        : 0;
  return Math.min(98, Math.max(8, Math.round(base + confAdj - savings * 0.35 + rel + fin)));
}

function riskLabel(score: number): string {
  if (score >= 75) return 'Aggressive — high variance, thin margin for error';
  if (score >= 55) return 'Moderate-high — reward possible but shocks hurt';
  if (score >= 35) return 'Balanced — risk and buffer roughly matched';
  return 'Conservative — outcomes cluster unless external shock';
}

function buildPersonality(
  decision: DecisionInput,
  memory: UserMemoryStore
): AdvancedAIAnalysis['personalityProfile'] {
  const traits: string[] = [];
  if (decision.confidenceLevel >= 7) traits.push('Self-assured under ambiguity');
  else if (decision.confidenceLevel <= 4) traits.push('Self-doubt under pressure');
  if (decision.riskTolerance === 'high') traits.push('Opportunity-seeking');
  if (decision.riskTolerance === 'low') traits.push('Loss-averse');
  if (EMOTIONAL_WEIGHT[decision.emotionalState] < 0.5) traits.push('Emotionally activated');
  if (decision.relationshipsImpact === 'significant' || decision.relationshipsImpact === 'critical') {
    traits.push('Social stakes weigh heavily');
  }

  const patterns: string[] = [];
  if (memory.profile.personalitySignals.decisionThemes.length > 0) {
    patterns.push(
      `Recurring themes: ${memory.profile.personalitySignals.decisionThemes.slice(0, 3).join(', ')}`
    );
  }
  if (memory.profile.riskBehavior.simulationsCount >= 2) {
    patterns.push(
      `Avg confidence across runs: ${memory.profile.riskBehavior.confidenceTrend}/10 · typical risk: ${memory.profile.riskBehavior.averageTolerance}`
    );
  }
  const dominant = memory.profile.historicalOutcomes.sort((a, b) => b.count - a.count)[0];
  if (dominant) {
    patterns.push(`Past simulations most often peaked in the ${dominant.tier} probability band`);
  }

  return {
    traits: traits.length > 0 ? traits : ['Still calibrating — first simulation on file'],
    patterns,
    summary: `You approach "${decision.decisionConsidered.slice(0, 55)}…" as someone who is ${decision.emotionalState.replace('_', ' ')} with ${decision.riskTolerance} risk appetite — strategy should match that emotional bandwidth, not generic optimism.`,
  };
}

function buildTrajectory(decision: DecisionInput): EmotionalTrajectoryPoint[] {
  return [
    {
      phase: 'Month 1',
      emotion: decision.emotionalState.replace('_', ' '),
      driver: 'Decision uncertainty — highest cortisol before feedback loops start',
    },
    {
      phase: 'Month 3–6',
      emotion: decision.confidenceLevel >= 6 ? 'cautious optimism' : 'doubt spikes',
      driver: 'Early signals either validate or contradict the narrative you told yourself',
    },
    {
      phase: 'Year 1',
      emotion: 'identity shift',
      driver: `Whether "${decision.desiredOutcome.slice(0, 50)}" feels real or like a story you defend`,
    },
    {
      phase: 'Year 5',
      emotion: 'integration or grief',
      driver: 'Compound effects of runway, relationships, and reputation — not effort alone',
    },
  ];
}

function buildBranches(
  scenarios: ScenarioOutcomes,
  probs: ProbabilityScores
): ScenarioBranch[] {
  const chains = scenarios.average.chainReactions;
  const branches: ScenarioBranch[] = [
    {
      id: 'main-best',
      label: 'Early traction path',
      probability: Math.round(probs.best * 0.6),
      outcome: scenarios.best.bullets[0] ?? scenarios.best.summary,
      parentTier: 'best',
    },
    {
      id: 'main-avg',
      label: 'Friction plateau path',
      probability: probs.average,
      outcome: scenarios.average.summary,
      parentTier: 'average',
    },
    {
      id: 'main-worst',
      label: 'Runway collapse path',
      probability: Math.round(probs.worst * 0.55),
      outcome: scenarios.worst.bullets[0] ?? scenarios.worst.summary,
      parentTier: 'worst',
    },
  ];
  if (chains[0]) {
    branches.push({
      id: 'branch-mid',
      label: `Pivot after: ${chains[0].trigger.slice(0, 50)}`,
      probability: Math.max(8, Math.round(probs.average * 0.25)),
      outcome: chains[0].cascade[chains[0].cascade.length - 1] ?? 'Partial recovery',
      parentTier: 'average',
    });
  }
  return branches;
}

function buildOutcomeDrivers(
  decision: DecisionInput,
  input: SimulationInput,
  probs: ProbabilityScores
): OutcomeDriver[] {
  const savingsRate =
    input.annualIncome > 0
      ? Math.round(((input.monthlySavings * 12) / input.annualIncome) * 100)
      : 0;

  return [
    {
      factor: 'Confidence & emotional state',
      impact: decision.confidenceLevel >= 6 ? 'positive' : 'negative',
      explanation: `${decision.confidenceLevel}/10 confidence with ${decision.emotionalState.replace('_', ' ')} shifts best-case probability to ${probs.best}%.`,
    },
    {
      factor: 'Financial runway',
      impact:
        decision.financialStatus === 'comfortable' || decision.financialStatus === 'stable'
          ? 'positive'
          : 'negative',
      explanation: `${decision.financialStatus} status · ~${savingsRate}% savings rate — determines how long you can absorb a J-curve.`,
    },
    {
      factor: 'Risk tolerance vs. plan ambition',
      impact: decision.riskTolerance === 'high' ? 'neutral' : 'positive',
      explanation: `${decision.riskTolerance} risk on a ${input.yearsAhead}-year horizon — misalignment here is a common failure trigger.`,
    },
    {
      factor: 'Relationships load',
      impact:
        decision.relationshipsImpact === 'critical' || decision.relationshipsImpact === 'significant'
          ? 'negative'
          : 'positive',
      explanation: `${decision.relationshipsImpact} impact — social domains amplify financial stress or buffer it.`,
    },
    {
      factor: 'Constraints & skills fit',
      impact: decision.constraintTags.length > 2 ? 'negative' : 'neutral',
      explanation: `${decision.skillTags.slice(0, 3).join(', ') || 'skills'} vs ${decision.constraintTags.length} constraints — execution speed depends on this gap.`,
    },
  ];
}

function buildStrategicAdvice(
  decision: DecisionInput,
  probs: ProbabilityScores,
  memory: MemoryContext
): string[] {
  const advice: string[] = [];

  if (probs.worst >= 25) {
    advice.push(
      `Worst case at ${probs.worst}% — pre-commit a runway floor (months of expenses) before irreversible exits.`
    );
  }
  if (decision.confidenceLevel < 5 && probs.average >= 55) {
    advice.push(
      'Your model is average-heavy while confidence is low — run a 90-day proof phase before burning bridges.'
    );
  }
  if (decision.relationshipsImpact === 'significant' || decision.relationshipsImpact === 'critical') {
    advice.push(
      'Schedule explicit money-and-time conversations at month 1 and month 6 — silent stress is a top cascade trigger.'
    );
  }
  if (decision.biggestFear.trim()) {
    advice.push(
      `Design one metric that falsifies the fear ("${decision.biggestFear.slice(0, 60)}…") by month 6 — without it, anxiety drives bad trades.`
    );
  }
  if (memory.isRepeatDecision) {
    advice.push(
      'You have simulated a similar fork before — compare what inputs changed; do not treat this as a fresh dice roll.'
    );
  }
  if (decision.riskTolerance === 'high' && decision.financialStatus === 'tight') {
    advice.push(
      'High risk tolerance with tight finances is a dangerous combo — separate appetite from capacity.'
    );
  }

  return advice.slice(0, 6);
}

function whatChangedOutcome(
  decision: DecisionInput,
  memory: MemoryContext,
  probs: ProbabilityScores
): string {
  const parts: string[] = [];
  parts.push(
    `Confidence (${decision.confidenceLevel}/10) and ${decision.riskTolerance} risk shifted the distribution to ${probs.best}% / ${probs.average}% / ${probs.worst}%.`
  );
  if (decision.financialStatus === 'critical' || decision.financialStatus === 'tight') {
    parts.push('Thin finances expanded the worst-case band — runway math dominates talent.');
  }
  if (memory.priorSimulationCount > 0) {
    parts.push(
      `Compared to your ${memory.priorSimulationCount} prior run(s), ${memory.isRepeatDecision ? 'this repeats a theme' : 'this is a new fork'} — memory adjusted probabilities slightly.`
    );
  }
  parts.push(
    `If you raised confidence by 2 points and added 3 months runway, average-case probability would likely gain ~5–8 points at the expense of worst-case.`
  );
  return parts.join(' ');
}

export function buildAdvancedAnalysis(
  decision: DecisionInput,
  input: SimulationInput,
  scenarios: ScenarioOutcomes,
  probabilities: ProbabilityScores,
  endWealth: { optimistic: number; realistic: number; pessimistic: number },
  memoryContext: MemoryContext,
  summaryConfidence: number
): AdvancedAIAnalysis {
  const score = riskScore(decision, input);
  const memory = memoryContext.store;

  const relationshipImpact =
    decision.relationshipsImpact === 'critical'
      ? 'High risk of conflict or withdrawal from key people if income stays volatile past month 9.'
      : decision.relationshipsImpact === 'significant'
        ? 'Partners/family feel the stress in months 3–12; repair is likely if income proof arrives.'
        : 'Social graph shifts slowly — relationships are not the primary bottleneck.';

  const financialProjection = `By horizon year ${input.yearsAhead}: best ${formatCurrency(endWealth.optimistic)}, most likely ${formatCurrency(endWealth.realistic)}, worst ${formatCurrency(endWealth.pessimistic)} — savings discipline matters more than return assumptions early on.`;

  const careerTrajectory =
    input.focus === 'career'
      ? `Career path: "${scenarios.pathLabel}" — reputation lags income by ~6 months then compounds.`
      : `Adjacent career effects under "${scenarios.pathLabel}" — skills (${decision.skillTags.slice(0, 2).join(', ') || 'listed'}) transfer even if the primary bet is not a job change.`;

  const lifeMapInsight = memory.profile.longTermGoals[0]
    ? `This decision ${decision.desiredOutcome.includes(memory.profile.longTermGoals[0].slice(0, 30)) ? 'aligns with' : 'diverges from'} your stored goal: "${memory.profile.longTermGoals[0].slice(0, 80)}…"`
    : `First long-term goal captured from this run — future simulations will map against "${decision.desiredOutcome.slice(0, 80)}…"`;

  return {
    personalityProfile: buildPersonality(decision, memory),
    riskProfileScore: score,
    riskLabel: riskLabel(score),
    confidenceEstimate: summaryConfidence,
    strategicAdvice: buildStrategicAdvice(decision, probabilities, memoryContext),
    emotionalTrajectory: buildTrajectory(decision),
    scenarioBranches: buildBranches(scenarios, probabilities),
    outcomeDrivers: buildOutcomeDrivers(decision, input, probabilities),
    memoryReferences: memoryContext.referencesUsed,
    relationshipImpact,
    financialProjection,
    careerTrajectory,
    lifeMapInsight,
    whatChangedOutcome: whatChangedOutcome(decision, memoryContext, probabilities),
  };
}
