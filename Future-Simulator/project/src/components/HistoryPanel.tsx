import { Trash2 } from 'lucide-react';
import type { SavedSimulation } from '../types';

interface HistoryPanelProps {
  items: SavedSimulation[];
  source: 'cloud' | 'local';
  onLoad: (item: SavedSimulation) => void;
  onDelete: (id: string) => void;
}

export function HistoryPanel({
  items,
  source,
  onLoad,
  onDelete,
}: HistoryPanelProps) {
  if (items.length === 0) {
    return (
      <section className="card p-6 text-center">
        <p className="text-sm text-app-muted">No saved runs yet.</p>
        <p className="mt-1 text-xs text-app-muted">
          Save a result from the Results overview to see it here.
        </p>
      </section>
    );
  }

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-app-text">Saved runs</p>
        <span className="text-xs text-app-muted">
          {source === 'cloud' ? 'Cloud' : 'Local'}
        </span>
      </div>
      <ul className="divide-y divide-app-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 py-3 first:pt-0 last:pb-0">
            <button
              type="button"
              onClick={() => onLoad(item)}
              className="flex-1 text-left text-sm text-app-text transition hover:text-app-accent"
            >
              {item.label}
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="btn-ghost p-2 text-app-muted hover:text-app-text"
              aria-label="Delete saved run"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
