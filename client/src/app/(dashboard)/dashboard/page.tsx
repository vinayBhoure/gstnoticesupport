import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/session';
import { LogoutButton } from './LogoutButton';

export const metadata: Metadata = {
  title: 'Dashboard — GST Notice Support',
  robots: { index: false, follow: false },
};

// Minimal placeholder landing (EP10). The full dashboard — booking list, status
// badges, summary cards — is built in EP11.
export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="min-h-screen bg-[var(--neutral-50)] px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="card card-elev p-8">
          <h1 className="text-2xl font-bold text-[var(--primary-navy)]">
            Welcome, {user.name}
          </h1>
          <p className="mt-2 text-[var(--neutral-600)]">
            You&apos;re signed in. Your dashboard, bookings, and document upload are coming next.
          </p>
          <div className="mt-6">
            <LogoutButton />
          </div>
        </div>
      </div>
    </main>
  );
}
