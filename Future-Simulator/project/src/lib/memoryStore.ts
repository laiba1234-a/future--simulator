import type {
  DecisionInput,
  DecisionTimelineEntry,
  ScenarioMemoryEntry,
  ScenarioTier,
  SimulationResult,
  UserMemoryStore,
  UserProfile,
} from '../types';

const MEMORY_KEY = 'future-simulator:memory';

function emptyProfile(): UserProfile {
  return {
    longTermGoals: [],
    recurringFears: [],
    riskBehavior: {
      averageTolerance: 'medium',
      confidenceTrend: 5,
      simulationsCount: 0,
    },
    personalitySignals: {
      dominantEmotionalStates: [],
      decisionThemes: [],
    },
    historicalOutcomes: [],
    lastUpdated: new Date().toISOString(),
  };
}

export function createEmptyMemory(): UserMemoryStore {
  return {
    profile: emptyProfile(),
    conversations: [],
    decisionTimeline: [],
    scenarioSummaries: [],
    updatedAt: new Date().toISOString(),
  };
}

export function loadMemory(): UserMemoryStore {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return createEmptyMemory();
    return JSON.parse(raw) as UserMemoryStore;
  } catch {
    return createEmptyMemory();
  }
}

export function saveMemory(store: UserMemoryStore): void {
  store.updatedAt = new Date().toISOString();
  localStorage.setItem(MEMORY_KEY, JSON.stringify(store));
}

function riskToNumber(level: DecisionInput['riskTolerance']): number {
  return level === 'low' ? 1 : level === 'high' ? 3 : 2;
}

function numberToRisk(n: number): DecisionInput['riskTolerance'] {
  if (n <= 1.4) return 'low';
  if (n >= 2.6) return 'high';
  return 'medium';
}

function extractThemes(decision: string): string[] {
  const themes: string[] = [];
  const lower = decision.toLowerCase();
  if (lower.includes('quit') || lower.includes('leave')) themes.push('exit current path');
  if (lower.includes('degree') || lower.includes('school')) themes.push('education pivot');
  if (lower.includes('business') || lower.includes('startup')) themes.push('entrepreneurship');
  if (lower.includes('youtube') || lower.includes('content')) themes.push('creator economy');
  if (lower.includes('move') || lower.includes('relocate')) themes.push('relocation');
  if (lower.includes('relationship') || lower.includes('marry')) themes.push('relationships');
  return themes.length > 0 ? themes : ['life transition'];
}

function dominantTier(probs: SimulationResult['probabilities']): ScenarioTier {
  const entries: [ScenarioTier, number][] = [
    ['best', probs.best],
    ['average', probs.average],
    ['worst', probs.worst],
  ];
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function updateProfile(
  profile: UserProfile,
  decision: DecisionInput,
  result: SimulationResult
): UserProfile {
  const goal = decision.desiredOutcome.trim();
  if (goal && !profile.longTermGoals.includes(goal)) {
    profile.longTermGoals = [goal, ...profile.longTermGoals].slice(0, 8);
  }

  const fear = decision.biggestFear.trim();
  if (fear) {
    const existing = profile.recurringFears.find(
      (f) => f.toLowerCase().slice(0, 40) === fear.toLowerCase().slice(0, 40)
    );
    if (!existing) {
      profile.recurringFears = [fear, ...profile.recurringFears].slice(0, 6);
    }
  }

  const n = profile.riskBehavior.simulationsCount + 1;
  const prevAvg = riskToNumber(profile.riskBehavior.averageTolerance);
  const newAvg = (prevAvg * (n - 1) + riskToNumber(decision.riskTolerance)) / n;
  profile.riskBehavior = {
    averageTolerance: numberToRisk(newAvg),
    confidenceTrend: Math.round(
      (profile.riskBehavior.confidenceTrend * (n - 1) + decision.confidenceLevel) / n
    ),
    simulationsCount: n,
  };

  const emotions = profile.personalitySignals.dominantEmotionalStates;
  if (!emotions.includes(decision.emotionalState)) {
    profile.personalitySignals.dominantEmotionalStates = [
      decision.emotionalState,
      ...emotions,
    ].slice(0, 5);
  }

  const themes = extractThemes(decision.decisionConsidered);
  for (const t of themes) {
    if (!profile.personalitySignals.decisionThemes.includes(t)) {
      profile.personalitySignals.decisionThemes.push(t);
    }
  }
  profile.personalitySignals.decisionThemes =
    profile.personalitySignals.decisionThemes.slice(0, 10);

  const tier = dominantTier(result.probabilities);
  const hist = profile.historicalOutcomes.find((h) => h.tier === tier);
  if (hist) hist.count += 1;
  else profile.historicalOutcomes.push({ tier, count: 1 });

  profile.lastUpdated = new Date().toISOString();
  return profile;
}

export function recordSimulationInMemory(
  result: SimulationResult,
  label: string
): UserMemoryStore {
  const store = loadMemory();
  const { decision } = result;
  const tier = dominantTier(result.probabilities);

  const scenarioEntry: ScenarioMemoryEntry = {
    id: crypto.randomUUID(),
    simulationId: result.id,
    label,
    decisionConsidered: decision.decisionConsidered,
    desiredOutcome: decision.desiredOutcome,
    biggestFear: decision.biggestFear,
    bestProbability: result.probabilities.best,
    averageProbability: result.probabilities.average,
    worstProbability: result.probabilities.worst,
    dominantTier: tier,
    headline: result.summary.headline,
    createdAt: result.createdAt,
  };

  const timelineEntry: DecisionTimelineEntry = {
    id: crypto.randomUUID(),
    simulationId: result.id,
    label,
    decisionSnippet: decision.decisionConsidered.slice(0, 120),
    outcomeTier: tier,
    confidenceAtTime: decision.confidenceLevel,
    riskTolerance: decision.riskTolerance,
    emotionalState: decision.emotionalState,
    createdAt: result.createdAt,
  };

  store.scenarioSummaries = [scenarioEntry, ...store.scenarioSummaries].slice(0, 24);
  store.decisionTimeline = [timelineEntry, ...store.decisionTimeline].slice(0, 24);
  store.profile = updateProfile(store.profile, decision, result);

  const userSummary = `Considering: ${decision.decisionConsidered.slice(0, 200)}`;
  const assistantSummary = `Simulated three futures — most likely ${result.probabilities.average}% average path. ${result.summary.headline}`;

  store.conversations = [
    {
      id: crypto.randomUUID(),
      role: 'user',
      content: userSummary,
      simulationId: result.id,
      createdAt: result.createdAt,
    },
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: assistantSummary,
      simulationId: result.id,
      createdAt: result.createdAt,
    },
    ...store.conversations,
  ].slice(0, 40);

  saveMemory(store);
  return store;
}

