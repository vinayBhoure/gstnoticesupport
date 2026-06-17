import { BookingStatus, PaymentStatus } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

// Pure state machine module — no Prisma, no req/res.
// Reused by Phase 5 (payment→filing) and Phase 6 (admin transitions).
// Decision recorded in docs/tracking/decisions.md.

export const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  document_upload: ['in_review'],
  in_review: ['draft_ready'],
  draft_ready: ['filing', 'cancelled'],
  filing: ['complete'],
  complete: [],
  cancelled: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: BookingStatus, to: BookingStatus): void {
  if (!canTransition(from, to)) {
    throw new ApiError(
      409,
      'INVALID_TRANSITION',
      `Cannot transition booking from '${from}' to '${to}'`,
    );
  }
}

// User-cancellable only when status = draft_ready AND payment is still pending.
// A booking with a captured payment cannot be cancelled (KB2 §9 — no admin cancellation either).
export function assertUserCancellable(booking: {
  status: BookingStatus;
  paymentStatus: PaymentStatus;
}): void {
  if (booking.status !== BookingStatus.draft_ready || booking.paymentStatus !== PaymentStatus.pending) {
    throw new ApiError(
      409,
      'INVALID_TRANSITION',
      'Booking cannot be cancelled at this stage',
    );
  }
}
