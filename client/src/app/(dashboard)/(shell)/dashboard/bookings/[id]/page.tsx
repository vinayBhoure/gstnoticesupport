import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { FileText, ShieldCheck } from 'lucide-react';

import { requireUser } from '@/lib/auth/session';
import { bookingApi } from '@/lib/api/booking';
import { ApiRequestError } from '@/lib/api/client';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BookingActionPanel } from './BookingActionPanel';
import { SERVICE_META } from '@/lib/constants/services';
import { formatBookingDate, bookingRef, formatInr } from '@/lib/constants/booking-status';
import type { BookingDetailWithRelationsDTO } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Booking — GST Notice Support',
  robots: { index: false, follow: false },
};

// Booking status hub per resources/ui/Service Detail.html.
export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const cookieHeader = (await cookies()).toString();

  let booking: BookingDetailWithRelationsDTO;
  try {
    booking = await bookingApi.getById(id, cookieHeader);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    throw error;
  }

  const serviceLabel = SERVICE_META[booking.serviceType].label;
  // A custom quote (representation) takes precedence over the fixed display price.
  const priceLabel =
    booking.quotedAmountPaise != null
      ? formatInr(booking.quotedAmountPaise)
      : SERVICE_META[booking.serviceType].priceDisplay;

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="sep" aria-hidden>
          ›
        </span>
        <span className="current">{serviceLabel}</span>
      </nav>

      <div className="status-row">
        <h1>{serviceLabel}</h1>
        <StatusBadge status={booking.status} />
      </div>

      <div className="booking-meta">
        <span>
          <span className="mono">Ref: {bookingRef(booking.id)}</span>
        </span>
        <span className="dot" aria-hidden />
        <span>Booked {formatBookingDate(booking.createdAt)}</span>
        <span className="dot" aria-hidden />
        <span>{priceLabel}</span>
      </div>

      <div className="two-col">
        {/* LEFT COLUMN */}
        <div>
          <div className="detail-card">
            <h2>Case Information</h2>
            <dl className="kv">
              <dt>Full Name</dt>
              <dd>{booking.contactName}</dd>
              <dt>Email</dt>
              <dd>{booking.contactEmail}</dd>
              <dt>Mobile</dt>
              <dd>+91 {booking.contactPhone}</dd>
              <dt>GSTIN</dt>
              <dd className="mono">{booking.gstn}</dd>
              {booking.organizationName && (
                <>
                  <dt>Organisation</dt>
                  <dd>{booking.organizationName}</dd>
                </>
              )}
              <dt>Filing For</dt>
              <dd>{booking.filingFor === 'self' ? 'Myself' : 'A Client'}</dd>
            </dl>
          </div>

          <div className="detail-card">
            <h2>Uploaded Documents</h2>
            {booking.documents.length === 0 ? (
              <p className="text-sm text-[var(--neutral-600)]">No documents uploaded yet.</p>
            ) : (
              <ul className="doc-list" aria-label="Uploaded documents">
                {booking.documents.map((doc) => (
                  <li key={doc.id} className="doc-item">
                    <FileText className="ic" aria-hidden />
                    <span className="name">{doc.fileName}</span>
                    <span className="size">{formatBookingDate(doc.uploadedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="conf-note">
              <ShieldCheck className="ic" aria-hidden />
              Documents are confidential and never shared.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN — status action panel */}
        <div>
          <BookingActionPanel
            bookingId={booking.id}
            status={booking.status}
            paymentStatus={booking.paymentStatus}
            serviceType={booking.serviceType}
            documentCount={booking.documents.length}
            adminNote={booking.adminNote}
            hasFinalDraft={booking.hasFinalDraft}
            quotedAmountPaise={booking.quotedAmountPaise}
          />
        </div>
      </div>
    </>
  );
}
