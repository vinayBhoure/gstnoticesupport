import { FileText, Search, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { BookingStatus } from '@/lib/api/types';

type StatusBadgeProps = {
  status: BookingStatus;
};

// Status → label, icon, and class per resources/ui/Service Detail.html STATUS_CONFIG.
// Icon + label always present (never colour-only, design-system §Service Status Badge).
const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; Icon: typeof FileText; className: string }
> = {
  document_upload: { label: 'Document Upload', Icon: FileText, className: 's-upload' },
  in_review: { label: 'In Review', Icon: Search, className: 's-review' },
  draft_ready: { label: 'Draft Ready', Icon: AlertCircle, className: 's-draft' },
  filing: { label: 'Filing', Icon: Clock, className: 's-filing' },
  complete: { label: 'Complete', Icon: CheckCircle, className: 's-complete' },
  cancelled: { label: 'Cancelled', Icon: XCircle, className: 's-cancelled' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, Icon, className } = STATUS_CONFIG[status];
  return (
    <span className={`status-badge ${className}`}>
      <Icon className="ic" aria-hidden />
      {label}
    </span>
  );
}
