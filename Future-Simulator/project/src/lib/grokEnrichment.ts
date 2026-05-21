import type {
  AdvancedAIAnalysis,
  ChainReaction,
  DomainOutcome,
  DomainTrajectory,
  EnrichedScenarioCard,
  LifeDomain,
  OutcomeDriver,
  ScenarioBranch,
  ScenarioCase,
  ScenarioOutcomes,
  ScenarioTier,
  SimulationResult,
  TimelineMarker,
  TimelineStage,
} from '../types';
import { enrichBranchesAndTree } from './grokBranches';
import { collectFromTimeline, enrichScenarios } from './scenarioEnrichment';
import { formatCurrency } from './simulation';
import { grokChatCompletion, isGrokConfigured, parseGrokJson } from './grok';

const TIMELINE_MARKERS: TimelineMarker[] = [
  'month1',
  'month3',
  'month6',
  'year1',
  'year5',
];

interface GrokTimelineStage {
  marker: TimelineMarker;
  events: string[];
  consequences: string[];
  emotionalChanges: string[];
  opportunities: string[];
  risks: string[];
}

interface GrokDomainPatch {
  id: LifeDomain;
  state: string;
  why: string;
  trajectory?: DomainTrajectory;
}

interface GrokChainPatch {
  trigger: string;
  cascade: string[];
  why: string;
}

interface GrokScenarioFull {
  summary: string;
  bullets: string[];
  timeline: GrokTimelineStage[];
  domains: GrokDomainPatch[];
  chainReactions: GrokChainPatch[];
  emotionalOutcome: string;
  finalResult: string;
  opportunities?: string[];
  challenges?: string[];
  risks?: string[];
  recoveryPossibilities?: string[];
}

export interface GrokSimulationNarrative {
  pathLabel: string;
  drivingFactors: string[];
  headline: string;
  insights: string[];
  personalitySummary: string;
  personalityTraits: string[];
  strategicAdvice: string[];
  relationshipImpact: string;
  financialProjection: string;
  careerTrajectory: string;
  lifeMapInsight: string;
  whatChangedOutcome: string;
  emotionalTrajectory: { phase: string; emotion: string; driver: string }[];
  outcomeDrivers: OutcomeDriver[];
  scenarioBranches: { id: string; label: string; outcome: string }[];
  scenarios: {
    best: GrokScenarioFull;
    average: GrokScenarioFull;
    worst: GrokScenarioFull;
  };
}

function timelineSeed(result: SimulationResult, tier: ScenarioTier): string {
  const scenario = result.scenarios[tier];
  return scenario.timeline
    .map(
      (s) =>
        `${s.label}: events=${s.events.slice(0, 2).join('; ')} | fear hook=${s.emotionalChanges[0] ?? ''}`
    )
    .join('\n');
}

