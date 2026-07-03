import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ArrowLeft, User, Files, StickyNote } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiRequestError } from '@/lib/api/client';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PaymentBadge } from '@/components/admin/PaymentBadge';
import { AdminDocumentList } from '@/components/admin/AdminDocumentList';
import { AdminNoteEditor } from '@/components/admin/AdminNoteEditor';
import { DraftCard } from '@/components/admin/DraftCard';
import { StatusActions } from '@/components/admin/StatusActions';
import { SERVICE_META } from '@/lib/constants/services';
import { formatBookingDate, bookingRef } from '@/lib/constants/booking-status';
import type { AdminBookingDetailDTO } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Admin · Booking Detail — GST Notice Support',
  robots: { index: false, follow: false },
};

// Admin Booking Detail per resources/ui/Admin Booking Detail.html — the richest
// admin screen: user info + documents + note (left), draft + status actions (right).
export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieHeader = (await cookies()).toString();

  let booking: AdminBookingDetailDTO;
  try {
    booking = await adminApi.getBooking(id, cookieHeader);
  } catch (error) {
    if (error instanceof ApiRequestError && (error.status === 404 || error.status === 400)) {
      notFound();
    }
    throw error;
  }

  return (
    <>
      <Link href="/admin/bookings" className="back-link adm">
        <ArrowLeft className="ic" aria-hidden /> Back to bookings
      </Link>

      <div className="detail-head">
        <h1>{SERVICE_META[booking.serviceType].label}</h1>
        <span className="ref">{bookingRef(booking.id)}</span>
        <StatusBadge status={booking.status} />
        <PaymentBadge status={booking.paymentStatus} withPrefix />
      </div>

      <div className="detail-grid">
        {/* LEFT COLUMN */}
        <div className="col-left">
          <section className="a-card" aria-labelledby="uiHeading">
            <h2 id="uiHeading">
              <User className="ic" aria-hidden /> User Information
            </h2>
            <p className="card-note">Read-only — submitted at booking.</p>
            <dl className="info-grid">
              <div>
                <dt>Name</dt>
                <dd>{booking.contactName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{booking.contactEmail}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>+91 {booking.contactPhone}</dd>
              </div>
              <div>
                <dt>GST Number</dt>
                <dd className="mono">{booking.gstn}</dd>
              </div>
              <div>
                <dt>Organization</dt>
                <dd className={booking.organizationName ? undefined : 'muted'}>
                  {booking.organizationName ?? '—'}
                </dd>
              </div>
              <div>
                <dt>Filing For</dt>
                <dd>{booking.filingFor === 'self' ? 'Own business' : 'A client'}</dd>
              </div>
              <div>
                <dt>Booking Date</dt>
                <dd>{formatBookingDate(booking.createdAt)}</dd>
              </div>
              <div>
                <dt>Account</dt>
                <dd>
                  {booking.user.name}{' '}
                  <span className="muted" style={{ fontWeight: 400, color: 'var(--neutral-600)' }}>
                    ({booking.user.email})
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          <section className="a-card" aria-labelledby="docHeading">
            <h2 id="docHeading">
              <Files className="ic" aria-hidden /> Uploaded Documents
            </h2>
            <AdminDocumentList bookingId={booking.id} documents={booking.documents} />
          </section>

          <section className="a-card" aria-labelledby="noteHeading">
            <h2 id="noteHeading">
              <StickyNote className="ic" aria-hidden /> Admin Note
            </h2>
            <p className="card-note">Visible to the user on their service detail page.</p>
            <AdminNoteEditor bookingId={booking.id} initialNote={booking.adminNote} />
          </section>
        </div>

        {/* RIGHT COLUMN (sticky) */}
        <div className="col-right">
          <DraftCard
            bookingId={booking.id}
            status={booking.status}
            hasDraft={booking.hasDraft}
            updatedAt={booking.updatedAt}
          />
          <StatusActions
            bookingId={booking.id}
            status={booking.status}
            paymentStatus={booking.paymentStatus}
          />
        </div>
      </div>
    </>
  );
}
