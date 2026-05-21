import { createClient } from '@supabase/supabase-js';
import type { SavedSimulation, SimulationResult } from '../types';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase = supabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null;

export function getAuthRedirectUrl(): string {
  return window.location.origin;
}

const STORAGE_KEY = 'future-simulator:history';

export function loadLocalHistory(): SavedSimulation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedSimulation[];
  } catch {
    return [];
  }
}

export function saveLocalHistory(items: SavedSimulation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 12)));
}

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function fetchHistory(): Promise<{
  items: SavedSimulation[];
  source: 'cloud' | 'local';
}> {
  if (!supabase) {
    return { items: loadLocalHistory(), source: 'local' };
  }

  const userId = await currentUserId();
  if (!userId) {
    return { items: loadLocalHistory(), source: 'local' };
  }

  const { data, error } = await supabase
    .from('simulations')
    .select('id, label, created_at, payload')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(12);

  if (error || !data) {
    return { items: loadLocalHistory(), source: 'local' };
  }

  return {
    items: data as SavedSimulation[],
    source: 'cloud',
  };
}

export async function persistSimulation(
  result: SimulationResult,
  label: string
): Promise<'cloud' | 'local'> {
  const entry: SavedSimulation = {
    id: result.id,
    label,
    created_at: result.createdAt,
    payload: result,
  };

  if (!supabase) {
    const items = loadLocalHistory().filter((s) => s.id !== entry.id);
    saveLocalHistory([entry, ...items]);
    return 'local';
  }

  const userId = await currentUserId();
  if (!userId) {
    const items = loadLocalHistory().filter((s) => s.id !== entry.id);
    saveLocalHistory([entry, ...items]);
    return 'local';
  }

  const { error } = await supabase.from('simulations').insert({
    id: entry.id,
    label: entry.label,
    created_at: entry.created_at,
    payload: entry.payload,
    user_id: userId,
  });

  if (error) {
    const items = loadLocalHistory().filter((s) => s.id !== entry.id);
    saveLocalHistory([entry, ...items]);
    return 'local';
  }

  return 'cloud';
}
