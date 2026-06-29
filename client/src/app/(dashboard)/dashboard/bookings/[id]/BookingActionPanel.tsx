'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, FileText, Send, CheckCircle, XCircle } from 'lucide-react';

import { DocumentUpload } from '@/components/booking/DocumentUpload';
import { PreDepositNotice } from '@/components/booking/PreDepositNotice';
import { CancelBookingButton } from './CancelBookingButton';
import { NEXT_ACTION_COPY } from '@/lib/constants/booking-status';
import type { BookingStatus, PaymentStatus, ServiceType } from '@/lib/api/types';

type BookingActionPanelProps = {
  bookingId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  serviceType: ServiceType;
  documentCount: number;
};

export function BookingActionPanel({
  bookingId,
  status,
  paymentStatus,
  serviceType,
  documentCount,
}: BookingActionPanelProps) {
  const router = useRouter();

  return (
    <section className="card card-elev flex flex-col gap-4 p-6">
      {status === 'document_upload' && (
        <>
          <h2 className="text-lg font-semibold text-[var(--primary-navy)]">
            {NEXT_ACTION_COPY.document_upload}
          </h2>
          <DocumentUpload
            bookingId={bookingId}
            usedCount={documentCount}
            onUploaded={() => router.refresh()}
          />
        </>
      )}

      {status === 'in_review' && (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <Clock size={28} className="text-[var(--primary-deep-blue)]" aria-hidden />
          <p className="text-sm text-[var(--neutral-600)]">{NEXT_ACTION_COPY.in_review}</p>
        </div>
      )}

      {status === 'draft_ready' && (
        <>
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <FileText size={28} className="text-[var(--warning-amber)]" aria-hidden />
            <p className="text-sm font-medium text-[var(--neutral-900)]">
              {NEXT_ACTION_COPY.draft_ready}
            </p>
          </div>
          <PreDepositNotice serviceType={serviceType} />
          {paymentStatus === 'pending' && (
            <div className="border-t border-[var(--neutral-200)] pt-4">
              <CancelBookingButton bookingId={bookingId} />
            </div>
          )}
        </>
      )}

      {(status === 'filing' || status === 'complete') && (
        <>
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            {status === 'filing' ? (
              <Send size={28} className="text-[var(--primary-navy)]" aria-hidden />
            ) : (
              <CheckCircle size={28} className="text-[var(--accent-green)]" aria-hidden />
            )}
            <p className="text-sm text-[var(--neutral-600)]">{NEXT_ACTION_COPY[status]}</p>
          </div>
          <Link href={`/dashboard/bookings/${bookingId}/draft`} className="btn btn-primary">
            View draft
          </Link>
        </>
      )}

      {status === 'cancelled' && (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <XCircle size={28} className="text-[var(--neutral-600)]" aria-hidden />
          <p className="text-sm text-[var(--neutral-600)]">{NEXT_ACTION_COPY.cancelled}</p>
        </div>
      )}
    </section>
  );
}
