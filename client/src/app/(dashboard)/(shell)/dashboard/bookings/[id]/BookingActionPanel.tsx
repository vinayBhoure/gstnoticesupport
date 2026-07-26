'use client';

import Link from 'next/link';
import { FileText, Search, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

import { PreDepositNotice } from '@/components/booking/PreDepositNotice';
import { PayToUnlock } from '@/components/booking/PayToUnlock';
import { CancelBookingButton } from './CancelBookingButton';
import { bookingRef, formatInr } from '@/lib/constants/booking-status';
import { SERVICE_META } from '@/lib/constants/services';
import type { BookingStatus, PaymentStatus, ServiceType } from '@/lib/api/types';

type BookingActionPanelProps = {
  bookingId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  serviceType: ServiceType;
  documentCount: number;
  adminNote: string | null;
  hasFinalDraft: boolean;
  quotedAmountPaise: number | null;
};

// Status action panel per resources/ui/Service Detail.html — one panel per
// booking status. The pay-to-unlock CTA lands here in EP12 (D74 placeholder).
export function BookingActionPanel({
  bookingId,
  status,
  paymentStatus,
  serviceType,
  documentCount,
  adminNote,
  hasFinalDraft,
  quotedAmountPaise,
}: BookingActionPanelProps) {
  const expertSummary = adminNote ? (
    <>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>Expert Summary</h2>
      <p className="expert-summary">{adminNote}</p>
      <div className="panel-divider" aria-hidden />
    </>
  ) : null;

  return (
    <section
      className={`action-panel${status === 'complete' ? ' panel-complete' : ''}`}
      aria-label="Status and actions"
    >
      {status === 'document_upload' && (
        <div>
          <div className="panel-icon-row">
            <FileText className="big-ic" aria-hidden />
          </div>
          {documentCount > 0 ? (
            <>
              <h2 className="ph">Documents Received</h2>
              <p className="pbody">
                Our team will begin reviewing your case shortly. We&apos;ll notify you by email.
                You can still add or remove documents in the Uploaded Documents section before
                review starts.
              </p>
            </>
          ) : (
            <>
              <h2 className="ph">Upload Your Documents</h2>
              <p className="pbody">
                Use the Add Document button in the Uploaded Documents section to upload your
                notice and any supporting files.
              </p>
            </>
          )}
        </div>
      )}

      {status === 'in_review' && (
        <div>
          <div className="panel-icon-row">
            <Search className="big-ic" aria-hidden />
          </div>
          <h2 className="ph">Under Review</h2>
          <p className="pbody">
            Our team is reviewing your case. We&apos;ll notify you when your draft reply is ready.
          </p>
        </div>
      )}

      {status === 'draft_ready' && (
        <div>
          {expertSummary}
          <div className="pay-unlock">
            {/* Pre-deposit disclosure touchpoint #4 (KB2 §7) — must render above the CTA. */}
            <PreDepositNotice serviceType={serviceType} />
            <div className="fee-row">
              <span className="lbl">Reply preparation fee</span>
              <span className="amt">
                {quotedAmountPaise != null
                  ? formatInr(quotedAmountPaise)
                  : SERVICE_META[serviceType].priceDisplay}
              </span>
            </div>
            {paymentStatus !== 'paid' && (
              <PayToUnlock bookingId={bookingId} serviceType={serviceType} />
            )}
          </div>
          {paymentStatus === 'pending' && <CancelBookingButton bookingId={bookingId} />}
        </div>
      )}

      {status === 'filing' && (
        <div>
          {expertSummary}
          <div className="draft-preview">
            <div className="draft-label">
              Draft Reply — {SERVICE_META[serviceType].label} / {bookingRef(bookingId)}
            </div>
            Your draft reply is unlocked. Open the draft viewer to read or download it while our
            team files your response.
          </div>
          <Link href={`/dashboard/bookings/${bookingId}/draft`} className="btn btn-primary btn-block">
            {hasFinalDraft ? 'View Final Draft' : 'View Draft'}
          </Link>
          <p className="advisory">Filing is in progress — we&apos;ll notify you when it completes.</p>
        </div>
      )}

      {status === 'complete' && (
        <div>
          <div className="panel-icon-row">
            <CheckCircle className="big-ic green" aria-hidden />
          </div>
          <h2 className="ph">Service Complete</h2>
          <p className="pbody">Your response has been filed on the GST portal.</p>
          <div className="action-btn-row" style={{ marginTop: 20, alignItems: 'center' }}>
            <Link
              href={`/dashboard/bookings/${bookingId}/draft`}
              className="btn-tertiary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, minHeight: 44 }}
            >
              {hasFinalDraft ? 'View Final Draft' : 'View Draft'} <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </div>
      )}

      {status === 'cancelled' && (
        <div>
          <div className="panel-icon-row">
            <XCircle className="big-ic" aria-hidden />
          </div>
          <h2 className="ph">Service Cancelled</h2>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link
              href="/dashboard/bookings/new"
              className="btn-tertiary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, minHeight: 44 }}
            >
              Re-book this service <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
