import type { LucideIcon } from 'lucide-react';

interface VisualPageHeaderProps {
  icon: LucideIcon;
  title: string;
  accent?: string;
}

export function VisualPageHeader({
  icon: Icon,
  title,
  accent = 'border-teal-300 bg-teal-100 text-teal-900',
}: VisualPageHeaderProps) {
  return (
    <header className="animate-slide-right mb-6 flex items-center gap-3 border-b border-white/50 pb-6">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-glow-sm ring-1 ring-white/70 backdrop-blur-sm transition duration-300 hover:scale-105 hover:shadow-glow-md ${accent}`}
      >
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <h1 className="bg-gradient-to-r from-app-text to-teal-800 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
        {title}
      </h1>
    </header>
  );
}
