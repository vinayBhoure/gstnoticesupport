import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { FileText } from 'lucide-react';

import { requireUser } from '@/lib/auth/session';
import { bookingApi } from '@/lib/api/booking';
import { ApiRequestError } from '@/lib/api/client';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BookingActionPanel } from './BookingActionPanel';
import { SERVICE_META } from '@/lib/constants/services';
import { formatBookingDate, bookingRef } from '@/lib/constants/booking-status';
import type { BookingDetailWithRelationsDTO } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Booking — GST Notice Support',
  robots: { index: false, follow: false },
};

type Row = { label: string; value: string };

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

  const caseRows: Row[] = [
    { label: 'Service', value: SERVICE_META[booking.serviceType].label },
    { label: 'GSTIN', value: booking.gstn },
    { label: 'Filing for', value: booking.filingFor === 'self' ? 'Myself' : 'On behalf of client' },
    { label: 'Contact name', value: booking.contactName },
    { label: 'Contact email', value: booking.contactEmail },
    { label: 'Contact phone', value: booking.contactPhone },
    ...(booking.organizationName
      ? [{ label: 'Organization', value: booking.organizationName }]
      : []),
    { label: 'Created', value: formatBookingDate(booking.createdAt) },
  ];

  return (
    <main className="min-h-screen bg-[var(--neutral-50)] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-6 text-sm text-[var(--neutral-600)]">
          <Link href="/dashboard" className="hover:text-[var(--neutral-900)]">
            My services
          </Link>
          <span aria-hidden> › </span>
          <span className="text-[var(--neutral-900)]">
            {SERVICE_META[booking.serviceType].label}
          </span>
        </nav>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--primary-navy)]">
              {SERVICE_META[booking.serviceType].label}
            </h1>
            <p className="mt-1 font-mono text-xs text-[var(--neutral-600)]">
              Ref {bookingRef(booking.id)}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-6">
            <section className="card card-elev p-6">
              <h2 className="mb-4 text-lg font-semibold text-[var(--primary-navy)]">
                Case information
              </h2>
              <dl className="flex flex-col gap-3">
                {caseRows.map((row) => (
                  <div key={row.label} className="flex justify-between gap-4 text-sm">
                    <dt className="text-[var(--neutral-600)]">{row.label}</dt>
                    <dd className="text-right font-medium text-[var(--neutral-900)]">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="card card-elev p-6">
              <h2 className="mb-4 text-lg font-semibold text-[var(--primary-navy)]">
                Uploaded documents
              </h2>
              {booking.documents.length === 0 ? (
                <p className="text-sm text-[var(--neutral-600)]">No documents uploaded yet.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {booking.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center gap-3 rounded-[var(--r-btn)] border border-[var(--neutral-200)] p-3"
                    >
                      <FileText size={18} className="shrink-0 text-[var(--neutral-600)]" aria-hidden />
                      <span className="flex-1 truncate text-sm text-[var(--neutral-900)]">
                        {doc.fileName}
                      </span>
                      <span className="text-xs text-[var(--neutral-600)]">
                        {formatBookingDate(doc.uploadedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {booking.adminNote && (
              <section className="card card-elev p-6">
                <h2 className="mb-2 text-lg font-semibold text-[var(--primary-navy)]">
                  Note from our team
                </h2>
                <p className="whitespace-pre-line text-sm text-[var(--neutral-900)]">
                  {booking.adminNote}
                </p>
              </section>
            )}
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <BookingActionPanel
              bookingId={booking.id}
              status={booking.status}
              paymentStatus={booking.paymentStatus}
              serviceType={booking.serviceType}
              documentCount={booking.documents.length}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
