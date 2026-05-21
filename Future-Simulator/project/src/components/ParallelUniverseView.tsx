import {
  GitBranch,
  Orbit,
  Rocket,
  Scale,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ParallelUniverseComparison, ParallelUniverseInput } from '../types';
import { isFinancialDecision } from '../lib/decisionTopics';
import { formatCurrency } from '../lib/simulation';
import { BranchingFuturesTree } from './BranchingFuturesTree';
import { SequentialTabNav } from './layout/SequentialTabNav';
import {
  DualCompareBars,
  InsightIconGrid,
  MetricIconTile,
  ProbabilityStackBar,
  VerdictBanner,
} from './visuals/OutcomeCharts';

type ParallelTab = 'universe-a' | 'universe-b' | 'compare';

const PARALLEL_TABS = [
  { id: 'universe-a' as const, label: 'Universe A', icon: Orbit },
  { id: 'universe-b' as const, label: 'Universe B', icon: Rocket },
  { id: 'compare' as const, label: 'Compare', icon: Scale },
];

interface ParallelUniverseViewProps {
  comparison: ParallelUniverseComparison | null;
  parallel: ParallelUniverseInput;
  isRunning: boolean;
  onChange: (patch: Partial<ParallelUniverseInput>) => void;
  onCompare: () => void;
}

function UniverseCard({
  label,
  result,
  accent,
}: {
  label: string;
  result: ParallelUniverseComparison['resultA'];
  accent: 'a' | 'b';
}) {
  const border =
    accent === 'a' ? 'border-sky-500/40 universe-glow-a' : 'border-violet-500/40 universe-glow-b';
  const showMoney = isFinancialDecision(result.decision);

  return (
    <div className={`card universe-card ${border} p-5`}>
      <div className="flex items-start gap-3">
        {accent === 'a' ? (
          <Orbit className="h-8 w-8 shrink-0 text-sky-800" />
        ) : (
          <Rocket className="h-8 w-8 shrink-0 text-violet-800" />
        )}
        <div className="min-w-0 flex-1">
          <p className="overline">{label}</p>
          <p className="mt-2 text-sm font-medium text-app-text">{result.summary.headline}</p>
        </div>
      </div>

      <div className="mt-4">
        <ProbabilityStackBar probabilities={result.probabilities} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricIconTile
          icon={Scale}
          label="Risk score"
          value={`${result.advancedAnalysis.riskProfileScore}/100`}
          accent={accent === 'a' ? 'text-sky-800' : 'text-violet-800'}
        />
        <MetricIconTile
          icon={Sparkles}
          label="Confidence"
          value={`${result.summary.confidence}%`}
          accent={accent === 'a' ? 'text-sky-800' : 'text-violet-800'}
        />
      </div>

      {showMoney && (
        <div className="mt-3 grid gap-2 font-mono text-xs text-app-muted">
          <p>Likely wealth: {formatCurrency(result.summary.endWealth.realistic)}</p>
          <p>Best: {formatCurrency(result.summary.endWealth.optimistic)}</p>
          <p>Worst: {formatCurrency(result.summary.endWealth.pessimistic)}</p>
        </div>
      )}
    </div>
  );
}

