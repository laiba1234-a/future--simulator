import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { VisualPageHeader } from '../components/layout/VisualPageHeader';
import { ParallelUniverseView } from '../components/ParallelUniverseView';
import { useSimulation } from '../contexts/SimulationContext';

export function ParallelPage() {
  const {
    parallel,
    parallelComparison,
    isParallelRunning,
    setParallel,
    runParallelCompare,
  } = useSimulation();

  return (
    <div className="w-full">
      <VisualPageHeader
        icon={Sparkles}
        title="Parallel"
        accent="border-sky-300 bg-sky-100 text-sky-900"
      />

      <ParallelUniverseView
        comparison={parallelComparison}
        parallel={parallel}
        isRunning={isParallelRunning}
        onChange={setParallel}
        onCompare={runParallelCompare}
      />

      <p className="mt-6 text-center text-sm text-app-muted">
        Need full inputs first?{' '}
        <Link to="/decide" className="font-medium text-app-accent hover:underline">
              Set up on Decide
        </Link>
      </p>
    </div>
  );
}
