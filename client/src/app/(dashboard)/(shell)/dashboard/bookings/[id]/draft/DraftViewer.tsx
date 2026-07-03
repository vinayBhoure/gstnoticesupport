'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, AlertTriangle, ArrowLeft, Download, Lock } from 'lucide-react';

import { documentApi } from '@/lib/api/document';

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

// Read-only draft preview per resources/ui/Draft Viewer.html — four states:
// Loading / Loaded / Link Expired / Load Error. The pre-signed URL is fetched
// fresh per load and never stored; it expires in 15 minutes (HLD §9.4).
export function DraftViewer({ bookingId, serviceLabel }: DraftViewerProps) {
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ['draft', bookingId],
    queryFn: () => documentApi.getDraftUrl(bookingId),
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const secondsLeft = useCountdown(data?.expiresAt);
  const isExpired = Boolean(data) && secondsLeft <= 0;
  const showFallback = isError || isExpired;

  return (
    <>
      <Link href={`/dashboard/bookings/${bookingId}`} className="back-link">
        <ArrowLeft className="ic" aria-hidden /> Back to Service
      </Link>

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="sep" aria-hidden>
          ›
        </span>
        <Link href={`/dashboard/bookings/${bookingId}`}>{serviceLabel}</Link>
        <span className="sep" aria-hidden>
          ›
        </span>
        <span className="current">View Draft</span>
      </nav>

      <div className="page-head">
        <h1>Draft Reply — {serviceLabel}</h1>
        {!showFallback && (
          <a
            className="btn btn-secondary"
            href={data?.draftUrl}
            download
            aria-label={`Download draft reply for ${serviceLabel}`}
            aria-disabled={isPending}
            style={isPending ? { opacity: 0.45, pointerEvents: 'none' } : undefined}
          >
            <Download className="ic" aria-hidden /> Download Draft
          </a>
        )}
      </div>

      {!showFallback && (
        <div className="expiry-notice" role="status" aria-live="polite">
          <AlertCircle className="ic" aria-hidden />
          <p>
            This link expires in <strong>{data ? formatMmSs(secondsLeft) : '15:00'}</strong>.
            Refresh the page to generate a new one if needed.
          </p>
        </div>
      )}

      <div className="viewer-shell">
        {isPending || isFetching ? (
          <div className="viewer-loading" aria-label="Loading draft document">
            <div className="spin-ring" role="status" aria-label="Loading" />
            <p>Loading draft…</p>
          </div>
        ) : isError ? (
          <div className="viewer-fallback">
            <AlertTriangle className="fb-icon" aria-hidden />
            <h3>Could not load draft</h3>
            <p>Could not load the draft. Please try again.</p>
            <button type="button" className="btn btn-primary" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        ) : isExpired ? (
          <div className="viewer-fallback">
            <Lock className="fb-icon" aria-hidden />
            <h3>Link Expired</h3>
            <p>Your preview link has expired. Generate a new one to continue.</p>
            <button type="button" className="btn btn-primary" onClick={() => refetch()}>
              Generate New Link
            </button>
          </div>
        ) : (
          <iframe
            src={data?.draftUrl}
            title={`Draft — ${serviceLabel}`}
            className="viewer-iframe"
            style={{ height: '80vh' }}
          />
        )}
      </div>

      {!showFallback && (
        <p className="readonly-note">
          This is a read-only preview. To continue,{' '}
          <Link href={`/dashboard/bookings/${bookingId}`}>return to the service page</Link>.
        </p>
      )}
    </>
  );
}
