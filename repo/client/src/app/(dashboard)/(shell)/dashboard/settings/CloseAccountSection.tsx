'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Trash2, AlertCircle } from 'lucide-react';
import { userApi } from '@/lib/api/user';
import { getErrorMessage, getErrorCode } from '@/lib/api/client';

type CloseAccountSectionProps = {
  email: string;
  hasActiveBookings: boolean;
};

// Danger zone per resources/ui/Settings.html + KB1 §13. Deletion is blocked while
// any booking is active; otherwise the user confirms by typing their own email
// (D24 — simple string match, no OTP/password). Deletion is a soft-delete server-side;
// case + payment records are retained for tax law, and cookies are cleared on success.
export function CloseAccountSection({ email, hasActiveBookings }: CloseAccountSectionProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);

  const emailMatches = typed.trim().toLowerCase() === email.toLowerCase();

  const mutation = useMutation({
    mutationFn: () => userApi.deleteAccount({ confirmEmail: typed.trim() }),
    onSuccess: () => {
      router.push('/');
      router.refresh();
    },
    onError: (err) => {
      if (getErrorCode(err) === 'ACTIVE_BOOKINGS') {
        setError('Your account cannot be closed while you have active services.');
        return;
      }
      setError(getErrorMessage(err));
    },
  });

  return (
    <div className="danger-zone">
      <div className="dz-text">
        <h3>Close account</h3>
        <p>
          This removes your dashboard access. Active cases continue under your engagement letter.
          Case files and receipts are retained for 8 years as required by the CGST Act.
        </p>

        {hasActiveBookings && (
          <p className="dz-blocked">
            Your account cannot be closed while you have active services. All bookings must be
            complete or cancelled first.
          </p>
        )}

        {confirming && !hasActiveBookings && (
          <div className="dz-confirm">
            <label htmlFor="confirmEmail" className="dz-confirm-lbl">
              Type <strong>{email}</strong> to confirm.
            </label>
            <input
              id="confirmEmail"
              type="email"
              className="input"
              autoComplete="off"
              value={typed}
              onChange={(e) => {
                setTyped(e.target.value);
                setError(null);
              }}
            />
            {error && (
              <span className="text-sm text-[var(--warning-amber)]" role="alert">
                <AlertCircle size={13} aria-hidden style={{ verticalAlign: '-2px', marginRight: 4 }} />
                {error}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="dz-actions">
        {!confirming ? (
          <button
            type="button"
            className="btn btn-danger"
            style={{ minHeight: 42 }}
            disabled={hasActiveBookings}
            onClick={() => setConfirming(true)}
          >
            <Trash2 size={14} aria-hidden />
            Close account
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-danger"
              style={{ minHeight: 42 }}
              disabled={!emailMatches || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              <Trash2 size={14} aria-hidden />
              {mutation.isPending ? 'Closing…' : 'Permanently close'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ minHeight: 42 }}
              onClick={() => {
                setConfirming(false);
                setTyped('');
                setError(null);
              }}
              disabled={mutation.isPending}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
