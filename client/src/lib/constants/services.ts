import type { ServiceType } from '@/lib/api/types';

// Display metadata for the four GST services. Order drives the selection grid.
// priceDisplay is display-only and must match src/data/pricing.tsx — the charge
// itself is always derived server-side.
export const SERVICE_META: Record<
  ServiceType,
  { label: string; description: string; priceDisplay: string }
> = {
  asmt_10: {
    label: 'ASMT-10 Reply',
    description: 'Reply to a scrutiny notice issued in Form ASMT-10.',
    priceDisplay: '₹2,999',
  },
  scn: {
    label: 'SCN Reply',
    description: 'Reply to a Show Cause Notice under the GST Act.',
    priceDisplay: '₹5,999',
  },
  commissioner_appeal: {
    label: 'Commissioner Appeal',
    description: 'First appeal before the Commissioner (Appeals).',
    priceDisplay: '₹9,999',
  },
  gstat_appeal: {
    label: 'GSTAT Appeal',
    description: 'Appeal before the GST Appellate Tribunal.',
    priceDisplay: '₹14,999',
  },
};

export const SERVICE_ORDER: ServiceType[] = ['asmt_10', 'scn', 'commissioner_appeal', 'gstat_appeal'];
