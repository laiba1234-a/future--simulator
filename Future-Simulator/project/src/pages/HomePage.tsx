import {
  ArrowRight,
  GitBranch,
  History,
  LineChart,
  PenLine,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLogo } from '../components/brand/AppLogo';
import { HeroVisual } from '../components/visuals/HeroVisual';
import { PageMotion } from '../components/visuals/PageMotion';
import { MetricIconTile } from '../components/visuals/OutcomeCharts';
import { useSimulation } from '../contexts/SimulationContext';
import { ensureFullResult } from '../lib/resultCompat';

const FLOW_STEPS = [
  {
    icon: PenLine,
    label: 'Describe',
    iconBox:
      'border-sky-300 bg-gradient-to-br from-sky-200 to-blue-100 text-sky-900 shadow-glow-sky group-hover:shadow-glow-md',
    to: '/decide',
  },
  {
    icon: Zap,
    label: 'Simulate',
    iconBox:
      'border-amber-300 bg-gradient-to-br from-amber-200 to-orange-100 text-amber-950 shadow-glow-amber group-hover:shadow-glow-md',
    to: '/decide',
  },
  {
    icon: LineChart,
    label: 'Explore',
    iconBox:
      'border-emerald-300 bg-gradient-to-br from-emerald-200 to-teal-100 text-emerald-900 shadow-glow-emerald group-hover:shadow-glow-md',
    to: '/results',
  },
] as const;

const FEATURES = [
  {
    to: '/parallel',
    icon: Sparkles,
    label: 'Parallel universe',
    accent:
      'border-sky-300 bg-gradient-to-br from-sky-100 to-cyan-100 text-sky-900',
    glow: 'universe-glow-a',
    bar: 'accent-bar-sky',
  },
  {
    to: '/branches',
    icon: GitBranch,
    label: 'Branching futures',
    accent:
      'border-violet-300 bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-900',
    glow: 'universe-glow-b',
    bar: 'accent-bar-violet',
  },
] as const;

export function HomePage() {
  const { result, memory, history } = useSimulation();
  const hasResult = Boolean(result);
  const runCount = memory.profile.riskBehavior.simulationsCount;

  return (
    <PageMotion className="w-full">
      <div className="card mb-6 overflow-hidden p-0 shadow-glow-md">
        <HeroVisual />
        <div className="relative flex flex-wrap items-center justify-between gap-4 border-t border-white/50 bg-gradient-to-r from-teal-50/30 via-white/80 to-violet-50/30 p-5">
          <AppLogo size="md" />
          <div className="flex flex-wrap gap-2">
            <Link to="/decide" className="btn-primary">
              <PenLine className="h-4 w-4" strokeWidth={1.75} />
              New simulation
            </Link>
            {hasResult && (
              <Link to="/results" className="btn-secondary">
                <LineChart className="h-4 w-4" strokeWidth={1.75} />
                Results
              </Link>
            )}
          </div>
        </div>
      </div>

      {hasResult && result && (
        <Link
          to="/results"
          className="card-interactive group mb-6 flex items-center gap-4 border-emerald-200/70 p-4 shadow-glow-emerald"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-200 to-teal-100 shadow-glow-emerald ring-1 ring-white/80 transition duration-300 group-hover:scale-105">
            <TrendingUp className="h-7 w-7 text-emerald-900" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="overline">Latest run</p>
            <p className="mt-1 truncate text-sm font-medium text-app-text">
              {ensureFullResult(result).summary.headline}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-app-muted transition duration-300 group-hover:translate-x-1 group-hover:text-teal-700" />
        </Link>
      )}

      <div className="mb-6 grid grid-cols-3 gap-3">
        {FLOW_STEPS.map(({ icon: Icon, label, iconBox, to }) => (
          <Link
            key={label}
            to={to}
            className="card-interactive group flex flex-col items-center gap-3 p-4 text-center"
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-2xl border ring-1 ring-white/70 backdrop-blur-sm transition duration-300 group-hover:scale-110 ${iconBox}`}
            >
              <Icon className="h-7 w-7" strokeWidth={1.5} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-app-text">
              {label}
            </span>
          </Link>
        ))}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {FEATURES.map(({ to, icon: Icon, label, accent, glow, bar }) => (
          <Link
            key={to}
            to={to}
            className={`card-interactive group relative overflow-hidden p-5 ${glow}`}
          >
            <span className={`absolute inset-x-0 top-0 h-1 ${bar}`} aria-hidden />
            <div className="flex items-center gap-4">
              <span
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border shadow-sm ring-1 ring-white/60 backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:rotate-3 ${accent}`}
              >
                <Icon className="h-8 w-8" strokeWidth={1.5} />
              </span>
              <div className="flex flex-1 items-center justify-between gap-2">
                <span className="text-sm font-semibold text-app-text">{label}</span>
                <ArrowRight className="h-4 w-4 text-app-muted transition duration-300 group-hover:translate-x-1 group-hover:text-violet-700" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="metric-tile-glow">
          <MetricIconTile
            icon={Target}
            label="In memory"
            value={String(runCount)}
            accent="border-sky-300 bg-gradient-to-br from-sky-100 to-white text-sky-900 shadow-glow-sky"
          />
        </div>
        <div className="metric-tile-glow">
          <MetricIconTile
            icon={History}
            label="Saved runs"
            value={String(history.length)}
            accent="border-violet-300 bg-gradient-to-br from-violet-100 to-white text-violet-900 shadow-glow-violet"
          />
        </div>
      </div>
      {history.length > 0 && (
        <Link
          to="/history"
          className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-teal-800 transition hover:text-teal-900 hover:underline"
        >
          <History className="h-4 w-4" />
          History
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </PageMotion>
  );
}
