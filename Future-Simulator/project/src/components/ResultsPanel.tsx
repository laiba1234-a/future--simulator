import { Bookmark, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../lib/simulation';
import { ensureFullResult } from '../lib/resultCompat';
import type { SimulationResult, UserMemoryStore } from '../types';
import { AdvancedAIFeatures } from './AdvancedAIFeatures';
import { FutureScenarioCards } from './FutureScenarioCards';
import { MemoryContextPanel } from './MemoryContextPanel';
import { Timeline } from './Timeline';

interface ResultsPanelProps {
  result: SimulationResult | null;
  memory: UserMemoryStore;
  onSave: () => void;
  saveLabel: string;
  storageHint: string;
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'cyan' | 'violet' | 'amber';
}) {
  const tones = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-400/30 text-cyan-200',
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-400/30 text-violet-200',
    amber: 'from-amber-100 to-amber-50 border-amber-300 text-amber-950',
  };

  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${tones[tone]}`}>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold">{value}</p>
    </div>
  );
}

export function ResultsPanel({
  result,
  memory,
  onSave,
  saveLabel,
  storageHint,
}: ResultsPanelProps) {
  if (!result) {
    return (
      <section className="flex min-h-[480px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-slate-900/40 p-10 text-center">
        <TrendingUp className="mb-4 h-12 w-12 text-cyan-400/70" />
        <h2 className="text-xl font-semibold text-white">Your futures appear here</h2>
        <p className="mt-2 max-w-lg text-sm text-slate-400">
          Fill in your decision, fears, and context — then simulate. You will see
          visually separated best, most likely, and worst case cards with
          probabilities, timelines, and AI analysis that remembers your past runs.
        </p>
      </section>
    );
  }

  const full = ensureFullResult(result);
  const { summary, snapshots, enrichedScenarios, probabilities, advancedAnalysis, memoryContext, scenarios } = full;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-cyan-300/80">
              Simulation complete
            </p>
            <h2 className="mt-1 text-xl font-semibold leading-snug text-white">
              {summary.headline}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Confidence:{' '}
              <span className="font-mono text-cyan-300">{summary.confidence}%</span>
              {memoryContext.priorSimulationCount > 0 && (
                <span className="text-slate-500">
                  {' '}
                  · {memoryContext.priorSimulationCount} prior run
                  {memoryContext.priorSimulationCount === 1 ? '' : 's'} in memory
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
          >
            <Bookmark className="h-4 w-4" />
            {saveLabel}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">{storageHint}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <MetricCard
            label="Best case wealth"
            value={formatCurrency(summary.endWealth.optimistic)}
            tone="cyan"
          />
          <MetricCard
            label="Most likely wealth"
            value={formatCurrency(summary.endWealth.realistic)}
            tone="violet"
          />
          <MetricCard
            label="Worst case wealth"
            value={formatCurrency(summary.endWealth.pessimistic)}
            tone="amber"
          />
        </div>
      </div>

      <MemoryContextPanel
        memory={memory}
        referencesUsed={memoryContext.referencesUsed}
      />

      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Path · {scenarios.pathLabel}
        </p>
        <ul className="space-y-1">
          {scenarios.drivingFactors.map((f) => (
            <li key={f} className="text-xs leading-relaxed text-slate-400">
              {f}
            </li>
          ))}
        </ul>
      </div>

      <FutureScenarioCards
        enriched={enrichedScenarios}
        probabilities={probabilities}
        aiSource={summary.aiSource}
        aiError={summary.aiError}
      />

      <AdvancedAIFeatures analysis={advancedAnalysis} />

      <ul className="space-y-2 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
        {summary.insights.map((insight) => (
          <li
            key={insight}
            className="rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm text-slate-300"
          >
            {insight}
          </li>
        ))}
      </ul>

      <Timeline snapshots={snapshots} />
    </section>
  );
}