function buildPrompt(result: SimulationResult): string {
  const { decision, input, probabilities, summary, scenarios } = result;
  const wealth = summary.endWealth;

  return `You are Grok inside "Future Simulator". Replace ALL template scaffolding with content personalized to THIS user's decision.
CRITICAL: Use their exact situation, skills, fears, and goals. Do NOT reuse generic YouTube/degree examples unless the user actually mentioned them.
If they mention Python, video editing, SEO, pausing a degree, etc. — weave those in explicitly.

Return ONLY valid JSON with this shape:
{
  "pathLabel": string,
  "drivingFactors": string[5-7],
  "headline": string,
  "insights": string[3-5],
  "personalitySummary": string,
  "personalityTraits": string[3-5],
  "strategicAdvice": string[4-6],
  "relationshipImpact": string,
  "financialProjection": string,
  "careerTrajectory": string,
  "lifeMapInsight": string,
  "whatChangedOutcome": string,
  "emotionalTrajectory": [{ "phase": string, "emotion": string, "driver": string }] (4 items),
  "outcomeDrivers": [{ "factor": string, "impact": "positive"|"negative"|"neutral", "explanation": string }] (5 items),
  "scenarioBranches": [{ "id": string, "label": string, "outcome": string }] (3-4 items, ids: main-best, main-avg, main-worst, optional branch-mid),
  "scenarios": {
    "best"|"average"|"worst": {
      "summary": string,
      "bullets": string[4],
      "timeline": [
        { "marker": "month1"|"month3"|"month6"|"year1"|"year5",
          "events": string[2-4], "consequences": string[2-3], "emotionalChanges": string[2-3],
          "opportunities": string[2-3], "risks": string[2-3] }
      ] (exactly 5 markers each),
      "domains": [
        { "id": "time"|"relationships"|"career"|"finance"|"mentalHealth"|"education"|"reputation"|"opportunities"|"riskFactors"|"emotionalEffects",
          "state": string, "why": string, "trajectory": "up"|"steady"|"down"|"volatile" }
      ] (all 10 ids),
      "chainReactions": [{ "trigger": string, "cascade": string[2-4], "why": string }] (2-3 items),
      "emotionalOutcome": string,
      "finalResult": string,
      "opportunities"?: string[3-5] (best only),
      "challenges"?: string[3-5] (average only),
      "risks"?: string[3-5], "recoveryPossibilities"?: string[3-4] (worst only)
    }
  }
}

USER INPUTS:
- Situation: ${decision.currentSituation}
- Decision: ${decision.decisionConsidered}
- Desired outcome: ${decision.desiredOutcome}
- Biggest fear: ${decision.biggestFear}
- Financial status: ${decision.financialStatus}
- Emotional state: ${decision.emotionalState}
- Confidence: ${decision.confidenceLevel}/10
- Timeframe: ${decision.timeframe}
- Risk tolerance: ${decision.riskTolerance}
- Relationships impact: ${decision.relationshipsImpact}
- Skills: ${decision.skillTags.join(', ') || decision.existingSkills}
- Constraints: ${decision.constraintTags.join(', ') || decision.externalConstraints}
- Age: ${decision.currentAge} · Income: ${formatCurrency(decision.annualIncome)} · Savings/mo: ${formatCurrency(decision.monthlySavings)}

NUMERIC MODEL (do not contradict):
- Probabilities: best ${probabilities.best}%, average ${probabilities.average}%, worst ${probabilities.worst}%
- Wealth year ${input.yearsAhead}: best ${formatCurrency(wealth.optimistic)}, likely ${formatCurrency(wealth.realistic)}, worst ${formatCurrency(wealth.pessimistic)}
- Template path label: ${scenarios.pathLabel}
${result.memoryContext.referencesUsed.length > 0 ? `- Prior runs: ${result.memoryContext.referencesUsed.join('; ')}` : ''}

TEMPLATE TIMELINES TO REPLACE (do not copy wording — personalize):
BEST:\n${timelineSeed(result, 'best')}
AVERAGE:\n${timelineSeed(result, 'average')}
WORST:\n${timelineSeed(result, 'worst')}`;
}

function mergeTimeline(
  template: TimelineStage[],
  grokStages: GrokTimelineStage[] | undefined
): TimelineStage[] {
  if (!grokStages?.length) return template;

  const byMarker = new Map<TimelineMarker, GrokTimelineStage>();
  for (const stage of grokStages) {
    if (TIMELINE_MARKERS.includes(stage.marker)) {
      byMarker.set(stage.marker, stage);
    }
  }

  return template.map((t) => {
    const g = byMarker.get(t.marker);
    if (!g) return t;
    return {
      marker: t.marker,
      label: t.label,
      events: g.events?.length ? g.events : t.events,
      consequences: g.consequences?.length ? g.consequences : t.consequences,
      emotionalChanges: g.emotionalChanges?.length ? g.emotionalChanges : t.emotionalChanges,
      opportunities: g.opportunities?.length ? g.opportunities : t.opportunities,
      risks: g.risks?.length ? g.risks : t.risks,
    };
  });
}

