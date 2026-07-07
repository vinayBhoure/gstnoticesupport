'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle, HelpCircle, XCircle, ArrowRight, RotateCw } from 'lucide-react';
import { paymentApi } from '@/lib/api/payment';
import { WHATSAPP_LINKS } from '@/data/common';
import { bookingRef } from '@/lib/constants/booking-status';
import { InvalidLinkState } from './InvalidLinkState';
import type { VerifyQuery } from '@/lib/shared-schemas/payment.schema';

type PaymentVerifierProps = {
  query: VerifyQuery;
};

// Client leaf per DD-2: GET /payments/verify is authenticate-gated, and only
// the browser apiClient path gets silent 401→refresh→retry, so the actual
// verify call must happen here rather than in the Server Component page.
// One-shot query (retry: false) — verify is idempotent server-side but this
// page is not a polling surface.
export function PaymentVerifier({ query }: PaymentVerifierProps) {
  const router = useRouter();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['payments', 'verify', query.razorpay_order_id],
    queryFn: () => paymentApi.verify(query),
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data?.outcome === 'success' && data.bookingId) {
      const timer = setTimeout(() => {
        router.replace(`/dashboard/bookings/${data.bookingId}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [data, router]);

  if (isPending) {
    return (
      <div className="pv-state" role="status" aria-live="polite">
        <span className="pv-icon ic-navy pv-spin" aria-hidden>
          <Loader2 size={32} strokeWidth={1.5} />
        </span>
        <h2 id="pvHeading">Verifying your payment.</h2>
        <p className="body">Please do not close this window. This usually takes a few seconds.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pv-state" role="status" aria-live="polite">
        <span className="pv-icon ic-muted" aria-hidden>
          <HelpCircle size={32} strokeWidth={1.5} />
        </span>
        <h2 id="pvHeading">We&apos;re having trouble confirming your payment right now.</h2>
        <p className="body">
          If your payment was deducted, it will be reflected in your service status within a few
          minutes.
        </p>
        <div className="pv-actions">
          <button type="button" className="btn btn-secondary" onClick={() => refetch()}>
            <RotateCw size={16} aria-hidden /> Retry
          </button>
          <Link className="pv-tertiary" href={`/dashboard/bookings/${query.booking_id}`}>
            Go to Service Page
            <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  if (data.outcome === 'success') {
    return (
      <div className="pv-state" role="status" aria-live="polite">
        <span className="pv-icon ic-green" aria-hidden>
          <CheckCircle size={32} strokeWidth={1.5} />
        </span>
        <h2 id="pvHeading">Payment confirmed.</h2>
        <p className="body">Taking you to your service…</p>
        <div className="pv-actions">
          <Link className="pv-tertiary" href={`/dashboard/bookings/${data.bookingId}`}>
            Go to your service
            <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  if (data.outcome === 'inconclusive') {
    return (
      <div className="pv-state" role="status" aria-live="polite">
        <span className="pv-icon ic-muted" aria-hidden>
          <HelpCircle size={32} strokeWidth={1.5} />
        </span>
        <h2 id="pvHeading">We&apos;re having trouble confirming your payment right now.</h2>
        <p className="body">
          If your payment was deducted, it will be reflected in your service status within a few
          minutes. Please check your service page shortly.
        </p>
        {data.bookingId && (
          <div className="pv-ref">
            <span className="lbl">Booking ID</span>
            <span className="val">{bookingRef(data.bookingId)}</span>
          </div>
        )}
        <div className="pv-actions">
          {data.bookingId && (
            <Link className="pv-tertiary" href={`/dashboard/bookings/${data.bookingId}`}>
              Go to Service Page
              <ArrowRight size={15} aria-hidden />
            </Link>
          )}
          <a className="pv-tertiary" href={WHATSAPP_LINKS.generalQuery} target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp
            <ArrowRight size={15} aria-hidden />
          </a>
        </div>
      </div>
    );
  }

  if (data.outcome === 'failed') {
    return (
      <div className="pv-state" role="status" aria-live="polite">
        <span className="pv-icon ic-muted" aria-hidden>
          <XCircle size={32} strokeWidth={1.5} />
        </span>
        <h2 id="pvHeading">Your payment did not go through.</h2>
        <p className="body">No amount was deducted. You can try again from your service page.</p>
        <div className="pv-actions">
          {data.bookingId && (
            <Link className="pv-tertiary" href={`/dashboard/bookings/${data.bookingId}`}>
              Go to Service Page
              <ArrowRight size={15} aria-hidden />
            </Link>
          )}
        </div>
      </div>
    );
  }

  // outcome === 'tampered' — signature/order mismatch; no ownership was
  // confirmed, so no booking link is trustworthy here.
  return <InvalidLinkState />;
}
