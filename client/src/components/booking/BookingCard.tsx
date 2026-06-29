import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SERVICE_META } from '@/lib/constants/services';
import { NEXT_ACTION_COPY, formatBookingDate, bookingRef } from '@/lib/constants/booking-status';
import type { BookingSummaryDTO } from '@/lib/api/types';

type BookingCardProps = {
  booking: BookingSummaryDTO;
};

export function BookingCard({ booking }: BookingCardProps) {
  return (
    <Link
      href={`/dashboard/bookings/${booking.id}`}
      className="card card-elev flex flex-col gap-3 p-4 transition-colors hover:border-[var(--primary-deep-blue)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-semibold text-[var(--primary-navy)]">
          {SERVICE_META[booking.serviceType].label}
        </span>
        <StatusBadge status={booking.status} />
      </div>
      <p className="text-sm text-[var(--neutral-600)]">{NEXT_ACTION_COPY[booking.status]}</p>
      <div className="flex items-center gap-3 text-xs text-[var(--neutral-600)]">
        <span>{formatBookingDate(booking.createdAt)}</span>
        <span aria-hidden>·</span>
        <span className="font-mono">Ref {bookingRef(booking.id)}</span>
      </div>
    </Link>
  );
}
