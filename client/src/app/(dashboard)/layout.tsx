import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';

// Auth gate for the whole dashboard route group (frontend.md §4.2). Admins are
// routed to their own surface — the prototypes give them no user dashboard.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role === 'admin') redirect('/admin');
  return <>{children}</>;
}
