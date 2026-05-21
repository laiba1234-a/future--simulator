import type {
  FutureTreeNode,
  ParallelUniverseComparison,
  ScenarioBranch,
  SimulationResult,
} from '../types';
import { buildFutureTreeFromResult, buildParallelFutureTree } from './futureTree';
import { grokChatCompletion, isGrokConfigured, parseGrokJson } from './grok';

interface GrokNodePatch {
  id: string;
  label: string;
  subtitle?: string;
}

interface GrokBranchPack {
  rootSubtitle: string;
  nodes: GrokNodePatch[];
  branches: { id: string; label: string; outcome: string }[];
}

interface GrokParallelPack {
  verdict: string;
  insights: string[];
  winnerLean?: 'a' | 'b' | 'neutral';
  rows?: { dimension: string; optionA: string; optionB: string }[];
  treeRootSubtitle: string;
  nodes: GrokNodePatch[];
}

function collectNodes(node: FutureTreeNode, list: GrokNodePatch[] = []): GrokNodePatch[] {
  list.push({ id: node.id, label: node.label, subtitle: node.subtitle });
  for (const child of node.children ?? []) {
    collectNodes(child, list);
  }
  return list;
}

function applyNodePatches(tree: FutureTreeNode, patches: GrokNodePatch[]): FutureTreeNode {
  const byId = new Map(patches.map((p) => [p.id, p]));

  function walk(node: FutureTreeNode): FutureTreeNode {
    const patch = byId.get(node.id);
    return {
      ...node,
      label: patch?.label?.trim() ? patch.label : node.label,
      subtitle: patch?.subtitle?.trim() ? patch.subtitle : node.subtitle,
      children: node.children?.map(walk),
    };
  }

  const rootPatch = byId.get(tree.id);
  const walked = walk(tree);
  return {
    ...walked,
    subtitle: rootPatch?.subtitle?.trim()
      ? rootPatch.subtitle
      : walked.subtitle,
  };
}

function applyBranchPatches(
  branches: ScenarioBranch[],
  patches: GrokBranchPack['branches']
): ScenarioBranch[] {
  if (!patches?.length) return branches;
  const byId = new Map(patches.map((p) => [p.id, p]));
  return branches.map((b) => {
    const patch = byId.get(b.id);
    if (!patch) return b;
    return {
      ...b,
      label: patch.label?.trim() ? patch.label : b.label,
      outcome: patch.outcome?.trim() ? patch.outcome : b.outcome,
    };
  });
}

function buildBranchPrompt(result: SimulationResult, tree: FutureTreeNode): string {
  const nodes = collectNodes(tree);
  return `Personalize branching futures tree for this user. JSON only:
{
  "rootSubtitle": string,
  "nodes": [{ "id": string, "label": string, "subtitle": string }],
  "branches": [{ "id": string, "label": string, "outcome": string }]
}

Decision: ${result.decision.decisionConsidered}
Goal: ${result.decision.desiredOutcome}
Fear: ${result.decision.biggestFear}
Probabilities: best ${result.probabilities.best}% average ${result.probabilities.average}% worst ${result.probabilities.worst}%

Nodes to rewrite (keep ids):
${JSON.stringify(nodes.slice(0, 24))}

Branches to rewrite (keep ids):
${JSON.stringify(result.advancedAnalysis.scenarioBranches)}`;
}

export async function enrichBranchesAndTree(
  result: SimulationResult
): Promise<SimulationResult> {
  const baseTree = buildFutureTreeFromResult(result);

  if (!isGrokConfigured()) {
    return { ...result, futureTree: baseTree };
  }

  try {
    const content = await grokChatCompletion(
      [
        {
          role: 'system',
          content:
            'You personalize branching decision trees. Respond only with JSON. Be specific to the user decision.',
        },
        { role: 'user', content: buildBranchPrompt(result, baseTree) },
      ],
      { maxTokens: 2800, temperature: 0.65 }
    );

    const pack = parseGrokJson<GrokBranchPack>(content);
    const futureTree = applyNodePatches(baseTree, pack.nodes);
    if (pack.rootSubtitle) {
      futureTree.subtitle = pack.rootSubtitle;
    }

    return {
      ...result,
      futureTree,
      advancedAnalysis: {
        ...result.advancedAnalysis,
        scenarioBranches: applyBranchPatches(
          result.advancedAnalysis.scenarioBranches,
          pack.branches
        ),
      },
    };
  } catch (err) {
    console.warn('[AI] Branch enrichment failed:', err);
    return { ...result, futureTree: baseTree };
  }
}

function buildParallelPrompt(comparison: ParallelUniverseComparison): string {
  const tree = buildParallelFutureTree(comparison);
  const nodes = collectNodes(tree);
  return `Compare parallel universes for this user. JSON only:
{
  "verdict": string (2-3 sentences),
  "insights": string[3-5],
  "winnerLean": "a"|"b"|"neutral",
  "rows": [{ "dimension": string, "optionA": string, "optionB": string }],
  "treeRootSubtitle": string,
  "nodes": [{ "id": string, "label": string, "subtitle": string }]
}

Option A: ${comparison.resultA.decision.decisionConsidered}
Option B: ${comparison.resultB.decision.decisionConsidered}

Risk A: ${comparison.resultA.advancedAnalysis.riskProfileScore} Risk B: ${comparison.resultB.advancedAnalysis.riskProfileScore}
Confidence A: ${comparison.resultA.summary.confidence}% B: ${comparison.resultB.summary.confidence}%

Current rows: ${JSON.stringify(comparison.rows)}
Tree nodes: ${JSON.stringify(nodes.slice(0, 20))}`;
}

export async function enrichParallelComparison(
  comparison: ParallelUniverseComparison
): Promise<ParallelUniverseComparison> {
  const baseTree = buildParallelFutureTree(comparison);

  if (!isGrokConfigured()) {
    return {
      ...comparison,
      futureTree: baseTree,
      aiSource: 'template',
    };
  }

  try {
    const content = await grokChatCompletion(
      [
        {
          role: 'system',
          content:
            'You compare two life paths. Respond only with JSON. Use vivid, specific language.',
        },
        { role: 'user', content: buildParallelPrompt(comparison) },
      ],
      { maxTokens: 3200, temperature: 0.7 }
    );

    const pack = parseGrokJson<GrokParallelPack>(content);
    let futureTree = applyNodePatches(baseTree, pack.nodes);
    if (pack.treeRootSubtitle) {
      futureTree = { ...futureTree, subtitle: pack.treeRootSubtitle };
    }

    return {
      ...comparison,
      verdict: pack.verdict?.trim() || comparison.verdict,
      aiInsights: pack.insights?.length ? pack.insights : undefined,
      winnerLean: pack.winnerLean,
      aiSource: 'grok',
      futureTree,
      rows:
        pack.rows?.length && pack.rows.length === comparison.rows.length
          ? comparison.rows.map((row, i) => ({
              ...row,
              optionA: pack.rows![i].optionA || row.optionA,
              optionB: pack.rows![i].optionB || row.optionB,
              lean:
                pack.winnerLean === 'a'
                  ? 'a'
                  : pack.winnerLean === 'b'
                    ? 'b'
                    : row.lean,
            }))
          : comparison.rows,
    };
  } catch (err) {
    console.warn('[AI] Parallel enrichment failed:', err);
    return {
      ...comparison,
      futureTree: baseTree,
      aiSource: 'template',
    };
  }
}
