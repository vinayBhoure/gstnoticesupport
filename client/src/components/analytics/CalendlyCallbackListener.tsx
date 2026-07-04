'use client';

import { useCalendlyEventListener } from 'react-calendly';

// Mounted exactly once (root layout) — the hook attaches a global
// `window` message listener internally, so wiring this inside every
// RequestCallbackButton instance (navbar, hero, drawer, footer CTAs all
// mount at once) would fire one duplicate POST per mounted button for a
// single scheduled event. One app-wide listener keeps the dispatch 1:1
// with the actual Calendly event regardless of how many CTAs are on screen.
export function CalendlyCallbackListener() {
  useCalendlyEventListener({
    onEventScheduled: (e) => {
      const { event, invitee } = e.data.payload;
      fetch('/api/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventUri: event.uri, inviteeUri: invitee.uri }),
      }).catch(() => {});
    },
  });

  return null;
}
