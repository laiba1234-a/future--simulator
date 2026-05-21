import type { ReactNode } from 'react';
import { AppLogo } from './brand/AppLogo';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-app-bg px-4 py-12 text-app-text">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <AppLogo size="lg" showWordmark={false} className="mb-4" />
          <h1 className="text-xl font-semibold tracking-tight text-app-text">{title}</h1>
          <p className="mt-2 text-sm text-app-muted">{subtitle}</p>
        </div>

        <div className="card card-interactive p-8 shadow-glow-sm">{children}</div>

        {footer && <div className="mt-6 text-center text-sm text-app-muted">{footer}</div>}
      </div>
    </div>
  );
}