export function ParallelUniverseView({
  comparison,
  parallel,
  isRunning,
  onChange,
  onCompare,
}: ParallelUniverseViewProps) {
  const [tab, setTab] = useState<ParallelTab>('universe-a');
  const tabIndex = PARALLEL_TABS.findIndex((t) => t.id === tab);

  const goNext = () => {
    if (tabIndex < PARALLEL_TABS.length - 1) {
      setTab(PARALLEL_TABS[tabIndex + 1].id);
    }
  };

  const goBack = () => {
    if (tabIndex > 0) {
      setTab(PARALLEL_TABS[tabIndex - 1].id);
    }
  };

  const tree = useMemo(
    () => comparison?.futureTree ?? null,
    [comparison]
  );

  return (
    <div className="space-y-8">
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-app-accent" />
          <h3 className="text-base font-medium text-app-text">Parallel universe mode</h3>
        </div>
        <p className="mb-5 text-sm text-app-muted">
          Define both paths, then compare — AI personalizes the verdict, charts, and branch tree.
        </p>

        <SequentialTabNav
          tabs={PARALLEL_TABS}
          active={tab}
          onSelect={setTab}
          onContinue={goNext}
          onBack={goBack}
          isRunning={isRunning}
          hint="Use Continue to move through each step"
        />

        <div className="mt-6">
          {tab === 'universe-a' && (
            <label className="block space-y-2">
              <span className="field-label">{parallel.optionALabel}</span>
              <input
                type="text"
                value={parallel.optionALabel}
                onChange={(e) => onChange({ optionALabel: e.target.value })}
                className="field-input"
              />
              <textarea
                value={parallel.optionAChoice}
                onChange={(e) => onChange({ optionAChoice: e.target.value })}
                rows={4}
                className="field-textarea w-full"
                placeholder="Describe path A in detail…"
              />
            </label>
          )}

          {tab === 'universe-b' && (
            <label className="block space-y-2">
              <span className="field-label">{parallel.optionBLabel}</span>
              <input
                type="text"
                value={parallel.optionBLabel}
                onChange={(e) => onChange({ optionBLabel: e.target.value })}
                className="field-input"
              />
              <textarea
                value={parallel.optionBChoice}
                onChange={(e) => onChange({ optionBChoice: e.target.value })}
                rows={4}
                className="field-textarea w-full"
                placeholder="Describe path B in detail…"
              />
            </label>
          )}

          {tab === 'compare' && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-app-muted">
                Both universes are defined. Run AI comparison to split futures side by side.
              </p>
              <button
                type="button"
                onClick={onCompare}
                disabled={
                  isRunning ||
                  !parallel.optionAChoice.trim() ||
                  !parallel.optionBChoice.trim()
                }
                className="btn-primary mx-auto"
              >
                <GitBranch className="h-4 w-4" />
                {isRunning ? 'Splitting universes…' : 'Compare universes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {comparison && (
        <>
          <VerdictBanner text={comparison.verdict} aiSource={comparison.aiSource} />

          {comparison.winnerLean && comparison.winnerLean !== 'neutral' && (
            <div className="flex items-center justify-center gap-2 text-sm text-app-accent">
              <Trophy className="h-4 w-4" />
              Edge leans toward{' '}
              {comparison.winnerLean === 'a'
                ? comparison.optionALabel
                : comparison.optionBLabel}
            </div>
          )}

          {comparison.aiInsights && comparison.aiInsights.length > 0 && (
            <InsightIconGrid insights={comparison.aiInsights} />
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <UniverseCard
              label={comparison.optionALabel}
              result={comparison.resultA}
              accent="a"
            />
            <UniverseCard
              label={comparison.optionBLabel}
              result={comparison.resultB}
              accent="b"
            />
          </div>

          <div className="card p-5">
            <p className="overline mb-4">Head-to-head</p>
            <DualCompareBars
              labelA={comparison.optionALabel}
              labelB={comparison.optionBLabel}
              valueA={comparison.resultA.advancedAnalysis.riskProfileScore}
              valueB={comparison.resultB.advancedAnalysis.riskProfileScore}
            />
            <p className="mt-2 text-center text-xs text-app-muted">Risk profile (lower is steadier)</p>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-app-border bg-app-raised/50">
                  <th className="px-4 py-3 font-medium text-app-muted">Dimension</th>
                  <th className="px-4 py-3 font-medium text-sky-900">
                    {comparison.optionALabel}
                  </th>
                  <th className="px-4 py-3 font-medium text-violet-900">
                    {comparison.optionBLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr
                    key={row.dimension}
                    className="border-b border-app-border/60 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-app-text">{row.dimension}</td>
                    <td
                      className={`px-4 py-3 ${
                        row.lean === 'a' ? 'bg-sky-100 text-sky-900' : 'text-app-muted'
                      }`}
                    >
                      {row.optionA}
                    </td>
                    <td
                      className={`px-4 py-3 ${
                        row.lean === 'b'
                          ? 'bg-violet-100 text-violet-900'
                          : 'text-app-muted'
                      }`}
                    >
                      {row.optionB}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tree && (
            <BranchingFuturesTree
              tree={tree}
              title="Both paths — AI branching tree"
              aiSource={comparison.aiSource}
            />
          )}
        </>
      )}
    </div>
  );
}
