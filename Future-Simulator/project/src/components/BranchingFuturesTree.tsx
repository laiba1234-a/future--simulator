import { GitBranch, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getAiProvider, isGrokConfigured } from '../lib/grok';
import type { FutureTreeNode, ProbabilityScores, ScenarioTier, SimulationResult } from '../types';
import {
  ProbabilityRing,
  ProbabilityStackBar,
  TierIconBadge,
  tierIcon,
} from './visuals/OutcomeCharts';

const TIER_STYLES: Record<ScenarioTier, string> = {
  best: 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
  average: 'border-sky-500/50 shadow-[0_0_24px_rgba(59,130,246,0.35)]',
  worst: 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.25)]',
};

interface BranchingFuturesTreeProps {
  tree: FutureTreeNode;
  title?: string;
  probabilities?: ProbabilityScores;
  aiSource?: SimulationResult['summary']['aiSource'];
}

function TreeNodeCard({
  node,
  active,
  onSelect,
}: {
  node: FutureTreeNode;
  active: boolean;
  onSelect: () => void;
}) {
  const tierClass = node.tier ? TIER_STYLES[node.tier] : 'border-app-border';
  const glow = node.glow ? 'tree-node-glow' : '';
  const TierIcon = node.tier ? tierIcon(node.tier) : GitBranch;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`tree-node flex min-w-[140px] max-w-[200px] gap-3 text-left ${tierClass} ${glow} ${
        active ? 'ring-2 ring-app-accent' : ''
      }`}
    >
      {node.tier ? (
        <TierIconBadge tier={node.tier} size="sm" />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-accent/15 text-teal-900">
          <TierIcon className="h-4 w-4" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-app-text">{node.label}</p>
        {node.subtitle && (
          <p className="mt-1 line-clamp-2 text-xs text-app-muted">{node.subtitle}</p>
        )}
        {node.probability != null && (
          <p className="mt-2 font-mono text-xs text-teal-900">
            {node.probability}% path
          </p>
        )}
      </div>
      {node.probability != null && (
        <ProbabilityRing value={node.probability} tier={node.tier ?? 'average'} size={44} />
      )}
    </button>
  );
}

function TreeLevel({
  nodes,
  depth,
  activeId,
  onSelect,
}: {
  nodes: FutureTreeNode[];
  depth: number;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  if (nodes.length === 0) return null;

  return (
    <div
      className="tree-level flex flex-wrap justify-center gap-4"
      style={{ animationDelay: `${depth * 150}ms` }}
    >
      {nodes.map((node) => (
        <div key={node.id} className="tree-branch-col flex flex-col items-center">
          <TreeNodeCard
            node={node}
            active={activeId === node.id}
            onSelect={() => onSelect(node.id)}
          />
          {node.children && node.children.length > 0 && (
            <>
              <div className="tree-connector my-2 h-10 w-px bg-gradient-to-b from-app-accent/80 to-app-accent/20" />
              <svg
                className="tree-fork-lines mb-2 text-app-accent/40"
                width={Math.max(120, node.children.length * 160)}
                height={24}
                aria-hidden
              >
                <line x1="50%" y1="0" x2="50%" y2="12" stroke="currentColor" strokeWidth="2" />
                {node.children.map((_, i) => {
                  const w = Math.max(120, node.children!.length * 160);
                  const x = ((i + 0.5) / node.children!.length) * w;
                  return (
                    <line
                      key={i}
                      x1={w / 2}
                      y1="12"
                      x2={x}
                      y2="24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="tree-line-animated"
                      style={{ animationDelay: `${depth * 150 + i * 80}ms` }}
                    />
                  );
                })}
              </svg>
              <div className="flex flex-wrap justify-center gap-3">
                {node.children.map((child) => (
                  <div key={child.id} className="flex flex-col items-center">
                    <TreeNodeCard
                      node={child}
                      active={activeId === child.id}
                      onSelect={() => onSelect(child.id)}
                    />
                    {child.children && child.children.length > 0 && (
                      <>
                        <div className="tree-connector my-2 h-6 w-px bg-app-accent/30" />
                        <ul className="space-y-2">
                          {child.children.map((leaf) => (
                            <li key={leaf.id}>
                              <TreeNodeCard
                                node={leaf}
                                active={activeId === leaf.id}
                                onSelect={() => onSelect(leaf.id)}
                              />
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function findNode(root: FutureTreeNode, id: string): FutureTreeNode | null {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function BranchingFuturesTree({
  tree,
  title,
  probabilities,
  aiSource,
}: BranchingFuturesTreeProps) {
  const [activeId, setActiveId] = useState(tree.id);
  const providerLabel = getAiProvider() === 'groq' ? 'Groq' : 'Grok';

  const activeNode = useMemo(
    () => findNode(tree, activeId) ?? tree,
    [tree, activeId]
  );

  return (
    <section className="branching-tree card overflow-hidden p-6">
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <GitBranch className="h-5 w-5 text-teal-900" />
          <p className="overline">Branching futures</p>
          {aiSource === 'grok' && (
            <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-medium text-teal-900">
              {providerLabel} AI
            </span>
          )}
        </div>
        {title && <h3 className="mt-2 text-center text-lg font-medium text-app-text">{title}</h3>}
        {probabilities && (
          <div className="mx-auto mt-4 max-w-md">
            <ProbabilityStackBar probabilities={probabilities} />
          </div>
        )}
        <p className="mt-3 text-center text-sm text-app-muted">
          Click a node to explore paths — rings show probability at each branch.
        </p>
        {aiSource !== 'grok' && isGrokConfigured() && (
          <p className="mt-2 text-center text-xs font-medium text-amber-900">
            Run a new simulation for AI-personalized branch labels.
          </p>
        )}
      </div>

      <div className="tree-root-wrap overflow-x-auto pb-4">
        <div className="tree-root-node mx-auto mb-6 flex justify-center">
          <TreeNodeCard
            node={tree}
            active={activeId === tree.id}
            onSelect={() => setActiveId(tree.id)}
          />
        </div>
        {tree.children && (
          <>
            <div className="mx-auto mb-4 h-12 w-px bg-gradient-to-b from-app-accent to-transparent" />
            <TreeLevel
              nodes={tree.children}
              depth={1}
              activeId={activeId}
              onSelect={setActiveId}
            />
          </>
        )}
      </div>

      {activeNode && (
        <div className="card-inset mt-4 flex gap-3 p-4">
          <Sparkles className="h-5 w-5 shrink-0 text-teal-900" />
          <div>
            <p className="text-sm font-medium text-app-text">{activeNode.label}</p>
            {activeNode.subtitle && (
              <p className="mt-1 text-sm text-app-muted">{activeNode.subtitle}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
