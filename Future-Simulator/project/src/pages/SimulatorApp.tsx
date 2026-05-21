import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { initAiConfig, subscribeAiConfig } from '../lib/grok';
import { AppShell } from '../components/layout/AppShell';
import { SimulationProvider } from '../contexts/SimulationContext';
import { DecidePage } from './DecidePage';
import { HistoryPage } from './HistoryPage';
import { BranchesPage } from './BranchesPage';
import { HomePage } from './HomePage';
import { ParallelPage } from './ParallelPage';
import { ResultsPage } from './ResultsPage';

interface SimulatorAppProps {
  onSignIn: () => void;
  onSignedOut?: () => void;
}

function AiConfigBootstrap() {
  const [, setRevision] = useState(0);

  useEffect(() => {
    initAiConfig();
    return subscribeAiConfig(() => setRevision((n) => n + 1));
  }, []);

  return null;
}

export function SimulatorApp({ onSignIn, onSignedOut }: SimulatorAppProps) {
  return (
    <SimulationProvider>
      <AiConfigBootstrap />
      <Routes>
        <Route
          element={<AppShell onSignIn={onSignIn} onSignedOut={onSignedOut} />}
        >
          <Route index element={<HomePage />} />
          <Route path="decide" element={<DecidePage onSignIn={onSignIn} />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="parallel" element={<ParallelPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </SimulationProvider>
  );
}
