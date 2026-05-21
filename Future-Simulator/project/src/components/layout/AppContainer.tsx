import type { ReactNode } from 'react';

interface AppContainerProps {
  children: ReactNode;
  className?: string;
}

/** Centers content at ~70% viewport width on desktop; full width on small screens. */
export function AppContainer({ children, className = '' }: AppContainerProps) {
  return (
    <div
      className={`app-container mx-auto w-full min-w-0 px-4 sm:px-0 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
