import { requireUser } from '@/lib/auth/session';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

// Sidebar app shell for the authenticated dashboard screens
// (resources/ui/Dashboard Home.html → App Shell). The booking wizard lives in
// the sibling (flow) group with a focused, chromeless layout instead.
// The admin → /admin redirect lives in the parent (dashboard) layout.
export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <DashboardShell userName={user.name}>{children}</DashboardShell>;
}
