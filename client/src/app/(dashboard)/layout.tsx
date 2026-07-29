import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';

// Auth gate for the whole dashboard route group (frontend.md §4.2). Admins are
// routed to their own surface — the prototypes give them no user dashboard.
// A missing phone number blocks every dashboard route until complete-profile is
// done (mobile number is required for WhatsApp notifications going forward).
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role === 'admin') redirect('/admin');
  if (!user.phone) redirect('/complete-profile');
  return <>{children}</>;
}
