import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { requireUser } from '@/lib/auth/session';
import { bookingApi } from '@/lib/api/booking';
import { ApiRequestError } from '@/lib/api/client';
import { SERVICE_META } from '@/lib/constants/services';
import { DraftViewer } from './DraftViewer';
import type { BookingDetailWithRelationsDTO } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Draft — GST Notice Support',
  robots: { index: false, follow: false },
};

// The draft is only accessible once the booking reaches filing/complete
// (server enforces this too; we guard here to avoid a needless failed fetch).
export default async function DraftPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (booking.status !== 'filing' && booking.status !== 'complete') {
    redirect(`/dashboard/bookings/${id}`);
  }

  return (
    <DraftViewer
      bookingId={id}
      serviceLabel={SERVICE_META[booking.serviceType].label}
      hasFinalDraft={booking.hasFinalDraft}
    />
  );
}
