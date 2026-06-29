import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--neutral-50)]">
      <Loader2 size={28} className="animate-spin text-[var(--neutral-600)]" aria-label="Loading" />
    </main>
  );
}