function mergeDomains(
  template: DomainOutcome[],
  patches: GrokDomainPatch[] | undefined
): DomainOutcome[] {
  if (!patches?.length) return template;

  const byId = new Map(patches.map((d) => [d.id, d]));
  return template.map((d) => {
    const g = byId.get(d.id);
    if (!g) return d;
    const trajectory = g.trajectory ?? d.trajectory;
    return {
      ...d,
      state: g.state?.trim() ? g.state : d.state,
      why: g.why?.trim() ? g.why : d.why,
      trajectory,
    };
  });
}

function mergeChains(
  template: ChainReaction[],
  patches: GrokChainPatch[] | undefined
): ChainReaction[] {
  if (!patches?.length) return template;
  return patches.map((p, i) => ({
    trigger: p.trigger || template[i]?.trigger || 'Trigger',
    cascade: p.cascade?.length ? p.cascade : template[i]?.cascade ?? [],
    why: p.why || template[i]?.why || '',
  }));
}

function applyScenarioCase(
  template: ScenarioCase,
  grok: GrokScenarioFull | undefined
): ScenarioCase {
  if (!grok) return template;

  const timeline = mergeTimeline(template.timeline, grok.timeline);
  const domains = mergeDomains(template.domains, grok.domains);
  const chainReactions = mergeChains(template.chainReactions, grok.chainReactions);

  return {
    ...template,
    summary: grok.summary?.trim() ? grok.summary : template.summary,
    timeline,
    domains,
    chainReactions,
    bullets: grok.bullets?.length ? grok.bullets : template.bullets,
  };
}

function mergeScenarioCard(
  card: EnrichedScenarioCard,
  grok: GrokScenarioFull | undefined,
  tier: ScenarioTier,
  scenario: ScenarioCase
): EnrichedScenarioCard {
  if (!grok) {
    return { ...card, timeline: scenario.timeline };
  }

  const merged: EnrichedScenarioCard = {
    ...card,
    timeline: scenario.timeline,
    summary: grok.summary || card.summary,
    emotionalOutcome: grok.emotionalOutcome || card.emotionalOutcome,
    finalResult: grok.finalResult || card.finalResult,
    keyEvents: collectFromTimeline(scenario, 'events'),
  };

  if (tier === 'best') {
    merged.opportunities =
      grok.opportunities?.length
        ? grok.opportunities
        : collectFromTimeline(scenario, 'opportunities');
  }
  if (tier === 'average') {
    merged.challenges =
      grok.challenges?.length ? grok.challenges : collectFromTimeline(scenario, 'risks');
  }
  if (tier === 'worst') {
    if (grok.risks?.length) merged.risks = grok.risks;
    if (grok.recoveryPossibilities?.length) {
      merged.recoveryPossibilities = grok.recoveryPossibilities;
    }
    merged.emotionalImpact = grok.emotionalOutcome || card.emotionalImpact;
    merged.failureTriggers = scenario.chainReactions.map((c) => c.trigger).slice(0, 4);
  }

  return merged;
}

function mergeBranches(
  template: ScenarioBranch[],
  patches: GrokSimulationNarrative['scenarioBranches'] | undefined
): ScenarioBranch[] {
  if (!patches?.length) return template;

  const byId = new Map(patches.map((b) => [b.id, b]));
  return template.map((b) => {
    const g = byId.get(b.id);
    if (!g) return b;
    return {
      ...b,
      label: g.label?.trim() ? g.label : b.label,
      outcome: g.outcome?.trim() ? g.outcome : b.outcome,
    };
  });
}

function mergeOutcomeDrivers(
  template: OutcomeDriver[],
  patches: OutcomeDriver[] | undefined
): OutcomeDriver[] {
  if (!patches?.length) return template;
  return patches.map((p, i) => ({
    factor: p.factor || template[i]?.factor || 'Factor',
    impact: p.impact ?? template[i]?.impact ?? 'neutral',
    explanation: p.explanation || template[i]?.explanation || '',
  }));
}

