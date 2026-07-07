import type { BookingStatus } from '@/lib/api/types';

// User-facing "what happens next" copy for each booking status.
export const NEXT_ACTION_COPY: Record<BookingStatus, string> = {
  document_upload: 'Upload your documents to proceed',
  in_review: 'Awaiting review',
  draft_ready: 'Draft ready — payment required',
  filing: 'Filing in progress',
  complete: 'Service complete',
  cancelled: 'This booking was cancelled',
};

export function formatBookingDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Short, human-readable reference derived from the booking UUID.
export function bookingRef(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

// Format a paise amount as INR (e.g. 750000 → "₹7,500"). Used wherever a booking's
// custom quoted fee is shown.
export function formatInr(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}
