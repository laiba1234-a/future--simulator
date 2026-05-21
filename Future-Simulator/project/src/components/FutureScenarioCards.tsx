import type {
  EnrichedScenarioCard,
  ProbabilityScores,
  ScenarioTier,
  SimulationResult,
} from '../types';
import { TimelineStages } from './TimelineStages';

const CARD_STYLES: Record<ScenarioTier, { accent: string; bar: string }> = {
  best: {
    accent: 'border-l-emerald-500',
    bar: 'bg-emerald-600',
  },
  average: {
    accent: 'border-l-sky-500',
    bar: 'bg-sky-600',
  },
  worst: {
    accent: 'border-l-rose-500',
    bar: 'bg-rose-600',
  },
};

function SectionList({
  title,
  items,
}: {
  title: string;
  items: string[] | undefined;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="card-inset p-3">
      <p className="overline">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-sm leading-relaxed text-app-muted">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScenarioCard({
  card,
  aiSource,
  aiError,
}: {
  card: EnrichedScenarioCard;
  aiSource?: SimulationResult['summary']['aiSource'];
  aiError?: string;
}) {
  const style = CARD_STYLES[card.tier];

  return (
    <article className={`card border-l-4 ${style.accent} p-5`}>
      <header className="mb-5 border-b border-app-border pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight text-app-text">
            {card.title}
          </h3>
          <span className="font-mono text-sm tabular-nums text-app-muted">
            {card.probability}%
          </span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-sm bg-app-border">
          <div
            className={`h-full ${style.bar}`}
            style={{ width: `${card.probability}%` }}
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-app-muted">{card.summary}</p>
      </header>

      <div className="space-y-4">
        <div>
          <p className="overline mb-3">Timeline</p>
          <TimelineStages
            timeline={card.timeline}
            tier={card.tier}
            aiSource={aiSource}
            aiError={aiError}
          />
        </div>

        <SectionList title="Key events" items={card.keyEvents} />
        <SectionList title="Opportunities" items={card.opportunities} />
        <SectionList title="Challenges" items={card.challenges} />
        <SectionList title="Failure triggers" items={card.failureTriggers} />
        <SectionList title="Risks" items={card.risks} />
        <SectionList title="Recovery options" items={card.recoveryPossibilities} />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card-inset p-3">
            <p className="overline">
              {card.tier === 'worst' ? 'Emotional impact' : 'Emotional outcome'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-app-muted">
              {card.emotionalImpact ?? card.emotionalOutcome}
            </p>
          </div>
          <div className="card-inset p-3">
            <p className="overline">Final result</p>
            <p className="mt-2 text-sm leading-relaxed text-app-muted">
              {card.finalResult}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function FutureScenarioCards({
  enriched,
  probabilities,
  aiSource,
  aiError,
}: {
  enriched: {
    best: EnrichedScenarioCard;
    average: EnrichedScenarioCard;
    worst: EnrichedScenarioCard;
  };
  probabilities: ProbabilityScores;
  aiSource?: SimulationResult['summary']['aiSource'];
  aiError?: string;
}) {
  const cards = [enriched.best, enriched.average, enriched.worst];

  return (
    <section className="space-y-6">
      <div className="card p-4">
        <p className="overline">Distribution</p>
        <div className="mt-3 flex h-2 overflow-hidden rounded-sm bg-app-border">
          <div className="bg-emerald-600" style={{ width: `${probabilities.best}%` }} />
          <div className="bg-sky-600" style={{ width: `${probabilities.average}%` }} />
          <div className="bg-rose-600" style={{ width: `${probabilities.worst}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs text-app-muted">
          <span>Best {probabilities.best}%</span>
          <span>Likely {probabilities.average}%</span>
          <span>Worst {probabilities.worst}%</span>
        </div>
      </div>

      <div className="space-y-6">
        {cards.map((card) => (
          <ScenarioCard key={card.tier} card={card} aiSource={aiSource} aiError={aiError} />
        ))}
      </div>
    </section>
  );
}
