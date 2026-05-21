import {
  GitBranch,
  Layers,
  LayoutGrid,
  LineChart,
  Network,
  PenLine,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { isFinancialDecision } from '../lib/decisionTopics';
import { Link } from 'react-router-dom';
import { VisualPageHeader } from '../components/layout/VisualPageHeader';
import { PageMotion } from '../components/visuals/PageMotion';
import { SequentialTabNav } from '../components/layout/SequentialTabNav';
import { ResultsSummary } from '../components/results/ResultsSummary';
import { AdvancedAIFeatures } from '../components/AdvancedAIFeatures';
import { FutureScenarioCards } from '../components/FutureScenarioCards';
import { MemoryContextPanel } from '../components/MemoryContextPanel';
import { ScenarioOutcomes } from '../components/ScenarioOutcomes';
import { Timeline } from '../components/Timeline';
import { BranchingFuturesTree } from '../components/BranchingFuturesTree';
import { buildFutureTreeFromResult } from '../lib/futureTree';
import { useSimulation } from '../contexts/SimulationContext';
import { ensureFullResult } from '../lib/resultCompat';
import { InsightIconGrid } from '../components/visuals/OutcomeCharts';

type ResultsTab =
  | 'overview'
  | 'scenarios'
  | 'domains'
  | 'branches'
  | 'insights'
  | 'wealth';

const ALL_TABS: { id: ResultsTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'scenarios', label: 'Future cards', icon: Layers },
  { id: 'domains', label: 'Domains', icon: Network },
  { id: 'branches', label: 'Branches', icon: GitBranch },
  { id: 'insights', label: 'AI analysis', icon: Sparkles },
  { id: 'wealth', label: 'Wealth chart', icon: LineChart },
];

export function ResultsPage() {
  const { result, memory, saveResult, saveLabel, storageHint } = useSimulation();
  const [tab, setTab] = useState<ResultsTab>('overview');

  const showWealth = result
    ? isFinancialDecision(ensureFullResult(result).decision)
    : false;
  const tabs = useMemo(
    () => ALL_TABS.filter((t) => t.id !== 'wealth' || showWealth),
    [showWealth]
  );

  useEffect(() => {
    if (!showWealth && tab === 'wealth') {
      setTab('overview');
    }
  }, [showWealth, tab]);

  const tabIndex = tabs.findIndex((t) => t.id === tab);
  const goNext = () => {
    if (tabIndex < tabs.length - 1) setTab(tabs[tabIndex + 1].id);
  };
  const goBack = () => {
    if (tabIndex > 0) setTab(tabs[tabIndex - 1].id);
  };

  if (!result) {
    return (
      <section className="card flex min-h-[40vh] flex-col items-center justify-center p-10 text-center">
        <LineChart className="mb-4 h-10 w-10 text-app-muted" strokeWidth={1.5} />
        <h2 className="text-lg font-medium text-app-text">No results yet</h2>
        <p className="mt-2 max-w-sm text-sm text-app-muted">
          Complete your inputs on the Decide page, then run a simulation.
        </p>
        <Link to="/decide" className="btn-primary mt-6">
          <PenLine className="h-4 w-4" />
          Go to Decide
        </Link>
      </section>
    );
  }

  const full = ensureFullResult(result);
  const {
    enrichedScenarios,
    probabilities,
    advancedAnalysis,
    snapshots,
    scenarios,
    summary,
    memoryContext,
  } = full;

  const futureTree =
    full.futureTree ?? buildFutureTreeFromResult(full);

  return (
    <PageMotion className="w-full">
      <VisualPageHeader
        icon={LineChart}
        title="Results"
        accent="border-emerald-300 bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-900 shadow-glow-emerald"
      />

      <SequentialTabNav
        tabs={tabs}
        active={tab}
        onSelect={setTab}
        onContinue={goNext}
        onBack={goBack}
        continueLabel={
          tabIndex < tabs.length - 1
            ? `Continue to ${tabs[tabIndex + 1]?.label}`
            : undefined
        }
        hint="Walk the full report in order"
      />

      <div className="mt-6">
        {tab === 'overview' && (
          <div className="space-y-6">
            <ResultsSummary
              result={result}
              onSave={saveResult}
              saveLabel={saveLabel}
              storageHint={storageHint}
            />
            <MemoryContextPanel
              memory={memory}
              referencesUsed={memoryContext.referencesUsed}
            />
            <InsightIconGrid insights={summary.insights} />
          </div>
        )}

        {tab === 'scenarios' && (
          <FutureScenarioCards
            enriched={enrichedScenarios}
            probabilities={probabilities}
            aiSource={summary.aiSource}
            aiError={summary.aiError}
          />
        )}

        {tab === 'domains' && (
          <ScenarioOutcomes
            scenarios={scenarios}
            aiSource={summary.aiSource}
            aiError={summary.aiError}
          />
        )}

        {tab === 'branches' && (
          <div className="space-y-4">
            <Link to="/branches" className="btn-secondary inline-flex text-sm">
              <GitBranch className="h-4 w-4" />
              Open full-screen branch view
            </Link>
            <BranchingFuturesTree
              tree={futureTree}
              probabilities={probabilities}
              aiSource={summary.aiSource}
            />
          </div>
        )}

        {tab === 'insights' && (
          <div className="space-y-6">
            {memoryContext.referencesUsed.length > 0 && (
              <div className="card-inset p-4">
                <p className="overline">Memory from past runs</p>
                <ul className="mt-3 space-y-2">
                  {memoryContext.referencesUsed.map((ref) => (
                    <li key={ref} className="text-sm text-app-muted">
                      {ref}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <AdvancedAIFeatures analysis={advancedAnalysis} />
          </div>
        )}

        {tab === 'wealth' && <Timeline snapshots={snapshots} />}
      </div>
    </PageMotion>
  );
}
