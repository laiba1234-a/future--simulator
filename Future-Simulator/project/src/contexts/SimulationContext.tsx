import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { buildDecisionLabel } from '../lib/decisionMapping';
import {
  createEmptyMemory,
  loadMemory,
  recordSimulationInMemory,
} from '../lib/memoryStore';
import { DEFAULT_PARALLEL, runParallelUniverseAsync } from '../lib/parallelUniverse';
import { DEFAULT_INPUT, runSimulationAsync } from '../lib/simulation';
import {
  fetchHistory,
  persistSimulation,
  saveLocalHistory,
} from '../lib/supabase';
import type {
  DecisionInput,
  ParallelUniverseComparison,
  ParallelUniverseInput,
  SavedSimulation,
  SimulationResult,
  UserMemoryStore,
} from '../types';
import { useAuth } from './AuthContext';

interface SimulationContextValue {
  decision: DecisionInput;
  result: SimulationResult | null;
  memory: UserMemoryStore;
  history: SavedSimulation[];
  historySource: 'cloud' | 'local';
  isRunning: boolean;
  saveLabel: string;
  storageHint: string;
  setDecision: (patch: Partial<DecisionInput>) => void;
  simulate: () => void;
  resetDecision: () => void;
  saveResult: () => Promise<void>;
  loadSimulation: (item: SavedSimulation) => void;
  deleteHistoryItem: (id: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
  parallel: ParallelUniverseInput;
  parallelComparison: ParallelUniverseComparison | null;
  isParallelRunning: boolean;
  setParallel: (patch: Partial<ParallelUniverseInput>) => void;
  runParallelCompare: () => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [decision, setDecisionState] = useState<DecisionInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [memory, setMemory] = useState<UserMemoryStore>(createEmptyMemory);
  const [history, setHistory] = useState<SavedSimulation[]>([]);
  const [historySource, setHistorySource] = useState<'cloud' | 'local'>('local');
  const [isRunning, setIsRunning] = useState(false);
  const [parallel, setParallelState] = useState<ParallelUniverseInput>(DEFAULT_PARALLEL);
  const [parallelComparison, setParallelComparison] =
    useState<ParallelUniverseComparison | null>(null);
  const [isParallelRunning, setIsParallelRunning] = useState(false);
  const [saveLabel, setSaveLabel] = useState('Save run');
  const [storageHint, setStorageHint] = useState(
    user
      ? 'Runs are saved to your account in Supabase.'
      : 'Sign in to sync runs to the cloud, or they stay in this browser.'
  );

  const refreshHistory = useCallback(async () => {
    const { items, source } = await fetchHistory();
    setHistory(items);
    setHistorySource(source);
  }, []);

  useEffect(() => {
    refreshHistory();
    setMemory(loadMemory());
  }, [refreshHistory, user]);

  useEffect(() => {
    setStorageHint(
      user
        ? 'Runs are saved to your account in Supabase.'
        : 'Sign in to sync runs to the cloud, or they stay in this browser.'
    );
  }, [user]);

  const setDecision = useCallback((patch: Partial<DecisionInput>) => {
    setDecisionState((prev) => ({ ...prev, ...patch }));
  }, []);

  const simulate = useCallback(() => {
    setIsRunning(true);
    void (async () => {
      try {
        const simulation = await runSimulationAsync(decision);
        const label = buildDecisionLabel(decision);
        const updatedMemory = recordSimulationInMemory(simulation, label);
        setMemory(updatedMemory);
        setResult(simulation);
        navigate('/results');
      } catch (err) {
        console.error('[simulate]', err);
      } finally {
        setIsRunning(false);
      }
    })();
  }, [decision, navigate]);

  const resetDecision = useCallback(() => {
    setDecisionState(DEFAULT_INPUT);
    setResult(null);
  }, []);

  const saveResult = useCallback(async () => {
    if (!result) return;
    setSaveLabel('Saving...');
    const where = await persistSimulation(result, buildDecisionLabel(decision));
    await refreshHistory();
    setSaveLabel(where === 'cloud' ? 'Saved to cloud' : 'Saved locally');
    setStorageHint(
      where === 'cloud'
        ? 'Stored in your Supabase account.'
        : 'Stored in this browser. Sign in for cloud sync.'
    );
    window.setTimeout(() => setSaveLabel('Save run'), 2000);
  }, [result, decision, refreshHistory]);

  const loadSimulation = useCallback(
    (item: SavedSimulation) => {
      const payload = item.payload;
      if (payload.decision) {
        setDecisionState(payload.decision);
      }
      setResult(payload);
      navigate('/results');
    },
    [navigate]
  );

  const setParallel = useCallback((patch: Partial<ParallelUniverseInput>) => {
    setParallelState((prev) => ({ ...prev, ...patch }));
  }, []);

  const runParallelCompare = useCallback(() => {
    setIsParallelRunning(true);
    void (async () => {
      try {
        const comparison = await runParallelUniverseAsync(decision, parallel);
        setParallelComparison(comparison);
        setResult(comparison.resultA);
        navigate('/parallel');
      } catch (err) {
        console.error('[parallel]', err);
      } finally {
        setIsParallelRunning(false);
      }
    })();
  }, [decision, parallel, navigate]);

  const deleteHistoryItem = useCallback(
    async (id: string) => {
      const next = history.filter((item) => item.id !== id);
      saveLocalHistory(next);
      setHistory(next);
      setHistorySource('local');
    },
    [history]
  );

  const value = useMemo(
    () => ({
      decision,
      result,
      memory,
      history,
      historySource,
      isRunning,
      saveLabel,
      storageHint,
      setDecision,
      simulate,
      resetDecision,
      saveResult,
      loadSimulation,
      deleteHistoryItem,
      refreshHistory,
      parallel,
      parallelComparison,
      isParallelRunning,
      setParallel,
      runParallelCompare,
    }),
    [
      decision,
      result,
      memory,
      history,
      historySource,
      isRunning,
      saveLabel,
      storageHint,
      setDecision,
      simulate,
      resetDecision,
      saveResult,
      loadSimulation,
      deleteHistoryItem,
      refreshHistory,
      parallel,
      parallelComparison,
      isParallelRunning,
      setParallel,
      runParallelCompare,
    ]
  );

  return (
    <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
  );
}

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error('useSimulation must be used within SimulationProvider');
  }
  return ctx;
}
