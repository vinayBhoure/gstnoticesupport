'use client';

import { useEffect, useState } from 'react';
import { UserCog, Shield, AlertOctagon } from 'lucide-react';

const SECTIONS = [
  { id: 'account', label: 'Account', Icon: UserCog },
  { id: 'security', label: 'Security', Icon: Shield },
  { id: 'danger', label: 'Danger zone', Icon: AlertOctagon },
] as const;

// Settings side-nav with scroll-spy per resources/ui/Settings.html — highlights
// the section currently in view. Anchor links still work without JS.
export function SettingsNav() {
  const [active, setActive] = useState<string>('account');

  useEffect(() => {
    const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-15% 0% -75% 0%' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="set-nav" aria-label="Settings categories">
      {SECTIONS.map(({ id, label, Icon }) => (
        <a key={id} href={`#${id}`} className={active === id ? 'active' : undefined}>
          <Icon className="ic" aria-hidden />
          {label}
        </a>
      ))}
    </nav>
  );
}
