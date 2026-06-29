import type { BookingStatus } from '@/lib/api/types';

// User-facing "what happens next" copy for each booking status.
export const NEXT_ACTION_COPY: Record<BookingStatus, string> = {
  document_upload: 'Upload your documents to proceed.',
  in_review: 'Our team is reviewing your documents.',
  draft_ready: 'Your draft is ready.',
  filing: 'Your application is being filed.',
  complete: 'Service complete.',
  cancelled: 'This booking was cancelled.',
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
