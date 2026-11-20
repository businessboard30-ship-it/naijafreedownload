import type { ReactNode } from 'react';

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="state">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="4.5" y="7.5" width="23" height="17" rx="2.5" stroke="currentColor" />
        <path d="M4.5 13.5h23M10 19h6" stroke="currentColor" strokeLinecap="round" />
      </svg>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="state state-error" role="alert">
      <h2>The catalogue could not be loaded</h2>
      <p>{message} Check your connection, then try again.</p>
      <button className="btn" onClick={onRetry}>Try again</button>
    </div>
  );
}

export function LoadingState() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading catalogue</span>
      <div className="grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => <div className="card skeleton" key={i} />)}
      </div>
    </div>
  );
}
