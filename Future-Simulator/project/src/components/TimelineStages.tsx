import { Calendar } from 'lucide-react';
import { getAiProvider, isGrokConfigured } from '../lib/grok';
import type { ScenarioTier, SimulationResult, TimelineStage } from '../types';

const TIER_BORDER: Record<ScenarioTier, string> = {
  best: 'border-l-emerald-700',
  average: 'border-l-zinc-600',
  worst: 'border-l-rose-800',
};

function StageBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="overline mb-1.5">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-xs leading-relaxed text-app-muted">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StageCard({ stage, tier }: { stage: TimelineStage; tier: ScenarioTier }) {
  return (
    <article className={`card-inset border-l-2 ${TIER_BORDER[tier]} p-4`}>
      <span className="text-xs font-medium text-app-muted">{stage.label}</span>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StageBlock title="Events" items={stage.events} />
        <StageBlock title="Consequences" items={stage.consequences} />
        <StageBlock title="Emotional" items={stage.emotionalChanges} />
        <StageBlock title="Opportunities" items={stage.opportunities} />
        <StageBlock title="Risks" items={stage.risks} />
      </div>
    </article>
  );
}

export function TimelineStages({
  timeline,
  tier,
  aiSource,
  aiError,
}: {
  timeline: TimelineStage[];
  tier: ScenarioTier;
  aiSource?: SimulationResult['summary']['aiSource'];
  aiError?: string;
}) {
  const grokReady = isGrokConfigured();
  const showTemplateHint = aiSource !== 'grok';
  const providerLabel = getAiProvider() === 'groq' ? 'Groq' : 'Grok';

  return (
    <div>
      <h4 className="mb-3 flex items-center gap-2 overline">
        <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
        Staged timeline
        {aiSource === 'grok' && (
          <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-medium text-teal-900">
            {providerLabel}
          </span>
        )}
      </h4>
      {showTemplateHint && (
        <p className="alert-warning alert-warning-text mb-3 px-3 py-2">
          {grokReady ? (
            <>
              Template timelines shown — AI did not personalize this run.
              {aiError ? ` Error: ${aiError}` : ' Check the browser console (F12), restart npm run dev, then simulate again.'}
              {getAiProvider() === 'groq' && (
                <span className="mt-1 block">
                  Your key is a Groq key (gsk_…); the app now routes to Groq automatically.
                </span>
              )}
            </>
          ) : (
            'Add GROK_API_KEY (xAI xai-… or Groq gsk_…) to project/.env, restart npm run dev, then run a new simulation.'
          )}
        </p>
      )}
      <div className="space-y-3">
        {timeline.map((stage) => (
          <StageCard key={stage.marker} stage={stage} tier={tier} />
        ))}
      </div>
    </div>
  );
}
