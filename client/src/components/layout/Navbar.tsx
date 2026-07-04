'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';
import { NavAuthActions } from '@/components/layout/NavAuthActions';
import { NAV_LABELS, NAV_LINKS, NAV_SERVICE_ITEMS } from '@/data/common';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);

  const pathname = usePathname();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

  const isServicesActive = pathname.startsWith('/services');
  function navCurrent(href: string): 'page' | undefined {
    return pathname === href ? 'page' : undefined;
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  function openDrawer() {
    setDrawerOpen(true);
    document.body.classList.add('drawer-open');
    requestAnimationFrame(() => drawerCloseRef.current?.focus());
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setServicesExpanded(false);
    document.body.classList.remove('drawer-open');
    requestAnimationFrame(() => hamburgerRef.current?.focus());
  }

  return (
    <>
      <header className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
        <div className="container row">
          <Link className="brand" href="/" aria-label="GST Notice Support home">
            <Image src="/logo.png" alt="" width={40} height={40} priority />
            <span className="bn">GST<span>Notice</span>Support</span>
          </Link>

          <nav className="links" aria-label="Primary">
            <div className="has-drop">
              <button
                aria-haspopup="true"
                aria-expanded="false"
                className={isServicesActive ? 'nav-active' : undefined}
              >
                {NAV_LABELS.servicesDropdown} <ChevronDown style={{ width: 15, height: 15 }} />
              </button>
              <div className="drop-menu" role="menu">
                {NAV_SERVICE_ITEMS.map(item => (
                  <Link key={item.href} href={item.href} role="menuitem">
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </Link>
                ))}
              </div>
            </div>
            {NAV_LINKS.map(item => (
              <Link key={item.href} href={item.href} aria-current={navCurrent(item.href)}>{item.label}</Link>
            ))}
          </nav>

          <div className="right">
            <RequestCallbackButton className="btn btn-secondary nav-cta">{NAV_LABELS.callback}</RequestCallbackButton>
            <Link className="btn btn-primary nav-cta" href={NAV_LABELS.contact.href}>{NAV_LABELS.contact.label}</Link>
            <NavAuthActions variant="desktop" />
            <button
              ref={hamburgerRef}
              className="hamburger"
              id="hamburger"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              aria-controls="drawer"
              onClick={openDrawer}
            >
              <Menu style={{ width: 24, height: 24 }} />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer overlay */}
      <div
        className={`drawer-overlay${drawerOpen ? ' show' : ''}`}
        aria-hidden="true"
        onClick={closeDrawer}
      />

      {/* Mobile drawer */}
      <aside
        className={`drawer${drawerOpen ? ' open' : ''}`}
        id="drawer"
        aria-label="Mobile menu"
        aria-hidden={!drawerOpen}
      >
        <div className="drawer-head">
          <span className="brand">
            <Image src="/logo.png" alt="" width={36} height={36} />
            <span className="bn">GST<span>Notice</span>Support</span>
          </span>
          <button
            ref={drawerCloseRef}
            className="drawer-close"
            id="drawerClose"
            aria-label="Close menu"
            onClick={closeDrawer}
          >
            <X style={{ width: 24, height: 24 }} />
          </button>
        </div>

        <nav className="drawer-nav" aria-label="Mobile primary">
          <button
            className="drawer-services-toggle"
            aria-expanded={servicesExpanded}
            aria-controls="drawerServicesMenu"
            onClick={() => setServicesExpanded(v => !v)}
          >
            <span>{NAV_LABELS.servicesDropdown}</span>
            <ChevronRight
              className="drawer-services-chev"
              style={{ width: 18, height: 18 }}
            />
          </button>
          <div
            className={`drawer-services-menu${servicesExpanded ? ' open' : ''}`}
            id="drawerServicesMenu"
            aria-hidden={!servicesExpanded}
          >
            {NAV_SERVICE_ITEMS.map(item => (
              <Link key={item.href} href={item.href} onClick={closeDrawer}>{item.title}</Link>
            ))}
          </div>
          <span className="drawer-divider" />
          {NAV_LINKS.map(item => (
            <Link key={item.href} href={item.href} aria-current={navCurrent(item.href)} onClick={closeDrawer}>{item.label}</Link>
          ))}
        </nav>

        <div className="drawer-foot">
          <RequestCallbackButton className="btn btn-secondary btn-block" onClick={closeDrawer}>
            {NAV_LABELS.callback}
          </RequestCallbackButton>
          <Link className="btn btn-primary btn-block" href={NAV_LABELS.contact.href} onClick={closeDrawer}>
            {NAV_LABELS.contact.label}
          </Link>
          <NavAuthActions variant="mobile" onNavigate={closeDrawer} />
        </div>
      </aside>
    </>
  );
}
