import { requireAdmin } from '@/lib/auth/session';
import { AdminShell } from '@/components/admin/AdminShell';

// Role gate for the whole admin route group (frontend.md §4.3): anonymous →
// /login, non-admin → /dashboard. Wraps every screen in the admin App Shell.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <AdminShell userName={user.name}>{children}</AdminShell>;
}