function applyNarrative(
  result: SimulationResult,
  narrative: GrokSimulationNarrative
): SimulationResult {
  const scenarios: ScenarioOutcomes = {
    pathLabel: narrative.pathLabel?.trim() ? narrative.pathLabel : result.scenarios.pathLabel,
    drivingFactors:
      narrative.drivingFactors?.length > 0
        ? narrative.drivingFactors
        : result.scenarios.drivingFactors,
    best: applyScenarioCase(result.scenarios.best, narrative.scenarios.best),
    average: applyScenarioCase(result.scenarios.average, narrative.scenarios.average),
    worst: applyScenarioCase(result.scenarios.worst, narrative.scenarios.worst),
  };

  const enrichedBase = enrichScenarios(scenarios, result.probabilities, result.decision);

  const advanced: AdvancedAIAnalysis = {
    ...result.advancedAnalysis,
    personalityProfile: {
      ...result.advancedAnalysis.personalityProfile,
      summary: narrative.personalitySummary,
      traits:
        narrative.personalityTraits.length > 0
          ? narrative.personalityTraits
          : result.advancedAnalysis.personalityProfile.traits,
    },
    strategicAdvice:
      narrative.strategicAdvice.length > 0
        ? narrative.strategicAdvice
        : result.advancedAnalysis.strategicAdvice,
    emotionalTrajectory:
      narrative.emotionalTrajectory?.length >= 4
        ? narrative.emotionalTrajectory
        : result.advancedAnalysis.emotionalTrajectory,
    outcomeDrivers: mergeOutcomeDrivers(
      result.advancedAnalysis.outcomeDrivers,
      narrative.outcomeDrivers
    ),
    scenarioBranches: mergeBranches(
      result.advancedAnalysis.scenarioBranches,
      narrative.scenarioBranches
    ),
    relationshipImpact: narrative.relationshipImpact,
    financialProjection: narrative.financialProjection,
    careerTrajectory: narrative.careerTrajectory,
    lifeMapInsight: narrative.lifeMapInsight,
    whatChangedOutcome: narrative.whatChangedOutcome,
  };

  return {
    ...result,
    scenarios,
    enrichedScenarios: {
      best: mergeScenarioCard(
        enrichedBase.best,
        narrative.scenarios.best,
        'best',
        scenarios.best
      ),
      average: mergeScenarioCard(
        enrichedBase.average,
        narrative.scenarios.average,
        'average',
        scenarios.average
      ),
      worst: mergeScenarioCard(
        enrichedBase.worst,
        narrative.scenarios.worst,
        'worst',
        scenarios.worst
      ),
    },
    advancedAnalysis: advanced,
    summary: {
      ...result.summary,
      headline: narrative.headline || result.summary.headline,
      insights:
        narrative.insights.length > 0 ? narrative.insights : result.summary.insights,
      aiSource: 'grok',
    },
  };
}

interface GrokTimelinePack {
  scenarios: {
    best: Pick<GrokScenarioFull, 'timeline' | 'summary' | 'domains' | 'chainReactions' | 'bullets'>;
    average: Pick<GrokScenarioFull, 'timeline' | 'summary' | 'domains' | 'chainReactions' | 'bullets'>;
    worst: Pick<GrokScenarioFull, 'timeline' | 'summary' | 'domains' | 'chainReactions' | 'bullets'>;
  };
}

function buildTimelinePrompt(result: SimulationResult): string {
  const { decision } = result;
  return `Personalize timeline stages for this user's decision. JSON only:
{ "scenarios": { "best"|"average"|"worst": {
  "summary": string,
  "bullets": string[4],
  "timeline": [{ "marker": "month1"|"month3"|"month6"|"year1"|"year5",
    "events": string[2-4], "consequences": string[2-3], "emotionalChanges": string[2-3],
    "opportunities": string[2-3], "risks": string[2-3] }],
  "domains": [{ "id": LifeDomain id, "state": string, "why": string, "trajectory": "up"|"steady"|"down"|"volatile" }] (10 ids),
  "chainReactions": [{ "trigger": string, "cascade": string[2-4], "why": string }] (2-3)
}}}

Decision: ${decision.decisionConsidered}
Situation: ${decision.currentSituation}
Goal: ${decision.desiredOutcome}
Fear: ${decision.biggestFear}
Skills: ${decision.skillTags.join(', ') || decision.existingSkills}`;
}

