import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Plus, AlertCircle, FolderOpen, ArrowRight } from 'lucide-react';
import { requireUser } from '@/lib/auth/session';
import { bookingApi } from '@/lib/api/booking';
import { BookingCard } from '@/components/booking/BookingCard';
import { SERVICE_META } from '@/lib/constants/services';
import type { BookingStatus, BookingSummaryDTO } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Dashboard — GST Notice Support',
  robots: { index: false, follow: false },
};

const ACTIVE_STATUSES: BookingStatus[] = ['document_upload', 'in_review', 'draft_ready', 'filing'];

// Greeting and date are rendered in IST — the audience timezone — so the
// server-rendered value matches what an Indian user expects to see.
function greetingParts(): { greeting: string; date: string } {
  const now = new Date();
  const hour = Number(
    new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    }).format(now),
  );
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const date = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(now);
  return { greeting, date };
}

// Draft-ready bookings render first (prototype: attention items lead the grid).
function sortDraftFirst(bookings: BookingSummaryDTO[]): BookingSummaryDTO[] {
  return [...bookings].sort(
    (a, b) => Number(b.status === 'draft_ready') - Number(a.status === 'draft_ready'),
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const cookieHeader = (await cookies()).toString();
  const bookings = await bookingApi.list(cookieHeader);

  const { greeting, date } = greetingParts();
  const firstName = user.name.split(/\s+/)[0];

  const active = sortDraftFirst(bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)));
  const past = bookings.filter((b) => b.status === 'complete' || b.status === 'cancelled');
  const completeCount = past.filter((b) => b.status === 'complete').length;
  const cancelledCount = past.length - completeCount;
  const draftBooking = active.find((b) => b.status === 'draft_ready');

  return (
    <>
      <div className="page-head">
        <div className="greet">
          <h1>
            {greeting}, {firstName}
          </h1>
          <div className="date">{date}</div>
        </div>
        {bookings.length > 0 && (
          <Link href="/dashboard/bookings/new" className="btn btn-primary">
            <Plus className="ic" aria-hidden /> Book New Service
          </Link>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <FolderOpen className="ic-big" aria-hidden />
          <h2>No active services</h2>
          <p>Book your first service to get expert help with your GST notice.</p>
          <Link href="/dashboard/bookings/new" className="btn btn-primary">
            <Plus className="ic" aria-hidden /> Book New Service
          </Link>
        </div>
      ) : (
        <>
          <div className="summary-strip" aria-label="Account summary">
            <span className="seg">
              <b>{active.length}</b> Active
            </span>
            <span className="dot" aria-hidden />
            <span className="seg">
              <b>{completeCount}</b> Complete
            </span>
            <span className="dot" aria-hidden />
            <span className="seg">
              <b>{cancelledCount}</b> Cancelled
            </span>
          </div>

          {draftBooking && (
            <div className="attn-banner" role="status" aria-live="polite">
              <AlertCircle className="ic-lead" aria-hidden />
              <p className="txt">
                <b>{SERVICE_META[draftBooking.serviceType].label}</b> — draft ready, payment
                required
              </p>
              <Link className="btn-tertiary" href={`/dashboard/bookings/${draftBooking.id}`}>
                View Service <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
          )}

          <section className="section-block" aria-labelledby="activeHeading">
            <div className="section-head">
              <h2 id="activeHeading">Active Services</h2>
            </div>
            {active.length > 0 ? (
              <div className="cards-grid">
                {active.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--neutral-600)]">No active services right now.</p>
            )}
          </section>

          {past.length > 0 && (
            <section className="section-block" aria-labelledby="pastHeading">
              <div className="section-head">
                <h2 id="pastHeading">Past Services</h2>
              </div>
              <div className="cards-grid">
                {past.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
