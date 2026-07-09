'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { GitBranch, Search, Info, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api/admin';
import { getErrorMessage, getErrorCode } from '@/lib/api/client';
import type { BookingStatus, PaymentStatus } from '@/lib/api/types';

type StatusActionsProps = {
  bookingId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
};

// Status Actions per resources/ui/Admin Booking Detail.html — exact per-status
// matrix. Only in_review/complete are ever sent (ADMIN_TRANSITION_STATUSES);
// draft_ready is reached automatically via draft-confirm, filing via payment.
export function StatusActions({ bookingId, status, paymentStatus }: StatusActionsProps) {
  const router = useRouter();
  const [payId, setPayId] = useState('');
  const [payError, setPayError] = useState<string | null>(null);

  const transition = useMutation({
    mutationFn: (next: 'in_review' | 'complete') => adminApi.updateStatus(bookingId, { status: next }),
    onSuccess: (booking) => {
      toast.success(
        booking.status === 'in_review'
          ? 'Booking set to In Review. The user has been notified.'
          : 'Case marked complete. The user has been notified.',
      );
      router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      router.refresh();
    },
  });

  const markPaid = useMutation({
    mutationFn: () => adminApi.markPaid(bookingId, { razorpayPaymentId: payId.trim() }),
    onSuccess: () => {
      toast.success('Payment verified with Razorpay. Booking transitioned to filing.');
      setPayId('');
      setPayError(null);
      router.refresh();
    },
    onError: (error) => {
      const code = getErrorCode(error);
      if (code === 'PAYMENT_NOT_CAPTURED') {
        setPayError('This payment ID could not be confirmed with Razorpay.');
        return;
      }
      if (code === 'PAYMENT_ALREADY_CAPTURED' || code === 'INVALID_STATUS') {
        toast.error(getErrorMessage(error));
        router.refresh();
        return;
      }
      toast.error(getErrorMessage(error)); // RAZORPAY_ERROR and others — retryable
    },
  });

  return (
    <section className="a-card" aria-labelledby="saHeading">
      <h2 id="saHeading">
        <GitBranch className="ic" aria-hidden /> Status Actions
      </h2>

      {status === 'document_upload' && (
        <div className="action-stack">
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => transition.mutate('in_review')}
            disabled={transition.isPending}
          >
            <Search className="ic" aria-hidden />
            {transition.isPending ? 'Updating…' : 'Set to In Review'}
          </button>
          <p className="helper">
            Confirms documents are sufficient to begin drafting. The user is notified.
          </p>
        </div>
      )}

      {status === 'in_review' && (
        <div className="action-hint">
          <Info className="ic" aria-hidden />
          <span>Next: upload the prepared draft. Status will move to Draft Ready automatically.</span>
        </div>
      )}

      {status === 'draft_ready' && paymentStatus !== 'paid' && (
        <div className="pay-panel">
          <h3>Mark as Paid</h3>
          <p className="helper">
            Fallback for payments confirmed outside the portal. Verifies against Razorpay before
            any status change.
          </p>
          <div className="pay-field">
            <label className="field-label" htmlFor="payIdInput">
              Razorpay Payment ID
            </label>
            <input
              className="input mono"
              id="payIdInput"
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="pay_XXXXXXXXXXXXXX"
              aria-describedby="payIdHelp"
              aria-invalid={payError ? true : undefined}
              value={payId}
              onChange={(e) => {
                setPayId(e.target.value);
                setPayError(null);
              }}
            />
            <p className="helper" id="payIdHelp" style={{ marginTop: 6 }}>
              Format: <span className="mono">pay_</span> followed by 14 characters.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => markPaid.mutate()}
            disabled={markPaid.isPending || payId.trim().length === 0}
          >
            {markPaid.isPending ? 'Verifying…' : 'Verify & mark paid'}
          </button>
          {payError && (
            <div className="pay-error" role="alert">
              <AlertCircle className="ic" aria-hidden />
              <span>{payError}</span>
            </div>
          )}
        </div>
      )}

      {status === 'draft_ready' && paymentStatus === 'paid' && (
        <div className="action-hint">
          <Info className="ic" aria-hidden />
          <span>Payment received. Filing begins once the user confirms the draft.</span>
        </div>
      )}

      {status === 'filing' && (
        <div className="action-stack">
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => transition.mutate('complete')}
            disabled={transition.isPending}
          >
            <CheckCircle className="ic" aria-hidden />
            {transition.isPending ? 'Updating…' : 'Mark Complete'}
          </button>
          <p className="helper">
            Confirms the reply has been filed on the GST portal. Closes the case for the user.
          </p>
        </div>
      )}

      {status === 'complete' && (
        <div className="action-hint">
          <CheckCircle className="ic green" aria-hidden />
          <span>Case complete. No further actions.</span>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="action-hint">
          <Info className="ic" aria-hidden />
          <span>This booking was cancelled by the user. No further actions.</span>
        </div>
      )}
    </section>
  );
}
