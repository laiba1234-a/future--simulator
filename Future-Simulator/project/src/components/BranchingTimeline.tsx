import { GitBranch } from 'lucide-react';
import type { ScenarioBranch, ScenarioTier } from '../types';
import { TierIconBadge, tierIcon } from './visuals/OutcomeCharts';

export function BranchingTimeline({ branches }: { branches: ScenarioBranch[] }) {
  return (
    <div className="card-inset p-4">
      <div className="mb-4 flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-teal-900" />
        <p className="overline">Scenario branches</p>
      </div>
      <div className="space-y-4">
        {branches.map((branch) => {
          const tier = (branch.parentTier ?? 'average') as ScenarioTier;
          const TierIcon = tierIcon(tier);
          return (
            <div
              key={branch.id}
              className="flex gap-4 border-b border-app-border/80 pb-4 last:border-0 last:pb-0"
            >
              <TierIconBadge tier={tier} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-medium text-app-text">
                    <TierIcon className="h-3.5 w-3.5 text-app-muted" />
                    {branch.label}
                  </p>
                  <span className="font-mono text-xs tabular-nums text-app-muted">
                    {branch.probability}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-app-border">
                  <div
                    className="h-full bg-gradient-to-r from-app-accent/80 to-app-accent transition-all"
                    style={{ width: `${Math.min(branch.probability, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-app-muted">{branch.outcome}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
