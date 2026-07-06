'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ChevronRight, SearchX, FolderOpen } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BookingCard } from '@/components/booking/BookingCard';
import { SERVICE_META } from '@/lib/constants/services';
import { NEXT_ACTION_COPY, formatBookingDate } from '@/lib/constants/booking-status';
import type { BookingStatus, BookingSummaryDTO } from '@/lib/api/types';

type ServicesListViewProps = {
  bookings: BookingSummaryDTO[];
};

type Filter = 'all' | 'active' | 'complete' | 'cancelled';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'complete', label: 'Complete' },
  { key: 'cancelled', label: 'Cancelled' },
];

function groupOf(status: BookingStatus): Filter {
  if (status === 'complete') return 'complete';
  if (status === 'cancelled') return 'cancelled';
  return 'active';
}

// Client-side filter + table/card render per resources/ui/Services List.html.
// The booking list is per-user and unpaginated, so filtering happens in-memory.
export function ServicesListView({ bookings }: ServicesListViewProps) {
  const [filter, setFilter] = useState<Filter>('all');

  // No bookings at all → new-user empty state (never the filtered empty state).
  if (bookings.length === 0) {
    return (
      <div className="empty-state">
        <FolderOpen className="ic-big" aria-hidden />
        <h2>No services yet</h2>
        <p>Book your first service to get started.</p>
        <Link href="/dashboard/bookings/new" className="btn btn-primary">
          <Plus className="ic" aria-hidden /> Book New Service
        </Link>
      </div>
    );
  }

  const list =
    filter === 'all' ? bookings : bookings.filter((b) => groupOf(b.status) === filter);

  return (
    <>
      <div className="filter-bar" role="radiogroup" aria-label="Filter by status">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className="chip"
            role="radio"
            aria-checked={filter === key}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <SearchX className="ic-big" aria-hidden />
          <h2>No {filter === 'all' ? '' : `${FILTERS.find((f) => f.key === filter)?.label} `}services.</h2>
          <button type="button" className="btn-tertiary" onClick={() => setFilter('all')}>
            Clear filter
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table (≥lg) */}
          <div className="tbl-wrap">
            <table aria-label="Bookings">
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Next Action</th>
                  <th scope="col">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((booking) => {
                  const label = SERVICE_META[booking.serviceType].label;
                  const next = NEXT_ACTION_COPY[booking.status];
                  return (
                    <tr key={booking.id} className="trow">
                      <td className="td-service">
                        <Link
                          className="row-anchor"
                          href={`/dashboard/bookings/${booking.id}`}
                          aria-label={`${label} — ${next}. View details.`}
                        >
                          {label}
                        </Link>
                      </td>
                      <td className="td-date">{formatBookingDate(booking.createdAt)}</td>
                      <td>
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="td-nextact">{next}</td>
                      <td className="td-chev">
                        <ChevronRight className="cic" aria-hidden />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards (<lg) */}
          <div className="cards-stack-wrap">
            <div className="cards-stack">
              {list.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
