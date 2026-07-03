'use client';

import { getErrorMessage } from '@/lib/api/client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--neutral-50)] px-4">
      <div className="card card-elev flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <h1 className="text-lg font-semibold text-[var(--primary-navy)]">Something went wrong</h1>
        <p className="text-sm text-[var(--neutral-600)]">{getErrorMessage(error)}</p>
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
