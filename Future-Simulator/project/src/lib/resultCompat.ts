import type { SimulationResult } from '../types';
import { buildAdvancedAnalysis } from './aiAnalysis';
import { decisionToSimulation, DEFAULT_DECISION } from './decisionMapping';
import { generateScenarioOutcomes } from './consequenceEngine';
import { getMemoryContextForDecision } from './memoryStore';
import { buildFutureTreeFromResult } from './futureTree';
import { computeProbabilities, enrichScenarios } from './scenarioEnrichment';

export function ensureFullResult(result: SimulationResult): SimulationResult {
  if (
    result.probabilities &&
    result.enrichedScenarios &&
    result.advancedAnalysis &&
    result.memoryContext &&
    result.futureTree
  ) {
    return result;
  }

  const decision = result.decision ?? DEFAULT_DECISION;
  const input = result.input ?? decisionToSimulation(decision);
  const scenarios =
    result.scenarios ??
    generateScenarioOutcomes(decision, input, result.summary.endWealth);
  const memoryCtx = getMemoryContextForDecision(decision);
  const probabilities = result.probabilities ?? computeProbabilities(decision);
  const enrichedScenarios =
    result.enrichedScenarios ?? enrichScenarios(scenarios, probabilities, decision);
  const advancedAnalysis =
    result.advancedAnalysis ??
    buildAdvancedAnalysis(
      decision,
      input,
      scenarios,
      probabilities,
      result.summary.endWealth,
      memoryCtx,
      result.summary.confidence
    );
  const memoryContext = result.memoryContext ?? {
    referencesUsed: memoryCtx.referencesUsed,
    isRepeatDecision: memoryCtx.isRepeatDecision,
    priorSimulationCount: memoryCtx.priorSimulationCount,
  };

  const full: SimulationResult = {
    ...result,
    decision,
    input,
    scenarios,
    probabilities,
    enrichedScenarios,
    advancedAnalysis,
    memoryContext,
  };

  return {
    ...full,
    futureTree: result.futureTree ?? buildFutureTreeFromResult(full),
  };
}
