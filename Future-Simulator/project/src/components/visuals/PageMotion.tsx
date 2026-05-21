import type { ReactNode } from 'react';

interface PageMotionProps {
  children: ReactNode;
  className?: string;
}

/** Staggered entrance animation for page sections */
export function PageMotion({ children, className = '' }: PageMotionProps) {
  return <div className={`page-stagger ${className}`.trim()}>{children}</div>;
}
