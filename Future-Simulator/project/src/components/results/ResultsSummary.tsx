import { Bookmark, PieChart } from 'lucide-react';
import { ProbabilityStackBar } from '../visuals/OutcomeCharts';
import { isFinancialDecision } from '../../lib/decisionTopics';
import { getAiProvider } from '../../lib/grok';
import { ensureFullResult } from '../../lib/resultCompat';
import { formatCurrency } from '../../lib/simulation';
import type { SimulationResult } from '../../types';

interface ResultsSummaryProps {
  result: SimulationResult;
  onSave: () => void;
  saveLabel: string;
  storageHint: string;
}

function MetricCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: 'positive' | 'neutral' | 'negative';
}) {
  const valueClass =
    variant === 'positive'
      ? 'metric-positive'
      : variant === 'negative'
        ? 'metric-negative'
        : 'metric-neutral';

  return (
    <div className="card-inset p-4">
      <p className="overline">{label}</p>
      <p className={`mt-2 font-mono text-lg font-medium tabular-nums ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

export function ResultsSummary({
  result,
  onSave,
  saveLabel,
  storageHint,
}: ResultsSummaryProps) {
  const full = ensureFullResult(result);
  const { summary, probabilities, memoryContext, decision } = full;
  const showWealth = isFinancialDecision(decision);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="overline">Summary</p>
            <h3 className="mt-2 text-base font-medium leading-snug text-app-text">
              {summary.headline}
            </h3>
            {summary.aiSource === 'grok' && (
              <p className="mt-2 text-xs text-teal-900">
                Narrative powered by {getAiProvider() === 'groq' ? 'Groq' : 'Grok'} AI
              </p>
            )}
            {summary.aiError && summary.aiSource !== 'grok' && (
              <p className="alert-warning alert-warning-text mt-2 px-3 py-2">
                AI error: {summary.aiError}
              </p>
            )}
            <p className="mt-2 text-sm text-app-muted">
              Confidence {summary.confidence}%
              {memoryContext.priorSimulationCount > 0 && (
                <span>
                  {' '}
                  · {memoryContext.priorSimulationCount} prior
                  {memoryContext.priorSimulationCount === 1 ? ' run' : ' runs'}
                </span>
              )}
            </p>
          </div>
          <button type="button" onClick={onSave} className="btn-secondary py-2">
            <Bookmark className="h-4 w-4" strokeWidth={1.75} />
            {saveLabel}
          </button>
        </div>
        <p className="mt-3 text-xs text-app-muted">{storageHint}</p>

        {showWealth ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Best case"
              value={formatCurrency(summary.endWealth.optimistic)}
              variant="positive"
            />
            <MetricCard
              label="Most likely"
              value={formatCurrency(summary.endWealth.realistic)}
              variant="neutral"
            />
            <MetricCard
              label="Worst case"
              value={formatCurrency(summary.endWealth.pessimistic)}
              variant="negative"
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-app-muted">
            Wealth projections are hidden because this decision isn&apos;t primarily financial.
            Open the Future cards or AI analysis tabs for outcome-focused insights.
          </p>
        )}
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center gap-2">
          <PieChart className="h-4 w-4 text-teal-900" />
          <p className="overline">Outcome distribution</p>
        </div>
        <ProbabilityStackBar probabilities={probabilities} />
      </div>
    </div>
  );
}
