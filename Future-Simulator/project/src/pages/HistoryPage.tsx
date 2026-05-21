import { History } from 'lucide-react';
import { VisualPageHeader } from '../components/layout/VisualPageHeader';
import { HistoryPanel } from '../components/HistoryPanel';
import { MemoryContextPanel } from '../components/MemoryContextPanel';
import { useSimulation } from '../contexts/SimulationContext';
import { ensureFullResult } from '../lib/resultCompat';

export function HistoryPage() {
  const {
    history,
    historySource,
    memory,
    result,
    loadSimulation,
    deleteHistoryItem,
  } = useSimulation();

  const referencesUsed = result
    ? ensureFullResult(result).memoryContext.referencesUsed
    : [];

  return (
    <div className="w-full">
      <VisualPageHeader
        icon={History}
        title="History"
        accent="border-amber-300 bg-amber-50 text-amber-900"
      />

      <div className="space-y-6">
        <HistoryPanel
          items={history}
          source={historySource}
          onLoad={loadSimulation}
          onDelete={deleteHistoryItem}
        />
        <MemoryContextPanel memory={memory} referencesUsed={referencesUsed} />
      </div>
    </div>
  );
}
