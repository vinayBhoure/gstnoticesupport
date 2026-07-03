import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SERVICE_META } from '@/lib/constants/services';
import { NEXT_ACTION_COPY, formatBookingDate, bookingRef } from '@/lib/constants/booking-status';
import type { BookingSummaryDTO } from '@/lib/api/types';

type BookingCardProps = {
  booking: BookingSummaryDTO;
};

// Booking Summary Card per resources/ui/Dashboard Home.html → .booking-card.
export function BookingCard({ booking }: BookingCardProps) {
  const label = SERVICE_META[booking.serviceType].label;
  return (
    <Link
      href={`/dashboard/bookings/${booking.id}`}
      className={`booking-card${booking.status === 'draft_ready' ? ' draft-ready' : ''}`}
      aria-label={`${label} — ${NEXT_ACTION_COPY[booking.status]} View details.`}
    >
      <div className="bc-row1">
        <span className="bc-type">{label}</span>
        <StatusBadge status={booking.status} />
      </div>
      <p className="bc-next">{NEXT_ACTION_COPY[booking.status]}</p>
      <div className="bc-meta">
        <span>{formatBookingDate(booking.createdAt)}</span>
        <span className="sep" aria-hidden>
          ·
        </span>
        <span className="mono">{bookingRef(booking.id)}</span>
      </div>
    </Link>
  );
}
