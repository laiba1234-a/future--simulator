import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useScrollToTopOnChange } from '../../hooks/useScrollToTopOnChange';
import { StepProgressBar } from '../visuals/JourneyPath';

export interface SequentialTab<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

interface SequentialTabNavProps<T extends string> {
  tabs: SequentialTab<T>[];
  active: T;
  onSelect: (id: T) => void;
  onContinue?: () => void;
  onBack?: () => void;
  isRunning?: boolean;
  continueLabel?: string;
  hint?: string;
}

export function SequentialTabNav<T extends string>({
  tabs,
  active,
  onSelect,
  onContinue,
  onBack,
  isRunning = false,
  continueLabel,
  hint,
}: SequentialTabNavProps<T>) {
  useScrollToTopOnChange(active);

  const index = tabs.findIndex((t) => t.id === active);
  const isFirst = index <= 0;
  const isLast = index >= tabs.length - 1;
  const nextTab = tabs[index + 1];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2" aria-hidden>
            {tabs.map((tab, i) => {
              const Icon = tab.icon;
              const done = i < index;
              const current = i === index;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelect(tab.id)}
                  title={tab.label}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition duration-300 ${
                    current
                      ? 'journey-node-active scale-105'
                      : done
                        ? 'journey-node-done border-emerald-500/60 bg-emerald-50 text-emerald-900'
                        : 'border-white/70 bg-white/80 text-app-muted shadow-sm hover:border-teal-300 hover:shadow-glow-sm'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              );
            })}
          </div>
          <span className="font-mono text-[10px] tabular-nums text-app-muted">
            {index + 1}/{tabs.length}
          </span>
        </div>
        <StepProgressBar current={index + 1} total={tabs.length} />
        {hint && (
          <p className="text-[10px] uppercase tracking-wide text-app-muted">{hint}</p>
        )}
      </div>

      <div
        className="flex flex-wrap gap-1 rounded-xl border border-white/60 bg-white/50 p-1 shadow-sm backdrop-blur-md"
        role="tablist"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition duration-300 ${
                isActive
                  ? 'tab-glow-active bg-gradient-to-r from-teal-100/90 to-cyan-50/90 text-teal-900'
                  : 'text-app-muted hover:bg-white/60 hover:text-teal-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {!isLast && onContinue && (
        <div className="flex gap-3">
          {!isFirst && onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={isRunning}
              className="btn-secondary px-4"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={onContinue}
            disabled={isRunning}
            className="btn-primary flex-1"
          >
            {continueLabel ?? `Continue to ${nextTab?.label ?? 'next'}`}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
