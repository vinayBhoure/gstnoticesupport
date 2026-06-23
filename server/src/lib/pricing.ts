import { ServiceType } from '@prisma/client';

// Server-side pricing in paise (1 INR = 100 paise).
// Source of truth: api_contract.md Appendix (lines ~1449–1458).
// Never trust a price from the client — always derive from this map.
// Phase 5 (payment) reuses this constant directly.
export const SERVICE_PRICING: Record<ServiceType, number> = {
  asmt_10: 299900,
  scn: 599900,
  commissioner_appeal: 999900,
  gstat_appeal: 1499900,
};

export function getServicePriceInPaise(serviceType: ServiceType): number {
  return SERVICE_PRICING[serviceType];
}
