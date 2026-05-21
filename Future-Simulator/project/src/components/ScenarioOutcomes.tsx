import { useState } from 'react';
import { useScrollToTopOnChange } from '../hooks/useScrollToTopOnChange';
import { ChevronRight } from 'lucide-react';
import type {
  ScenarioCase,
  ScenarioOutcomes as ScenarioOutcomesType,
  ScenarioTier,
  SimulationResult,
} from '../types';
import { TimelineStages } from './TimelineStages';

type ViewMode = 'timeline' | 'domains' | 'chains';

const TABS: { tier: ScenarioTier; label: string }[] = [
  { tier: 'best', label: 'Best case' },
  { tier: 'average', label: 'Average case' },
  { tier: 'worst', label: 'Worst case' },
];

const TIER_ACTIVE: Record<ScenarioTier, string> = {
  best: 'border-emerald-500/50 bg-emerald-100 text-emerald-900',
  average: 'border-sky-400/50 bg-sky-100 text-sky-900',
  worst: 'border-rose-500/50 bg-rose-100 text-rose-900',
};

const TRAJECTORY_LABEL: Record<string, string> = {
  up: '↑ Improving',
  steady: '→ Stable',
  down: '↓ Declining',
  volatile: '↕ Volatile',
};

function ScenarioDetail({
  scenario,
  tier,
  view,
  aiSource,
  aiError,
}: {
  scenario: ScenarioCase;
  tier: ScenarioTier;
  view: ViewMode;
  aiSource?: SimulationResult['summary']['aiSource'];
  aiError?: string;
}) {
  return (
    <div className="space-y-6">
      <p className="card-inset px-4 py-3 text-sm leading-relaxed text-app-muted">
        {scenario.summary}
      </p>

      {view === 'timeline' && (
        <TimelineStages
          timeline={scenario.timeline}
          tier={tier}
          aiSource={aiSource}
          aiError={aiError}
        />
      )}

      {view === 'chains' && (
        <div className="space-y-4">
          {scenario.chainReactions.map((chain) => (
            <div key={chain.trigger} className="card-inset p-4">
              <p className="text-sm font-medium text-app-text">{chain.trigger}</p>
              <ol className="mt-3 space-y-2">
                {chain.cascade.map((step) => (
                  <li
                    key={step}
                    className="flex items-start gap-2 text-sm text-app-muted"
                  >
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-app-muted" />
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-3 border-t border-app-border pt-3 text-xs text-app-muted">
                <span className="font-medium text-app-text">Why: </span>
                {chain.why}
              </p>
            </div>
          ))}
        </div>
      )}

      {view === 'domains' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {scenario.domains.map((d) => (
            <div key={d.id} className="card-inset p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-app-text">{d.label}</span>
                <span className="text-[10px] text-app-muted">
                  {TRAJECTORY_LABEL[d.trajectory]}
                </span>
              </div>
              <p className="mt-2 text-sm text-app-muted">{d.state}</p>
              <p className="mt-2 text-xs text-app-muted">
                <span className="font-medium text-app-text">Why: </span>
                {d.why}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScenarioOutcomes({
  scenarios,
  aiSource,
  aiError,
}: {
  scenarios: ScenarioOutcomesType;
  aiSource?: SimulationResult['summary']['aiSource'];
  aiError?: string;
}) {
  const [active, setActive] = useState<ScenarioTier>('average');
  const [view, setView] = useState<ViewMode>('timeline');
  useScrollToTopOnChange(`${active}:${view}`);

  const scenarioMap = {
    best: scenarios.best,
    average: scenarios.average,
    worst: scenarios.worst,
  };

  return (
    <section className="card p-6">
      <div className="mb-6">
        <p className="overline">Consequence simulation</p>
        <h3 className="mt-1 text-lg font-medium text-app-text">{scenarios.pathLabel}</h3>
      </div>

      <div className="card-inset mb-4 p-4">
        <p className="overline mb-2">Inputs driving these futures</p>
        <ul className="space-y-1">
          {scenarios.drivingFactors.map((f) => (
            <li key={f} className="text-xs leading-relaxed text-app-muted">
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {TABS.map(({ tier, label }) => (
          <button
            key={tier}
            type="button"
            onClick={() => setActive(tier)}
            className={`rounded-md border px-4 py-2 text-sm transition ${
              active === tier
                ? TIER_ACTIVE[tier]
                : 'border-app-border text-app-muted hover:text-app-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-6 inline-flex gap-1 rounded-lg border border-app-border bg-app-bg p-1">
        {(
          [
            { id: 'timeline' as const, label: 'Timeline' },
            { id: 'domains' as const, label: '10 domains' },
            { id: 'chains' as const, label: 'Chain reactions' },
          ] as const
        ).map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={`nav-tab ${view === v.id ? 'nav-tab-active' : ''}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <ScenarioDetail
        scenario={scenarioMap[active]}
        tier={active}
        view={view}
        aiSource={aiSource}
        aiError={aiError}
      />
    </section>
  );
}
