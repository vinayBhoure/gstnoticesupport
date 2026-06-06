'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Phone } from 'lucide-react';

export function ScrollShell() {
  const [showWa, setShowWa] = useState(false);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setShowWa(y > 400);
      setShowBar(y > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <a
        className={`wa-float${showWa ? ' show' : ''}`}
        href="https://wa.me/919343297622?text=Hello%2C%20I%20have%20a%20query%20about%20a%20GST%20notice."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle style={{ width: 19, height: 19 }} />
        Chat with us
      </a>

      <div className={`mobile-bar${showBar ? ' show' : ''}`} id="mobileBar">
        <a className="btn btn-secondary" href="tel:+919343297622">
          <Phone className="ic" />
          Call Now
        </a>
        <Link className="btn btn-primary" href="/pricing">Book Service</Link>
      </div>
    </>
  );
}
