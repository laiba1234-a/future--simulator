import { Link } from 'react-router-dom';
import { DecisionInputForm } from '../components/DecisionInputForm';
import { GuestAuthBanner } from '../components/GuestAuthBanner';
import { HistoryPanel } from '../components/HistoryPanel';
import { VisualPageHeader } from '../components/layout/VisualPageHeader';
import { PageMotion } from '../components/visuals/PageMotion';
import { PenLine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSimulation } from '../contexts/SimulationContext';
import { supabaseConfigured } from '../lib/supabase';

interface DecidePageProps {
  onSignIn: () => void;
}

export function DecidePage({ onSignIn }: DecidePageProps) {
  const { user } = useAuth();
  const {
    decision,
    setDecision,
    simulate,
    resetDecision,
    isRunning,
    result,
    history,
    historySource,
    loadSimulation,
    deleteHistoryItem,
  } = useSimulation();

  return (
    <PageMotion className="w-full">
      <VisualPageHeader
        icon={PenLine}
        title="Decide"
        accent="border-sky-300 bg-gradient-to-br from-sky-100 to-blue-50 text-sky-900 shadow-glow-sky"
      />

      {!user && supabaseConfigured && (
        <div className="mb-6 w-full">
          <GuestAuthBanner onEmailSignIn={onSignIn} />
        </div>
      )}

      <DecisionInputForm
        decision={decision}
        onChange={setDecision}
        onSimulate={simulate}
        onReset={resetDecision}
        isRunning={isRunning}
      />

      <div className="mt-6 w-full">
        <HistoryPanel
          items={history}
          source={historySource}
          onLoad={loadSimulation}
          onDelete={deleteHistoryItem}
        />
      </div>

      {result && (
        <p className="mt-6 text-center text-sm text-app-muted">
          Already have results?{' '}
          <Link to="/results" className="font-medium text-app-accent hover:underline">
            View your futures
          </Link>
        </p>
      )}
    </PageMotion>
  );
}