export function findSimilarPastScenarios(
  decision: DecisionInput,
  store: UserMemoryStore
): ScenarioMemoryEntry[] {
  const needle = decision.decisionConsidered.toLowerCase().slice(0, 60);
  return store.scenarioSummaries.filter((s) => {
    const past = s.decisionConsidered.toLowerCase();
    return (
      past.includes(needle.slice(0, 30)) ||
      needle.includes(past.slice(0, 30)) ||
      s.biggestFear &&
        decision.biggestFear &&
        s.biggestFear.toLowerCase().slice(0, 40) ===
          decision.biggestFear.toLowerCase().slice(0, 40)
    );
  });
}

export function getMemoryContextForDecision(
  decision: DecisionInput,
  store?: UserMemoryStore
): {
  store: UserMemoryStore;
  similar: ScenarioMemoryEntry[];
  referencesUsed: string[];
  isRepeatDecision: boolean;
  priorSimulationCount: number;
} {
  const memory = store ?? loadMemory();
  const similar = findSimilarPastScenarios(decision, memory);
  const referencesUsed: string[] = [];

  if (memory.profile.longTermGoals.length > 0) {
    referencesUsed.push(
      `Long-term goal on file: "${memory.profile.longTermGoals[0].slice(0, 90)}${memory.profile.longTermGoals[0].length > 90 ? '…' : ''}"`
    );
  }
  if (memory.profile.recurringFears.length > 0) {
    referencesUsed.push(
      `Recurring fear pattern: "${memory.profile.recurringFears[0].slice(0, 90)}${memory.profile.recurringFears[0].length > 90 ? '…' : ''}"`
    );
  }
  if (memory.profile.riskBehavior.simulationsCount > 1) {
    referencesUsed.push(
      `Your typical risk tolerance across ${memory.profile.riskBehavior.simulationsCount} runs: ${memory.profile.riskBehavior.averageTolerance} (current: ${decision.riskTolerance}).`
    );
  }
  if (similar.length > 0) {
    const prev = similar[0];
    referencesUsed.push(
      `You explored a similar decision on ${new Date(prev.createdAt).toLocaleDateString()} — then the model leaned ${prev.dominantTier} (${prev.averageProbability}% most likely).`
    );
  }
  const dominantHist = memory.profile.historicalOutcomes.sort(
    (a, b) => b.count - a.count
  )[0];
  if (dominantHist && dominantHist.count >= 2) {
    referencesUsed.push(
      `Historical pattern: ${dominantHist.count} past simulations ended in the ${dominantHist.tier} tier as the dominant probability band.`
    );
  }

  return {
    store: memory,
    similar,
    referencesUsed,
    isRepeatDecision: similar.length > 0,
    priorSimulationCount: memory.profile.riskBehavior.simulationsCount,
  };
}
