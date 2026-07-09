import { ServiceType } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

// Server-side fixed pricing in paise (1 INR = 100 paise).
// Source of truth: api_contract.md Appendix (lines ~1449–1458).
// Never trust a price from the client — always derive from this map.
// `representation` is deliberately excluded: it is consultation-priced, so the fee
// is quoted per-booking by the admin (Booking.quotedAmountPaise) rather than fixed.
export const SERVICE_PRICING: Record<Exclude<ServiceType, 'representation'>, number> = {
  asmt_10: 299900,
  scn: 599900,
  commissioner_appeal: 999900,
  gstat_appeal: 1499900,
};

// Resolve the amount to charge for a booking. Fixed-price services read the map;
// `representation` uses the admin's per-booking quote, which must be set before the
// booking can be paid (enforced at draft-confirm — a representation booking can only
// reach draft_ready with a quote). The 409 is a defensive backstop.
export function getBookingAmountPaise(booking: {
  serviceType: ServiceType;
  quotedAmountPaise: number | null;
}): number {
  if (booking.serviceType === 'representation') {
    if (booking.quotedAmountPaise == null) {
      throw new ApiError(409, 'QUOTE_REQUIRED', 'A fee quote has not been set for this booking yet');
    }
    return booking.quotedAmountPaise;
  }
  return SERVICE_PRICING[booking.serviceType];
}
