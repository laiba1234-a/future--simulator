import type { YearSnapshot } from '../types';
import { formatCurrency } from '../lib/simulation';

interface TimelineProps {
  snapshots: YearSnapshot[];
}

export function Timeline({ snapshots }: TimelineProps) {
  const max = Math.max(
    ...snapshots.flatMap((s) => [s.optimistic, s.realistic, s.pessimistic]),
    1
  );

  const milestones = snapshots.filter((s) => s.milestone);

  return (
    <section className="card p-6">
      <h3 className="text-base font-medium text-app-text">Wealth trajectory</h3>
      <p className="mb-6 text-sm text-app-muted">
        Comparative projection across three outcome paths.
      </p>

      <div className="flex h-56 items-end gap-1 overflow-x-auto pb-2">
        {snapshots.map((snap) => (
          <div
            key={snap.year}
            className="group flex min-w-[28px] flex-1 flex-col items-center gap-1"
            title={`Year ${snap.year} (age ${snap.age})`}
          >
            <div className="relative flex h-44 w-full items-end justify-center gap-0.5">
              <div
                className="w-2 rounded-t bg-emerald-700/70"
                style={{ height: `${(snap.optimistic / max) * 100}%` }}
              />
              <div
                className="w-2 rounded-t bg-zinc-500"
                style={{ height: `${(snap.realistic / max) * 100}%` }}
              />
              <div
                className="w-2 rounded-t bg-rose-800/70"
                style={{ height: `${(snap.pessimistic / max) * 100}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-app-muted">
              {snap.year % 5 === 0 ? snap.year : ''}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-app-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-emerald-700/80" /> Optimistic
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-zinc-500" /> Baseline
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-rose-800/80" /> Conservative
        </span>
      </div>

      {milestones.length > 0 && (
        <div className="mt-8 border-t border-app-border pt-6">
          <p className="overline mb-3">Milestones</p>
          <ol className="space-y-3">
            {milestones.map((snap) => (
              <li key={`${snap.year}-${snap.milestone}`} className="flex gap-3 text-sm">
                <span className="font-mono text-xs text-app-muted">Y{snap.year}</span>
                <span className="flex-1 text-app-text">{snap.milestone}</span>
                <span className="font-mono text-xs text-app-muted">
                  {formatCurrency(snap.realistic)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
