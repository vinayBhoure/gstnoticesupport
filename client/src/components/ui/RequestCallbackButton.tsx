'use client';

import { useState, useEffect } from 'react';
import { PopupModal } from 'react-calendly';

type Props = {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onClick?: () => void;
};

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? '';

export function RequestCallbackButton({ className, style, children, onClick }: Props) {
  const [open, setOpen] = useState(false);
  const [bodyEl, setBodyEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setBodyEl(document.body);
  }, []);

  function handleClick() {
    onClick?.();
    if (CALENDLY_URL && bodyEl) {
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
      {CALENDLY_URL && bodyEl && (
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
