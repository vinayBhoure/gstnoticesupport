import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  FolderOpen,
  ListChecks,
  IndianRupee,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RowLink } from '@/components/admin/RowLink';
import { SERVICE_META, SERVICE_ORDER } from '@/lib/constants/services';
import { formatBookingDate } from '@/lib/constants/booking-status';
import type { AdminBookingListItemDTO, BookingStatus } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Admin · Overview — GST Notice Support',
  robots: { index: false, follow: false },
};

const STATUS_ORDER: BookingStatus[] = [
  'document_upload',
  'in_review',
  'draft_ready',
  'filing',
  'complete',
  'cancelled',
];

function formatInr(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

// Admin Overview per resources/ui/Admin Overview.html — KPI row + Needs attention.
// The prototype's time-range control is omitted (no range param on /admin/stats).
export default async function AdminOverviewPage() {
  const cookieHeader = (await cookies()).toString();

  const [stats, draftReady, inReview] = await Promise.all([
    adminApi.getStats(cookieHeader),
    adminApi.listBookings(
      { status: 'draft_ready', limit: 6, sortBy: 'updatedAt', sortDir: 'desc' },
      cookieHeader,
    ),
    adminApi.listBookings(
      { status: 'in_review', limit: 6, sortBy: 'updatedAt', sortDir: 'desc' },
      cookieHeader,
    ),
  ]);

  // Needs attention: draft-ready awaiting payment + in-review awaiting draft.
  const attention: AdminBookingListItemDTO[] = [
    ...draftReady.data.filter((b) => b.paymentStatus !== 'paid'),
    ...inReview.data,
  ]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 6);

  return (
    <>
      <div className="page-head">
        <h1>Overview</h1>
      </div>

      <div className="kpi-row">
        <div className="stat-card">
          <span className="sc-label">
            <FolderOpen className="ic" aria-hidden /> Total Bookings
          </span>
          <span className="sc-value">{stats.totalBookings}</span>
          <p className="sc-sub">
            {SERVICE_ORDER.map((serviceType, index) => (
              <span key={serviceType}>
                {index > 0 && ' · '}
                {SERVICE_META[serviceType].label.replace(' Reply', '').replace(' Appeal', '')}{' '}
                <b>{stats.byServiceType[serviceType]}</b>
              </span>
            ))}
          </p>
        </div>

        <div className="stat-card sc-statuses">
          <span className="sc-label">
            <ListChecks className="ic" aria-hidden /> Bookings by Status
          </span>
          <div className="status-count-list">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="status-count">
                <StatusBadge status={status} />
                <span className="n">{stats.byStatus[status]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <span className="sc-label">
            <IndianRupee className="ic" aria-hidden /> Revenue Collected
          </span>
          <span className="sc-value">{formatInr(stats.totalRevenuePaise)}</span>
          <p className="sc-sub">Captured payments across all bookings</p>
        </div>
      </div>

      <section className="section-block" aria-labelledby="attnHeading" style={{ marginTop: 48 }}>
        <div className="section-head">
          <h2 id="attnHeading">Needs attention</h2>
          <Link className="btn-tertiary" href="/admin/bookings">
            View all bookings <ArrowRight size={15} aria-hidden />
          </Link>
        </div>

        <div className="table-card">
          {attention.length > 0 ? (
            <div className="table-scroll">
              <table className="admin-table" aria-describedby="attnHeading" style={{ minWidth: 640 }}>
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="th-plain">User Name</span>
                    </th>
                    <th scope="col">
                      <span className="th-plain">Service</span>
                    </th>
                    <th scope="col">
                      <span className="th-plain">Status</span>
                    </th>
                    <th scope="col">
                      <span className="th-plain">Updated</span>
                    </th>
                    <th scope="col" aria-hidden>
                      <span className="th-plain" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attention.map((booking) => (
                    <RowLink
                      key={booking.id}
                      href={`/admin/bookings/${booking.id}`}
                      ariaLabel={`${booking.user.name} — ${SERVICE_META[booking.serviceType].label}. Open booking detail.`}
                    >
                      <td className="t-name">{booking.user.name}</td>
                      <td>{SERVICE_META[booking.serviceType].label}</td>
                      <td>
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="t-updated">{formatBookingDate(booking.updatedAt)}</td>
                      <td className="t-arrow">
                        <ArrowRight className="ic" aria-hidden />
                      </td>
                    </RowLink>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-empty">
              <CheckCircle className="ic-big green" aria-hidden />
              <p>Nothing needs attention right now.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
