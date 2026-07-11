'use client';

import dynamic from 'next/dynamic';

// Server Components (layouts) can't pass `ssr: false` to next/dynamic
// directly, so this thin Client Component wrapper is the mount point.
// Keeps react-calendly out of the initial bundle for routes that render
// this loader (see CalendlyCallbackListener.tsx for why it must still
// only ever be mounted once).
const CalendlyCallbackListener = dynamic(
  () => import('./CalendlyCallbackListener').then((m) => m.CalendlyCallbackListener),
  { ssr: false },
);

export function CalendlyListenerLoader() {
  return <CalendlyCallbackListener />;
}
