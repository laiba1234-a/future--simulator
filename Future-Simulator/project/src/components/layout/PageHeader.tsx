interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6 w-full border-b border-app-border pb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-app-text">{title}</h1>
      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-app-muted">
          {description}
        </p>
      )}
    </header>
  );
}
