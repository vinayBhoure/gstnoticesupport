'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, Mail } from 'lucide-react';

// The inline status banner shared by every (auth) form. Extracted so the amber surface
// colours live in exactly one place — they have no token in tokens.css, and the markup was
// previously duplicated verbatim across five forms (frontend.md §8.1).
const SURFACE = {
  error: 'border-[#F0D9B5] bg-[#FFF8EF]',
  info: 'border-[var(--neutral-200)] bg-[var(--neutral-50)]',
} as const;

type AuthBannerProps = {
  kind?: 'error' | 'info';
  children: ReactNode;
};

export function AuthBanner({ kind = 'error', children }: AuthBannerProps) {
  const Icon = kind === 'error' ? AlertTriangle : Mail;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`mb-5 flex items-start gap-3 rounded-[var(--r-btn)] border p-3.5 text-sm text-[var(--neutral-900)] ${SURFACE[kind]}`}
    >
      <Icon
        size={18}
        className={`mt-0.5 shrink-0 ${
          kind === 'error' ? 'text-[var(--warning-amber)]' : 'text-[var(--primary-deep-blue)]'
        }`}
        aria-hidden
      />
      <span>{children}</span>
    </div>
  );
}
