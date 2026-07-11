'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// react-calendly is only fetched once a visitor actually clicks a callback
// CTA, instead of shipping on every page that renders this button (frontend
// perf audit finding 03 — the widget previously loaded globally via the
// root layout's CalendlyCallbackListener, see that file's sibling loader).
const PopupModal = dynamic(() => import('react-calendly').then((m) => m.PopupModal), { ssr: false });

type Props = {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onClick?: () => void;
};

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? '';

export function RequestCallbackButton({ className, style, children, onClick }: Props) {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [bodyEl, setBodyEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setBodyEl(document.body);
  }, []);

  function handleClick() {
    onClick?.();
    if (CALENDLY_URL && bodyEl) {
      setHasOpened(true);
      setOpen(true);
    } else {
      window.location.href = '/contact#callback';
    }
  }

  return (
    <>
      <button type="button" className={className} style={style} onClick={handleClick}>
        {children}
      </button>
      {CALENDLY_URL && bodyEl && hasOpened && (
        <PopupModal
          url={CALENDLY_URL}
          onModalClose={() => setOpen(false)}
          open={open}
          rootElement={bodyEl}
        />
      )}
    </>
  );
}
