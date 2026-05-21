import { Orbit, Sparkles } from 'lucide-react';

export function HeroVisual() {
  return (
    <div className="hero-visual relative flex h-40 w-full items-center justify-center overflow-hidden border-b border-white/40 bg-gradient-to-br from-sky-100/50 via-white/90 to-violet-100/40 sm:h-48">
      <div className="hero-mesh animate-gradient-shift pointer-events-none absolute inset-0 opacity-60" />
      <div className="hero-orb hero-orb-a absolute h-36 w-36 rounded-full blur-3xl" />
      <div className="hero-orb hero-orb-b absolute h-32 w-32 rounded-full blur-3xl" />
      <div className="hero-orb hero-orb-c absolute h-28 w-28 rounded-full blur-2xl" />
      <div className="hero-orb hero-orb-d absolute h-24 w-24 rounded-full blur-2xl" />

      <svg
        className="relative z-10 h-full w-full max-w-md opacity-95"
        viewBox="0 0 320 120"
        aria-hidden
      >
        <defs>
          <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="35%" stopColor="#0891b2" />
            <stop offset="70%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="pathGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 24 88 Q 80 20, 160 60 T 296 32"
          fill="none"
          stroke="url(#pathGrad)"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          filter="url(#pathGlow)"
          className="hero-path-draw"
        />
        <circle cx="24" cy="88" r="6" fill="#0d9488" className="hero-node-pulse" />
        <circle
          cx="160"
          cy="60"
          r="8"
          fill="#6366f1"
          className="hero-node-pulse"
          style={{ animationDelay: '0.4s' }}
        />
        <circle
          cx="296"
          cy="32"
          r="6"
          fill="#a855f7"
          className="hero-node-pulse"
          style={{ animationDelay: '0.8s' }}
        />
      </svg>

      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl border border-white/70 bg-white/75 px-2.5 py-1.5 shadow-glow-sm backdrop-blur-md animate-fade-in">
        <Orbit className="h-3.5 w-3.5 animate-float text-teal-700" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-app-muted">
          Futures map
        </span>
      </div>
      <Sparkles className="absolute right-4 top-4 h-6 w-6 animate-shimmer text-violet-600 drop-shadow-[0_0_12px_rgba(139,92,246,0.55)]" />
      <Sparkles
        className="absolute right-14 top-8 h-4 w-4 animate-shimmer text-cyan-600 opacity-80"
        style={{ animationDelay: '1.5s' }}
      />
    </div>
  );
}
