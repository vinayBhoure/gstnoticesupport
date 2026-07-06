import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { ChevronRight, FolderOpen, Search } from 'lucide-react';
import { adminApi, type AdminBookingListParams } from '@/lib/api/admin';
import { adminBookingListQuerySchema } from '@/lib/shared-schemas/admin.schema';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PaymentBadge } from '@/components/admin/PaymentBadge';
import { BookingControls } from '@/components/admin/BookingControls';
import { SortHeader } from '@/components/admin/SortHeader';
import { Pagination } from '@/components/admin/Pagination';
import { RowLink } from '@/components/admin/RowLink';
import { SERVICE_META } from '@/lib/constants/services';
import { formatBookingDate, bookingRef } from '@/lib/constants/booking-status';

export const metadata: Metadata = {
  title: 'Admin · Bookings — GST Notice Support',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Admin Bookings per resources/ui/Admin Bookings.html — search, filters,
// sortable columns, pagination, all URL-driven. Invalid params fall back to
// defaults instead of erroring.
export default async function AdminBookingsPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const candidate = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const parsed = adminBookingListQuerySchema.safeParse(candidate);
  const query = parsed.success ? parsed.data : adminBookingListQuerySchema.parse({});
  // The list defaults to newest-updated first (prototype default) unless sorted.
  const params: AdminBookingListParams = {
    ...query,
    sortBy: candidate.sortBy ? query.sortBy : 'updatedAt',
  };

  const cookieHeader = (await cookies()).toString();
  const { data: bookings, meta } = await adminApi.listBookings(params, cookieHeader);

  const hasFilters = Boolean(query.search || query.status || query.paymentStatus || query.serviceType);
  const preservedQuery = {
    search: query.search,
    status: query.status,
    paymentStatus: query.paymentStatus,
    serviceType: query.serviceType,
    sortBy: candidate.sortBy,
    sortDir: candidate.sortDir,
  };

  return (
    <>
      <div className="page-head" style={{ display: 'block', marginBottom: 24 }}>
        <h1>Bookings</h1>
        <p className="sub">
          {meta.total} booking{meta.total === 1 ? '' : 's'}
        </p>
      </div>

      <BookingControls />

      <div className="table-card">
        {bookings.length > 0 ? (
          <>
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="th-plain">User Name</span>
                    </th>
                    <th scope="col">
                      <span className="th-plain">Service</span>
                    </th>
                    <th scope="col">
                      <SortHeader field="createdAt" label="Booking Date" defaultField="updatedAt" />
                    </th>
                    <th scope="col">
                      <SortHeader field="updatedAt" label="Updated" defaultField="updatedAt" />
                    </th>
                    <th scope="col">
                      <span className="th-plain">Payment</span>
                    </th>
                    <th scope="col">
                      <span className="th-plain">Status</span>
                    </th>
                    <th scope="col" aria-hidden>
                      <span className="th-plain" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <RowLink
                      key={booking.id}
                      href={`/admin/bookings/${booking.id}`}
                      ariaLabel={`${booking.user.name} — ${SERVICE_META[booking.serviceType].label}. Open booking.`}
                    >
                      <td>
                        <div className="t-name-wrap">
                          <span className="nm">{booking.user.name}</span>
                          <span className="ref">{bookingRef(booking.id)}</span>
                        </div>
                      </td>
                      <td>{SERVICE_META[booking.serviceType].label}</td>
                      <td className="t-date">{formatBookingDate(booking.createdAt)}</td>
                      <td className="t-date">{formatBookingDate(booking.updatedAt)}</td>
                      <td>
                        <PaymentBadge status={booking.paymentStatus} />
                      </td>
                      <td>
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="t-arrow">
                        <ChevronRight className="ic" aria-hidden />
                      </td>
                    </RowLink>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={meta.page}
              limit={meta.limit}
              total={meta.total}
              basePath="/admin/bookings"
              query={preservedQuery}
            />
          </>
        ) : (
          <div className="table-empty">
            {hasFilters ? (
              <Search className="ic-big" aria-hidden />
            ) : (
              <FolderOpen className="ic-big" aria-hidden />
            )}
            <p>{hasFilters ? 'No bookings match these filters.' : 'No bookings yet.'}</p>
          </div>
        )}
      </div>
    </>
  );
}
