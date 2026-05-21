import type { UserMemoryStore } from '../types';

interface MemoryContextPanelProps {
  memory: UserMemoryStore;
  referencesUsed: string[];
}

export function MemoryContextPanel({
  memory,
  referencesUsed,
}: MemoryContextPanelProps) {
  const { profile, decisionTimeline, scenarioSummaries, conversations } = memory;

  return (
    <section className="card p-5">
      <p className="overline">Session memory</p>
      <p className="mt-1 text-sm text-app-muted">
        Patterns retained across analyses on this device.
      </p>

      {referencesUsed.length > 0 && (
        <div className="card-inset mt-4 p-3">
          <p className="text-xs font-medium text-app-text">Active references</p>
          <ul className="mt-2 space-y-1">
            {referencesUsed.map((ref) => (
              <li key={ref} className="text-sm text-app-muted">
                {ref}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card-inset p-3">
          <p className="overline">Profile</p>
          <p className="mt-2 text-sm text-app-text">
            {profile.riskBehavior.simulationsCount} analyses · confidence avg{' '}
            {profile.riskBehavior.confidenceTrend}/10 · risk{' '}
            {profile.riskBehavior.averageTolerance}
          </p>
          {profile.longTermGoals[0] && (
            <p className="mt-2 text-xs text-app-muted">
              Goal: {profile.longTermGoals[0].slice(0, 80)}
              {profile.longTermGoals[0].length > 80 ? '…' : ''}
            </p>
          )}
        </div>

        <div className="card-inset p-3">
          <p className="overline">Decision log</p>
          {decisionTimeline.length === 0 ? (
            <p className="mt-2 text-xs text-app-muted">No entries yet.</p>
          ) : (
            <ul className="mt-2 max-h-24 space-y-1 overflow-y-auto">
              {decisionTimeline.slice(0, 4).map((e) => (
                <li key={e.id} className="text-xs text-app-muted">
                  {new Date(e.createdAt).toLocaleDateString()} — {e.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="overline mb-2">Scenario history</p>
        {scenarioSummaries.length === 0 ? (
          <p className="text-xs text-app-muted">Populated after your first simulation.</p>
        ) : (
          <ul className="space-y-1">
            {scenarioSummaries.slice(0, 5).map((s) => (
              <li
                key={s.id}
                className="rounded border border-app-border/80 px-2 py-1.5 text-xs text-app-muted"
              >
                {s.label} — {s.averageProbability}% likely
              </li>
            ))}
          </ul>
        )}
      </div>

      {conversations.length > 0 && (
        <div className="mt-4 border-t border-app-border pt-4">
          <p className="overline mb-2">Recent exchanges</p>
          <ul className="max-h-20 space-y-1 overflow-y-auto">
            {conversations.slice(0, 2).map((c) => (
              <li key={c.id} className="text-xs text-app-muted">
                <span className="text-app-muted">{c.role}: </span>
                {c.content.slice(0, 100)}
                {c.content.length > 100 ? '…' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
