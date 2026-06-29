import { Upload, Clock, FileText, Send, CheckCircle, XCircle } from 'lucide-react';
import type { BookingStatus } from '@/lib/api/types';

type StatusBadgeProps = {
  status: BookingStatus;
};

// Status → label, icon, and class. Icon + label always present (never colour-only,
// design-system §Service Status Badge). Colours come from CSS tokens, never hex.
const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; Icon: typeof Upload; className: string }
> = {
  document_upload: {
    label: 'Document Upload',
    Icon: Upload,
    className: 'badge-outline',
  },
  in_review: {
    label: 'In Review',
    Icon: Clock,
    className: 'bg-[var(--primary-deep-blue)] text-white',
  },
  draft_ready: {
    label: 'Draft Ready',
    Icon: FileText,
    className: 'badge-amber',
  },
  filing: {
    label: 'Filing',
    Icon: Send,
    className: 'bg-[var(--primary-navy)] text-white',
  },
  complete: {
    label: 'Complete',
    Icon: CheckCircle,
    className: 'badge-green',
  },
  cancelled: {
    label: 'Cancelled',
    Icon: XCircle,
    className: 'bg-[var(--neutral-200)] text-[var(--neutral-600)]',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, Icon, className } = STATUS_CONFIG[status];
  return (
    <span className={['badge', className].join(' ')}>
      <Icon size={14} aria-hidden />
      {label}
    </span>
  );
}
