import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { PaymentStatus } from '@/lib/api/types';

type PaymentBadgeProps = {
  status: PaymentStatus;
  // Detail header renders "Payment: Paid" (Admin Booking Detail prototype).
  withPrefix?: boolean;
};

// Payment badge per resources/ui/Admin Bookings.html → .pay-badge.
const PAY_CONFIG: Record<PaymentStatus, { label: string; Icon: typeof Clock; className: string }> =
  {
    paid: { label: 'Paid', Icon: CheckCircle, className: 'pay-paid' },
    pending: { label: 'Pending', Icon: Clock, className: 'pay-pending' },
    failed: { label: 'Failed', Icon: AlertCircle, className: 'pay-failed' },
  };

export function PaymentBadge({ status, withPrefix = false }: PaymentBadgeProps) {
  const { label, Icon, className } = PAY_CONFIG[status];
  return (
    <span className={`pay-badge ${className}`}>
      <Icon className="ic" aria-hidden />
      {withPrefix ? `Payment: ${label}` : label}
    </span>
  );
}
