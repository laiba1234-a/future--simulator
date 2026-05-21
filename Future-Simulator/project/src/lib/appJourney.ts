import type { LucideIcon } from 'lucide-react';
import {
  GitBranch,
  History,
  Home,
  LineChart,
  PenLine,
  Sparkles,
} from 'lucide-react';

export type JourneyHue = 'teal' | 'sky' | 'emerald' | 'cyan' | 'violet' | 'amber';

export interface JourneyStep {
  path: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  hue: JourneyHue;
}

/** Per-step color + glow when active in the journey bar */
export const JOURNEY_HUE_STYLES: Record<
  JourneyHue,
  { active: string; glow: string; connector: string; dot: string }
> = {
  teal: {
    active:
      'border-teal-400 bg-gradient-to-br from-teal-100 via-cyan-50 to-white text-teal-900',
    glow: 'shadow-[0_0_22px_rgba(13,148,136,0.4)]',
    connector: 'from-teal-400/80 to-cyan-400/50',
    dot: 'bg-teal-500 shadow-[0_0_10px_rgba(13,148,136,0.85)]',
  },
  sky: {
    active:
      'border-sky-400 bg-gradient-to-br from-sky-100 via-blue-50 to-white text-sky-900',
    glow: 'shadow-[0_0_22px_rgba(56,189,248,0.4)]',
    connector: 'from-sky-400/80 to-blue-400/50',
    dot: 'bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.85)]',
  },
  emerald: {
    active:
      'border-emerald-400 bg-gradient-to-br from-emerald-100 via-teal-50 to-white text-emerald-900',
    glow: 'shadow-[0_0_22px_rgba(16,185,129,0.38)]',
    connector: 'from-emerald-400/80 to-teal-400/50',
    dot: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.85)]',
  },
  cyan: {
    active:
      'border-cyan-400 bg-gradient-to-br from-cyan-100 via-sky-50 to-white text-cyan-900',
    glow: 'shadow-[0_0_22px_rgba(6,182,212,0.38)]',
    connector: 'from-cyan-400/80 to-sky-400/50',
    dot: 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.85)]',
  },
  violet: {
    active:
      'border-violet-400 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-white text-violet-900',
    glow: 'shadow-[0_0_22px_rgba(139,92,246,0.38)]',
    connector: 'from-violet-400/80 to-fuchsia-400/50',
    dot: 'bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.85)]',
  },
  amber: {
    active:
      'border-amber-400 bg-gradient-to-br from-amber-100 via-orange-50 to-white text-amber-950',
    glow: 'shadow-[0_0_22px_rgba(245,158,11,0.35)]',
    connector: 'from-amber-400/80 to-orange-400/50',
    dot: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.85)]',
  },
};

/** Main app flow: start at Home, then move forward through each tab. */
export const APP_JOURNEY: JourneyStep[] = [
  { path: '/', label: 'Home', icon: Home, end: true, hue: 'teal' },
  { path: '/decide', label: 'Decide', icon: PenLine, hue: 'sky' },
  { path: '/results', label: 'Results', icon: LineChart, hue: 'emerald' },
  { path: '/parallel', label: 'Parallel', icon: Sparkles, hue: 'cyan' },
  { path: '/branches', label: 'Branches', icon: GitBranch, hue: 'violet' },
  { path: '/history', label: 'History', icon: History, hue: 'amber' },
];

export function journeyIndexForPath(pathname: string): number {
  const exact = APP_JOURNEY.findIndex((s) => s.path === pathname);
  if (exact >= 0) return exact;
  if (pathname.startsWith('/decide')) return 1;
  if (pathname.startsWith('/results')) return 2;
  if (pathname.startsWith('/parallel')) return 3;
  if (pathname.startsWith('/branches')) return 4;
  if (pathname.startsWith('/history')) return 5;
  return 0;
}
