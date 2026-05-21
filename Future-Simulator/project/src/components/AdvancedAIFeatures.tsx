import type { ReactNode } from 'react';
import type { AdvancedAIAnalysis } from '../types';
import { BranchingTimeline } from './BranchingTimeline';

interface AdvancedAIFeaturesProps {
  analysis: AdvancedAIAnalysis;
}

export function AdvancedAIFeatures({ analysis }: AdvancedAIFeaturesProps) {
  return (
    <section className="card p-6">
      <header className="mb-6 border-b border-app-border pb-4">
        <p className="overline">Detailed analysis</p>
        <h3 className="mt-1 text-base font-medium text-app-text">
          Behavioral, risk, and strategic factors
        </h3>
      </header>

      {analysis.memoryReferences.length > 0 && (
        <div className="card-inset mb-6 p-4">
          <p className="overline">Historical context</p>
          <ul className="mt-3 space-y-2">
            {analysis.memoryReferences.map((ref) => (
              <li key={ref} className="text-sm text-app-muted">
                {ref}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnalysisBlock title="Personality profile">
          <p className="text-sm text-app-muted">{analysis.personalityProfile.summary}</p>
          <ul className="mt-2 space-y-1">
            {analysis.personalityProfile.traits.map((t) => (
              <li key={t} className="text-xs text-app-muted">
                {t}
              </li>
            ))}
          </ul>
        </AnalysisBlock>

        <AnalysisBlock title="Risk score">
          <p className="font-mono text-2xl font-semibold tabular-nums text-app-text">
            {analysis.riskProfileScore}
            <span className="text-sm font-normal text-app-muted"> / 100</span>
          </p>
          <p className="mt-2 text-xs text-app-muted">{analysis.riskLabel}</p>
        </AnalysisBlock>

        <AnalysisBlock title="Confidence estimate">
          <p className="font-mono text-2xl font-semibold tabular-nums text-app-text">
            {analysis.confidenceEstimate}%
          </p>
          <p className="mt-2 text-xs text-app-muted">
            Weighted likelihood given current inputs
          </p>
        </AnalysisBlock>
      </div>

      <div className="mb-6">
        <p className="overline mb-3">Recommendations</p>
        <ul className="space-y-2">
          {analysis.strategicAdvice.map((tip) => (
            <li key={tip} className="card-inset px-4 py-3 text-sm text-app-muted">
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <p className="overline mb-4">Emotional trajectory</p>
        <div className="space-y-0 border-l border-app-border pl-4">
          {analysis.emotionalTrajectory.map((point) => (
            <div key={point.phase} className="relative pb-5 last:pb-0">
              <span className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-app-muted" />
              <p className="text-xs font-medium text-app-muted">{point.phase}</p>
              <p className="text-sm font-medium text-app-text">{point.emotion}</p>
              <p className="text-xs text-app-muted">{point.driver}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="overline mb-2">Outcome sensitivity</p>
        <p className="text-sm leading-relaxed text-app-muted">
          {analysis.whatChangedOutcome}
        </p>
      </div>

      <BranchingTimeline branches={analysis.scenarioBranches} />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {analysis.outcomeDrivers.map((d) => (
          <div key={d.factor} className="card-inset p-3">
            <p className="text-sm font-medium text-app-text">{d.factor}</p>
            <p className="mt-1 text-xs text-app-muted">{d.explanation}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Footnote title="Relationships" text={analysis.relationshipImpact} />
        <Footnote title="Financial outlook" text={analysis.financialProjection} />
        <Footnote title="Career" text={analysis.careerTrajectory} />
        <Footnote title="Long-term alignment" text={analysis.lifeMapInsight} />
      </div>
    </section>
  );
}

function AnalysisBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="card-inset p-4">
      <p className="overline">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Footnote({ title, text }: { title: string; text: string }) {
  return (
    <div className="card-inset p-3">
      <p className="overline">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-app-muted">{text}</p>
    </div>
  );
}