function applyTimelinePack(
  result: SimulationResult,
  pack: GrokTimelinePack
): SimulationResult {
  const partial: GrokSimulationNarrative = {
    pathLabel: result.scenarios.pathLabel,
    drivingFactors: result.scenarios.drivingFactors,
    headline: result.summary.headline,
    insights: result.summary.insights,
    personalitySummary: result.advancedAnalysis.personalityProfile.summary,
    personalityTraits: result.advancedAnalysis.personalityProfile.traits,
    strategicAdvice: result.advancedAnalysis.strategicAdvice,
    relationshipImpact: result.advancedAnalysis.relationshipImpact,
    financialProjection: result.advancedAnalysis.financialProjection,
    careerTrajectory: result.advancedAnalysis.careerTrajectory,
    lifeMapInsight: result.advancedAnalysis.lifeMapInsight,
    whatChangedOutcome: result.advancedAnalysis.whatChangedOutcome,
    emotionalTrajectory: result.advancedAnalysis.emotionalTrajectory,
    outcomeDrivers: result.advancedAnalysis.outcomeDrivers,
    scenarioBranches: result.advancedAnalysis.scenarioBranches.map((b) => ({
      id: b.id,
      label: b.label,
      outcome: b.outcome,
    })),
    scenarios: {
      best: {
        ...pack.scenarios.best,
        emotionalOutcome: result.enrichedScenarios.best.emotionalOutcome,
        finalResult: result.enrichedScenarios.best.finalResult,
      } as GrokScenarioFull,
      average: {
        ...pack.scenarios.average,
        emotionalOutcome: result.enrichedScenarios.average.emotionalOutcome,
        finalResult: result.enrichedScenarios.average.finalResult,
      } as GrokScenarioFull,
      worst: {
        ...pack.scenarios.worst,
        emotionalOutcome: result.enrichedScenarios.worst.emotionalOutcome,
        finalResult: result.enrichedScenarios.worst.finalResult,
      } as GrokScenarioFull,
    },
  };
  return applyNarrative(result, partial);
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'AI request failed';
}

export async function enrichSimulationWithGrok(
  result: SimulationResult
): Promise<SimulationResult> {
  if (!isGrokConfigured()) {
    return { ...result, summary: { ...result.summary, aiSource: 'template' } };
  }

  let merged = result;
  let grokSucceeded = false;
  let lastError: string | undefined;
  const system =
    'You are an expert life-decision strategist in Future Simulator. Respond only with JSON. Use the user exact words — never generic template examples unless they wrote them.';

  try {
    const timelineContent = await grokChatCompletion(
      [{ role: 'system', content: system }, { role: 'user', content: buildTimelinePrompt(result) }],
      { maxTokens: 5000, temperature: 0.65 }
    );
    const timelinePack = parseGrokJson<GrokTimelinePack>(timelineContent);
    merged = applyTimelinePack(merged, timelinePack);
    grokSucceeded = true;
  } catch (err) {
    lastError = errorMessage(err);
    console.warn('[AI] Timeline enrichment failed:', err);
  }

  try {
    const content = await grokChatCompletion(
      [{ role: 'system', content: system }, { role: 'user', content: buildPrompt(merged) }],
      { maxTokens: 4500, temperature: 0.7 }
    );
    const narrative = parseGrokJson<GrokSimulationNarrative>(content);
    merged = applyNarrative(merged, narrative);
    grokSucceeded = true;
    lastError = undefined;
  } catch (err) {
    lastError = errorMessage(err);
    console.warn('[AI] Narrative enrichment failed:', err);
  }

  merged = await enrichBranchesAndTree(merged);

  return {
    ...merged,
    summary: {
      ...merged.summary,
      aiSource: grokSucceeded ? 'grok' : 'template',
      aiError: grokSucceeded ? undefined : lastError,
    },
  };
}
