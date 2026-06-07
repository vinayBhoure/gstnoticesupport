'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Phone, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';

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
                Services <ChevronDown style={{ width: 15, height: 15 }} />
              </button>
              <div className="drop-menu" role="menu">
                <Link href="/services/asmt-10" role="menuitem">
                  <strong>ASMT-10 Scrutiny Notice</strong>
                  <small>Section 61 — return discrepancies</small>
                </Link>
                <Link href="/services/scn-reply" role="menuitem">
                  <strong>Show Cause Notice (SCN)</strong>
                  <small>DRC-01 / DRC-01A demands</small>
                </Link>
                <Link href="/services/commissioner-appeal" role="menuitem">
                  <strong>Commissioner Appeal</strong>
                  <small>APL-01 first appeal</small>
                </Link>
                <Link href="/services/gstat-appeal" role="menuitem">
                  <strong>GSTAT Appeal</strong>
                  <small>APL-05 tribunal filing</small>
                </Link>
              </div>
            </div>
            <Link href="/about" aria-current={navCurrent('/about')}>About</Link>
            <Link href="/faq" aria-current={navCurrent('/faq')}>Resources</Link>
            <Link href="/pricing" aria-current={navCurrent('/pricing')}>Pricing</Link>
          </nav>

          <div className="right">
            <a className="ph" href="tel:+919343297622" aria-label="Call +91 93432 97622">
              <Phone className="ic" />
              <span className="ph-num">+91 93432 97622</span>
            </a>
            <RequestCallbackButton className="btn btn-secondary nav-cta">Request Callback</RequestCallbackButton>
            <Link className="btn btn-primary nav-cta" href="/pricing">Book Service</Link>
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
            <span>Services</span>
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
            <Link href="/services/asmt-10" onClick={closeDrawer}>ASMT-10 Scrutiny Notice</Link>
            <Link href="/services/scn-reply" onClick={closeDrawer}>Show Cause Notice (SCN)</Link>
            <Link href="/services/commissioner-appeal" onClick={closeDrawer}>Commissioner Appeal</Link>
            <Link href="/services/gstat-appeal" onClick={closeDrawer}>GSTAT Appeal</Link>
          </div>
          <span className="drawer-divider" />
          <Link href="/about" aria-current={navCurrent('/about')} onClick={closeDrawer}>About</Link>
          <Link href="/faq" aria-current={navCurrent('/faq')} onClick={closeDrawer}>Resources</Link>
          <Link href="/pricing" aria-current={navCurrent('/pricing')} onClick={closeDrawer}>Pricing</Link>
        </nav>

        <div className="drawer-foot">
          <a className="ph" href="tel:+919343297622">
            <Phone className="ic" style={{ width: 17, height: 17 }} />
            +91 93432 97622
          </a>
          <RequestCallbackButton className="btn btn-secondary btn-block" onClick={closeDrawer}>
            Request Callback
          </RequestCallbackButton>
          <Link className="btn btn-primary btn-block" href="/pricing" onClick={closeDrawer}>
            Book Service
          </Link>
        </div>
      </aside>
    </>
  );
}
