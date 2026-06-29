import { requireUser } from '@/lib/auth/session';

// Auth gate for the whole dashboard route group (frontend.md §4.2). The full
// App Shell (sidebar + drawer + mobile tab bar) is added in EP11 — this layout
// currently only enforces authentication.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <>{children}</>;
}
