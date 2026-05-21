import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { BranchingFuturesTree } from '../components/BranchingFuturesTree';
import { GitBranch } from 'lucide-react';
import { VisualPageHeader } from '../components/layout/VisualPageHeader';
import { useSimulation } from '../contexts/SimulationContext';
import { ensureFullResult } from '../lib/resultCompat';
import { buildFutureTreeFromResult } from '../lib/futureTree';
import { buildParallelFutureTree } from '../lib/futureTree';

export function BranchesPage() {
  const { result, parallelComparison } = useSimulation();

  const tree = useMemo(() => {
    if (parallelComparison?.futureTree) {
      return parallelComparison.futureTree;
    }
    if (parallelComparison) {
      return buildParallelFutureTree(parallelComparison);
    }
    if (result) {
      const full = ensureFullResult(result);
      return full.futureTree ?? buildFutureTreeFromResult(full);
    }
    return null;
  }, [result, parallelComparison]);

  if (!tree) {
    return (
      <div className="w-full">
        <VisualPageHeader
          icon={GitBranch}
          title="Branches"
          accent="border-violet-200 bg-violet-50 text-violet-600"
        />
        <section className="card flex min-h-[40vh] flex-col items-center justify-center p-10 text-center">
          <h2 className="text-lg font-medium text-app-text">No tree yet</h2>
          <p className="mt-2 max-w-md text-sm text-app-muted">
            Run a simulation on Decide, or compare two universes on Parallel mode.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/decide" className="btn-primary">
              Go to Decide
            </Link>
            <Link to="/parallel" className="btn-secondary">
              Parallel universe
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full">
      <VisualPageHeader
        icon={GitBranch}
        title="Branches"
        accent="border-violet-200 bg-violet-50 text-violet-600"
      />
      <BranchingFuturesTree
        tree={tree}
        title={
          parallelComparison
            ? 'Parallel universe tree'
            : 'Your simulated futures'
        }
        probabilities={
          parallelComparison
            ? undefined
            : result
              ? ensureFullResult(result).probabilities
              : undefined
        }
        aiSource={
          parallelComparison?.aiSource ??
          (result ? ensureFullResult(result).summary.aiSource : undefined)
        }
      />
    </div>
  );
}
