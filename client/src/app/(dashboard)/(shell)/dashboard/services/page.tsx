import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth/session';
import { bookingApi } from '@/lib/api/booking';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ServicesListView } from './ServicesListView';

export const metadata: Metadata = {
  title: 'My Services — GST Notice Support',
  robots: { index: false, follow: false },
};

// My Services per resources/ui/Services List.html — the full chronological list of
// the user's bookings with a status filter. Data comes from GET /bookings (all of
// the user's bookings, newest-first); filtering is client-side (ServicesListView).
export default async function ServicesPage() {
  await requireUser();
  const cookieHeader = (await cookies()).toString();
  const bookings = await bookingApi.list(cookieHeader);

  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }]} current="My Services" />

      <div className="page-head" style={{ marginBottom: 24 }}>
        <h1>My Services</h1>
        <Link href="/dashboard/bookings/new" className="btn btn-primary">
          <Plus className="ic" aria-hidden /> Book New Service
        </Link>
      </div>

      <ServicesListView bookings={bookings} />
    </>
  );
}
