import { Check } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { APP_JOURNEY, JOURNEY_HUE_STYLES, journeyIndexForPath } from '../../lib/appJourney';

interface JourneyPathProps {
  compact?: boolean;
  className?: string;
}

export function JourneyPath({ compact = false, className = '' }: JourneyPathProps) {
  const { pathname } = useLocation();
  const activeIndex = journeyIndexForPath(pathname);

  return (
    <nav
      aria-label="App journey"
      className={`overflow-x-auto ${className}`}
    >
      <ol className="flex min-w-max items-center justify-center gap-0 px-1 py-2 sm:justify-start">
        {APP_JOURNEY.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeIndex;
          const isDone = i < activeIndex;
          const isLast = i === APP_JOURNEY.length - 1;
          const hue = JOURNEY_HUE_STYLES[step.hue];

          return (
            <li key={step.path} className="flex items-center">
              <NavLink
                to={step.path}
                end={step.end}
                title={step.label}
                className={({ isActive: linkActive }) =>
                  `group flex flex-col items-center gap-1 transition duration-300 ${
                    compact ? 'px-2' : 'px-2.5 sm:px-3'
                  } ${linkActive || isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`
                }
              >
                <span
                  className={`relative flex items-center justify-center rounded-full border-2 transition duration-300 ${
                    compact ? 'h-9 w-9' : 'h-10 w-10 sm:h-11 sm:w-11'
                  } ${
                    isActive
                      ? `journey-node-active ${hue.active} ${hue.glow}`
                      : isDone
                        ? 'journey-node-done border-emerald-400/60 bg-gradient-to-br from-emerald-50 to-teal-50/80 text-emerald-900'
                        : 'border-white/70 bg-white/80 shadow-sm backdrop-blur-sm group-hover:scale-105 group-hover:border-teal-300/60 group-hover:shadow-glow-sm'
                  }`}
                >
                  {isDone ? (
                    <Check className="h-4 w-4 text-emerald-800" strokeWidth={2.5} />
                  ) : (
                    <Icon
                      className={`${compact ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'} transition duration-300 ${
                        isActive
                          ? ''
                          : 'text-app-muted group-hover:text-teal-800'
                      }`}
                      strokeWidth={1.75}
                    />
                  )}
                  {isActive && (
                    <span
                      className={`absolute -bottom-0.5 h-2 w-2 animate-pulse rounded-full ${hue.dot}`}
                    />
                  )}
                </span>
                <span
                  className={`text-[9px] font-semibold uppercase tracking-wide transition sm:text-[10px] ${
                    isActive ? 'text-app-text' : 'text-app-muted group-hover:text-teal-800'
                  }`}
                >
                  {step.label}
                </span>
              </NavLink>
              {!isLast && (
                <span
                  className={`mx-0.5 h-1 w-5 shrink-0 rounded-full bg-gradient-to-r sm:w-8 ${
                    isDone
                      ? hue.connector
                      : 'from-app-border/60 to-app-border/30'
                  } ${i === activeIndex - 1 ? 'journey-connector-pulse h-1.5' : ''}`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function StepProgressBar({
  current,
  total,
  className = '',
}: {
  current: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-full border border-white/50 bg-white/40 shadow-inner backdrop-blur-sm ${className}`}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      <div
        className="progress-glow h-full rounded-full bg-gradient-to-r from-teal-600 via-cyan-500 to-violet-500 bg-[length:200%_100%] transition-all duration-700 ease-out animate-gradient-x"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
