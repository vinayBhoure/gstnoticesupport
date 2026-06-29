import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { requireUser } from '@/lib/auth/session';
import { bookingApi } from '@/lib/api/booking';
import { BookingCard } from '@/components/booking/BookingCard';
import { LogoutButton } from './LogoutButton';

export const metadata: Metadata = {
  title: 'Dashboard — GST Notice Support',
  robots: { index: false, follow: false },
};

// Server Component: fetches the user's bookings at render time (frontend.md §1.1),
// forwarding the HTTP-only cookie. No client-side loading flash.
export default async function DashboardPage() {
  const user = await requireUser();
  const cookieHeader = (await cookies()).toString();
  const bookings = await bookingApi.list(cookieHeader);

  return (
    <main className="min-h-screen bg-[var(--neutral-50)] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--primary-navy)]">
              Welcome, {user.name}
            </h1>
            <p className="mt-1 text-sm text-[var(--neutral-600)]">My services</p>
          </div>
          <LogoutButton />
        </header>

        <div className="mb-6 flex justify-end">
          <Link href="/dashboard/bookings/new" className="btn btn-primary">
            Start a service
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="card card-elev flex flex-col items-center gap-3 p-10 text-center">
            <h2 className="text-lg font-semibold text-[var(--primary-navy)]">
              No services yet
            </h2>
            <p className="max-w-sm text-sm text-[var(--neutral-600)]">
              Start a service to upload your GST notice and get expert help preparing your reply.
            </p>
            <Link href="/dashboard/bookings/new" className="btn btn-primary">
              Start a service
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
