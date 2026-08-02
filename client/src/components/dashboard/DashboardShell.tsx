'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  FolderOpen,
  CreditCard,
  Settings,
  LifeBuoy,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';

type DashboardShellProps = {
  userName: string;
  children: React.ReactNode;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function DashboardShell({ userName, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [acctOpen, setAcctOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const acctRef = useRef<HTMLDivElement>(null);

  // Close the account menu on navigation (adjust-state-during-render
  // pattern — no effect needed).
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setAcctOpen(false);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setAcctOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) {
        setAcctOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onClick);
    };
  }, []);

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      router.push('/login');
      router.refresh();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  // Booking detail lives under /dashboard/bookings/* and stays grouped under
  // Dashboard; each new section lights up only on its own subtree.
  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/bookings');
  const isServices = pathname.startsWith('/dashboard/services');
  const isPayments = pathname.startsWith('/dashboard/payments');
  const isSettings = pathname.startsWith('/dashboard/settings');
  const isHelp = pathname.startsWith('/dashboard/help');

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Desktop-only: mobile/tablet navigation is the bottom tab bar, per the
          design system — never both at once. display:none (not translate) so the
          hidden links are also removed from the keyboard tab order. */}
      <aside className="sidebar sidebar-desktop" id="sidebar" aria-label="Primary">
        <Link href="/dashboard" className="sbrand" aria-label="GST Notice Support dashboard home">
          <Image src="/logo.png" alt="" width={30} height={30} />
          <span className="bn">
            GST<span>Notice</span>Support
          </span>
        </Link>
        <nav aria-label="Dashboard navigation">
          <Link
            href="/dashboard"
            className="nav-link"
            aria-current={isDashboard ? 'page' : undefined}
          >
            <LayoutDashboard className="ic" aria-hidden />
            Dashboard
          </Link>
          <Link
            href="/dashboard/services"
            className="nav-link"
            aria-current={isServices ? 'page' : undefined}
          >
            <FolderOpen className="ic" aria-hidden />
            My Services
          </Link>
          <Link
            href="/dashboard/payments"
            className="nav-link"
            aria-current={isPayments ? 'page' : undefined}
          >
            <CreditCard className="ic" aria-hidden />
            Payments
          </Link>
          <Link
            href="/dashboard/settings"
            className="nav-link"
            aria-current={isSettings ? 'page' : undefined}
          >
            <Settings className="ic" aria-hidden />
            Settings
          </Link>
        </nav>
        <div className="side-foot">
          <Link href="/dashboard/help" className="side-help" aria-current={isHelp ? 'page' : undefined}>
            <LifeBuoy className="ic" aria-hidden />
            Help &amp; Support
          </Link>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <Link
            href="/dashboard"
            className="mobile-brand"
            aria-label="GST Notice Support dashboard home"
          >
            <Image src="/logo.png" alt="" width={28} height={28} />
            <span className="bn">
              GST<span>Notice</span>Support
            </span>
          </Link>

          <span className="spacer" />

          <div className="acct" ref={acctRef}>
            <button
              type="button"
              className="acct-btn"
              aria-haspopup="true"
              aria-expanded={acctOpen}
              aria-controls="acctMenu"
              onClick={() => setAcctOpen((open) => !open)}
            >
              <span className="acct-avatar" aria-hidden>
                {initials(userName)}
              </span>
              <span className="acct-name">{userName}</span>
              <ChevronDown className="chev" aria-hidden />
            </button>
            <div className={`acct-menu${acctOpen ? ' open' : ''}`} id="acctMenu" role="menu" aria-label="Account">
              <Link href="/dashboard/profile" role="menuitem">
                <User className="ic" aria-hidden />
                My Profile
              </Link>
              <Link href="/dashboard/settings" role="menuitem">
                <Settings className="ic" aria-hidden />
                Settings
              </Link>
              <div className="divider" aria-hidden />
              <Link href="/dashboard/help" role="menuitem">
                <LifeBuoy className="ic" aria-hidden />
                Help &amp; Support
              </Link>
              <div className="divider" aria-hidden />
              <button
                type="button"
                role="menuitem"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <LogOut className="ic" aria-hidden />
                {logout.isPending ? 'Logging out…' : 'Log out'}
              </button>
            </div>
          </div>
        </header>

        <main id="main" className="content">
          <div className="content-inner">{children}</div>
        </main>
      </div>

      {/* Mobile bottom tab bar (<lg only) — resources/ui prototypes → .tabbar. */}
      <nav className="tabbar" aria-label="Primary">
        <Link href="/dashboard" className="tab" aria-current={isDashboard ? 'page' : undefined}>
          <LayoutDashboard className="ic" aria-hidden />
          <span className="lbl">Dashboard</span>
        </Link>
        <Link
          href="/dashboard/services"
          className="tab"
          aria-current={isServices ? 'page' : undefined}
        >
          <FolderOpen className="ic" aria-hidden />
          <span className="lbl">Services</span>
        </Link>
        <Link
          href="/dashboard/payments"
          className="tab"
          aria-current={isPayments ? 'page' : undefined}
        >
          <CreditCard className="ic" aria-hidden />
          <span className="lbl">Payments</span>
        </Link>
        <Link
          href="/dashboard/settings"
          className="tab"
          aria-current={isSettings ? 'page' : undefined}
        >
          <Settings className="ic" aria-hidden />
          <span className="lbl">Settings</span>
        </Link>
      </nav>
    </div>
  );
}
