'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Lock, Loader2 } from 'lucide-react';

import { documentApi } from '@/lib/api/document';
import { getErrorMessage } from '@/lib/api/client';

type DraftViewerProps = {
  bookingId: string;
  serviceLabel: string;
};

function useCountdown(expiresAt: string | undefined): number {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return secondsLeft;
}

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Read-only draft preview. The pre-signed URL is fetched fresh per load and never
// stored; it expires in 15 minutes, after which the user regenerates it (HLD §9.4).
export function DraftViewer({ bookingId, serviceLabel }: DraftViewerProps) {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['draft', bookingId],
    queryFn: () => documentApi.getDraftUrl(bookingId),
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const secondsLeft = useCountdown(data?.expiresAt);
  const isExpired = Boolean(data) && secondsLeft <= 0;

  return (
    <main className="min-h-screen bg-[var(--neutral-50)] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-4 text-sm text-[var(--neutral-600)]">
          <Link href="/dashboard" className="hover:text-[var(--neutral-900)]">
            My services
          </Link>
          <span aria-hidden> › </span>
          <Link
            href={`/dashboard/bookings/${bookingId}`}
            className="hover:text-[var(--neutral-900)]"
          >
            {serviceLabel}
          </Link>
          <span aria-hidden> › </span>
          <span className="text-[var(--neutral-900)]">Draft</span>
        </nav>

        <h1 className="mb-4 text-2xl font-bold text-[var(--primary-navy)]">
          Draft — {serviceLabel}
        </h1>

        {data && !isExpired && (
          <div
            role="note"
            className="mb-4 flex items-center gap-2 rounded-[var(--r-badge)] border-l-2 border-[var(--warning-amber)] bg-[var(--neutral-50)] p-3 text-sm text-[var(--neutral-900)]"
          >
            <AlertCircle size={16} className="shrink-0 text-[var(--warning-amber)]" aria-hidden />
            This link expires in <strong>{formatMmSs(secondsLeft)}</strong>. Refresh to generate a
            new one if needed.
          </div>
        )}

        <div className="card overflow-hidden">
          {isPending ? (
            <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-[var(--neutral-600)]">
              <Loader2 size={28} className="animate-spin" aria-hidden />
              <p className="text-sm">Loading draft…</p>
            </div>
          ) : isError ? (
            <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-center">
              <AlertCircle size={28} className="text-[var(--warning-amber)]" aria-hidden />
              <p className="text-sm text-[var(--neutral-600)]">{getErrorMessage(error)}</p>
              <button type="button" className="btn btn-secondary" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : isExpired ? (
            <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-center">
              <Lock size={28} className="text-[var(--neutral-600)]" aria-hidden />
              <p className="text-sm text-[var(--neutral-600)]">This link has expired.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? 'Generating…' : 'Generate new link'}
              </button>
            </div>
          ) : (
            <iframe
              src={data.draftUrl}
              title={`Draft — ${serviceLabel}`}
              className="h-[80vh] w-full border-0"
            />
          )}
        </div>

        <p className="mt-4 text-sm text-[var(--neutral-600)]">
          This is a read-only preview.{' '}
          <Link
            href={`/dashboard/bookings/${bookingId}`}
            className="font-medium text-[var(--accent-green)]"
          >
            Back to booking
          </Link>
        </p>
      </div>
    </main>
  );
}
