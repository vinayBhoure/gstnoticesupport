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
  Users,
  Settings,
  LifeBuoy,
  Menu,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';

type AdminShellProps = {
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

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', Icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Bookings', Icon: FolderOpen, exact: false },
  { href: '/admin/users', label: 'Users', Icon: Users, exact: false },
  { href: '/admin/settings', label: 'Settings', Icon: Settings, exact: false },
] as const;

// Admin App Shell per resources/ui/Admin Overview.html — same shell pattern as
// DashboardShell with the admin link set and "Admin" nav label. Desktop-primary.
export function AdminShell({ userName, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const acctRef = useRef<HTMLDivElement>(null);

  // Close the drawer and account menu on navigation (adjust-state-during-render).
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setDrawerOpen(false);
    setAcctOpen(false);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
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

  function isActive(item: (typeof NAV_ITEMS)[number]): boolean {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <aside className={`sidebar${drawerOpen ? ' open' : ''}`} id="sidebar" aria-label="Primary">
        <Link href="/admin" className="sbrand" aria-label="GST Notice Support — admin">
          <Image src="/logo.png" alt="" width={30} height={30} />
          <span className="bn">
            GST<span>Notice</span>Support
          </span>
        </Link>
        <nav aria-label="Admin navigation">
          <span className="nav-label">Admin</span>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              aria-current={isActive(item) ? 'page' : undefined}
            >
              <item.Icon className="ic" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="side-foot">
          <Link href="/contact" className="side-help">
            <LifeBuoy className="ic" aria-hidden />
            Help &amp; Support
          </Link>
        </div>
      </aside>

      <div
        className={`app-scrim${drawerOpen ? ' open' : ''}`}
        hidden={!drawerOpen}
        onClick={() => setDrawerOpen(false)}
      />

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="sburger"
            aria-label="Open navigation"
            aria-controls="sidebar"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((open) => !open)}
          >
            <Menu size={22} aria-hidden />
          </button>
          <Link href="/admin" className="mobile-brand" aria-label="GST Notice Support — admin">
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
            <div
              className={`acct-menu${acctOpen ? ' open' : ''}`}
              id="acctMenu"
              role="menu"
              aria-label="Account"
            >
              <Link href="/admin/settings" role="menuitem">
                <Settings className="ic" aria-hidden />
                Settings
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
    </div>
  );
}
