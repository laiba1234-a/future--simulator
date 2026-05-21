import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Brain,
  GitBranch,
  Heart,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { ProbabilityScores, ScenarioTier } from '../../types';

const TIER_COLORS: Record<ScenarioTier, { bar: string; ring: string; text: string }> = {
  best: { bar: 'bg-emerald-600', ring: 'stroke-emerald-700', text: 'text-emerald-900' },
  average: { bar: 'bg-sky-600', ring: 'stroke-sky-700', text: 'text-sky-900' },
  worst: { bar: 'bg-rose-600', ring: 'stroke-rose-700', text: 'text-rose-900' },
};

export function tierIcon(tier: ScenarioTier): LucideIcon {
  if (tier === 'best') return TrendingUp;
  if (tier === 'worst') return TrendingDown;
  return Target;
}

export function TierIconBadge({
  tier,
  size = 'md',
}: {
  tier: ScenarioTier;
  size?: 'sm' | 'md';
}) {
  const Icon = tierIcon(tier);
  const box = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <span
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded-lg border border-app-border bg-app-raised ${TIER_COLORS[tier].text}`}
    >
      <Icon className={icon} strokeWidth={1.75} />
    </span>
  );
}

export function ProbabilityStackBar({
  probabilities,
  className = '',
}: {
  probabilities: ProbabilityScores;
  className?: string;
}) {
  const { best, average, worst } = probabilities;
  return (
    <div className={className}>
      <div className="flex h-3 overflow-hidden rounded-full bg-app-border">
        <div
          className={`${TIER_COLORS.best.bar} transition-all`}
          style={{ width: `${best}%` }}
          title={`Best ${best}%`}
        />
        <div
          className={`${TIER_COLORS.average.bar} transition-all`}
          style={{ width: `${average}%` }}
          title={`Likely ${average}%`}
        />
        <div
          className={`${TIER_COLORS.worst.bar} transition-all`}
          style={{ width: `${worst}%` }}
          title={`Worst ${worst}%`}
        />
      </div>
      <div className="mt-2 flex flex-wrap justify-between gap-2 font-mono text-[10px] text-app-muted">
        <span className="flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full ${TIER_COLORS.best.bar}`} />
          Best {best}%
        </span>
        <span className="flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full ${TIER_COLORS.average.bar}`} />
          Likely {average}%
        </span>
        <span className="flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full ${TIER_COLORS.worst.bar}`} />
          Worst {worst}%
        </span>
      </div>
    </div>
  );
}

export function ProbabilityRing({
  value,
  tier = 'average',
  size = 52,
}: {
  value: number;
  tier?: ScenarioTier;
  size?: number;
}) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const colors = TIER_COLORS[tier];

  return (
    <div className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-app-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={colors.ring}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-mono text-[11px] font-semibold tabular-nums ${colors.text}`}
      >
        {value}%
      </span>
    </div>
  );
}

export function DualCompareBars({
  labelA,
  labelB,
  valueA,
  valueB,
  accentA = 'bg-sky-500',
  accentB = 'bg-violet-500',
}: {
  labelA: string;
  labelB: string;
  valueA: number;
  valueB: number;
  accentA?: string;
  accentB?: string;
}) {
  const max = Math.max(valueA, valueB, 1);
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-sky-900">{labelA}</span>
          <span className="font-mono tabular-nums text-app-muted">{valueA}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-app-border">
          <div
            className={`h-full ${accentA} transition-all`}
            style={{ width: `${(valueA / max) * 100}%` }}
          />
        </div>
      </div>
      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-violet-900">{labelB}</span>
          <span className="font-mono tabular-nums text-app-muted">{valueB}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-app-border">
          <div
            className={`h-full ${accentB} transition-all`}
            style={{ width: `${(valueB / max) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

const INSIGHT_ICONS = [Sparkles, Brain, Heart, GitBranch, Wallet, Target] as const;

export function InsightIconGrid({ insights }: { insights: string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {insights.map((insight, i) => {
        const Icon = INSIGHT_ICONS[i % INSIGHT_ICONS.length];
        return (
          <li
            key={insight}
            className="card-inset flex gap-3 p-4 transition hover:border-app-accent/30"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-accent/15 text-teal-900">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <p className="text-sm leading-relaxed text-app-muted">{insight}</p>
          </li>
        );
      })}
    </ul>
  );
}

export function MetricIconTile({
  icon: Icon,
  label,
  value,
  hint,
  accent = 'text-teal-900',
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="card-inset flex gap-3 p-4 transition duration-300">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${accent}`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="overline">{label}</p>
        <p className="mt-1 font-mono text-lg font-medium tabular-nums text-app-text">{value}</p>
        {hint && <p className="mt-1 text-xs text-app-muted">{hint}</p>}
      </div>
    </div>
  );
}

export function VerdictBanner({
  text,
  aiSource,
}: {
  text: string;
  aiSource?: 'grok' | 'template';
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-app-accent/25 bg-gradient-to-r from-app-accent/10 to-transparent p-4">
      <Sparkles className="h-6 w-6 shrink-0 text-teal-900" />
      <div>
        {aiSource === 'grok' && (
          <p className="text-[10px] font-medium uppercase tracking-wide text-teal-900">
            AI verdict
          </p>
        )}
        <p className="mt-1 text-sm leading-relaxed text-app-text">{text}</p>
      </div>
    </div>
  );
}

export function WarningTile({ message }: { message: string }) {
  return (
    <div className="alert-warning flex gap-2 px-3 py-2">
      <AlertTriangle className="h-4 w-4 shrink-0 alert-warning-icon" />
      <span className="alert-warning-text">{message}</span>
    </div>
  );
}
