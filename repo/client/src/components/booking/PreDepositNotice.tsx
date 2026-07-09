import { Info } from 'lucide-react';
import type { ServiceType } from '@/lib/api/types';

// Services that carry a statutory pre-deposit requirement (KB2 §7).
const PRE_DEPOSIT_SERVICES: ReadonlySet<ServiceType> = new Set<ServiceType>([
  'commissioner_appeal',
  'gstat_appeal',
]);

export function requiresPreDeposit(serviceType: ServiceType | null | undefined): boolean {
  return serviceType != null && PRE_DEPOSIT_SERVICES.has(serviceType);
}

type PreDepositNoticeProps = {
  serviceType: ServiceType | null | undefined;
};

// Mandatory disclosure touchpoint for GSTAT/Commissioner Appeal (frontend.md §8.3,
// CLAUDE.md pre-deposit constraint). Renders nothing for services without it.
// Styled per resources/ui/Booking Step 1 → .predep-banner.
export function PreDepositNotice({ serviceType }: PreDepositNoticeProps) {
  if (!requiresPreDeposit(serviceType)) return null;

  return (
    <div role="note" className="predep-banner">
      <Info size={16} strokeWidth={1.5} className="predep-banner__icon" aria-hidden />
      <p className="predep-banner__text">
        A pre-deposit as per GST Act is required before this service is filed. Our team will
        advise the exact amount.
      </p>
    </div>
  );
}
