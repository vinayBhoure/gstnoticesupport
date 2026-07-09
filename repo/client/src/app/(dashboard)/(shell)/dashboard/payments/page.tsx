import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Plus, Receipt, DownloadCloud, ChevronRight, ArrowRight } from 'lucide-react';
import { requireUser } from '@/lib/auth/session';
import { userApi } from '@/lib/api/user';
import { paymentHistoryQuerySchema } from '@/lib/shared-schemas/user.schema';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/admin/Pagination';
import { SERVICE_META } from '@/lib/constants/services';
import { formatBookingDate, bookingRef } from '@/lib/constants/booking-status';

export const metadata: Metadata = {
  title: 'Payment History — GST Notice Support',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function formatInr(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

// Payment History per resources/ui/Payment History.html — offset-paginated (D64),
// captured payments only (KB1 §8.1). The receipt link opens the booking's Service
// Detail page (D64 clarification: no hosted Razorpay receipt URL exists to link to).
export default async function PaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser();

  const raw = await searchParams;
  const candidate = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const parsed = paymentHistoryQuerySchema.safeParse(candidate);
  const query = parsed.success ? parsed.data : paymentHistoryQuerySchema.parse({});

  const cookieHeader = (await cookies()).toString();
  const { data: payments, meta } = await userApi.paymentHistory(query, cookieHeader);

  return (
    <>
      <div className="page-head" style={{ marginBottom: 32 }}>
        <h1>Payment History</h1>
        <Link href="/dashboard/bookings/new" className="btn btn-primary">
          <Plus className="ic" aria-hidden /> Book New Service
        </Link>
      </div>

      {payments.length === 0 ? (
        <div className="empty-state">
          <Receipt className="ic-big" aria-hidden />
          <h2>No payments yet</h2>
          <p>Payments will appear here after you unlock your first draft.</p>
          <Link href="/dashboard/services" className="btn-tertiary">
            View My Services <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table (≥lg) */}
          <div className="payment-table-wrap">
            <table className="payment-table" aria-label="Your payment history">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Service</th>
                  <th scope="col">Reference</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="col-receipt">
                    Receipt
                  </th>
                  <th scope="col" className="col-view">
                    <span className="sr-only">View service</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const label = SERVICE_META[p.serviceType].label;
                  return (
                    <tr key={p.id} className="payment-row">
                      <td className="col-date">{formatBookingDate(p.createdAt)}</td>
                      <td className="col-service">{label}</td>
                      <td className="col-ref">{p.razorpayPaymentId ?? bookingRef(p.bookingId)}</td>
                      <td className="col-amount">{formatInr(p.amountPaise)}</td>
                      <td className="col-status">
                        <StatusBadge status={p.bookingStatus} />
                      </td>
                      <td className="col-receipt">
                        <span className="receipt-wrap">
                          <Link
                            href={`/dashboard/bookings/${p.bookingId}`}
                            className="receipt-link receipt-available"
                            aria-label={`View receipt for ${label}, ${formatBookingDate(p.createdAt)}, ${formatInr(p.amountPaise)}`}
                          >
                            <DownloadCloud size={22} strokeWidth={1.5} aria-hidden />
                          </Link>
                        </span>
                      </td>
                      <td className="col-view">
                        <Link
                          href={`/dashboard/bookings/${p.bookingId}`}
                          className="view-link"
                          aria-label={`View ${label} service details`}
                        >
                          <ChevronRight size={20} strokeWidth={1.8} aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards (<lg) */}
          <div className="payment-cards">
            {payments.map((p) => {
              const label = SERVICE_META[p.serviceType].label;
              return (
                <article className="payment-card" key={p.id} aria-label={`${label}, ${formatBookingDate(p.createdAt)}`}>
                  <div className="pc-row1">
                    <span className="pc-service">{label}</span>
                    <StatusBadge status={p.bookingStatus} />
                  </div>
                  <div className="pc-row2">
                    <span className="pc-date">{formatBookingDate(p.createdAt)}</span>
                    <span className="pc-sep" aria-hidden>
                      ●
                    </span>
                    <span className="pc-amount">{formatInr(p.amountPaise)}</span>
                  </div>
                  <div className="pc-row3">{p.razorpayPaymentId ?? bookingRef(p.bookingId)}</div>
                  <div className="pc-row4">
                    <Link
                      href={`/dashboard/bookings/${p.bookingId}`}
                      className="card-action action-receipt"
                      aria-label={`View receipt for ${label}`}
                    >
                      <DownloadCloud size={16} strokeWidth={1.5} aria-hidden /> View Receipt
                    </Link>
                    <Link
                      href={`/dashboard/bookings/${p.bookingId}`}
                      className="card-action action-view"
                      aria-label={`View ${label} service`}
                    >
                      View Service <ArrowRight size={14} strokeWidth={1.8} aria-hidden />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <Pagination
            page={meta.page}
            limit={meta.limit}
            total={meta.total}
            basePath="/dashboard/payments"
            query={{}}
          />
        </>
      )}
    </>
  );
}
