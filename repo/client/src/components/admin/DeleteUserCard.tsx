'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Trash2, Info, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api/admin';
import { getErrorMessage } from '@/lib/api/client';

type DeleteUserCardProps = {
  userId: string;
  userEmail: string;
  activeBookingsCount: number;
};

// Delete User card + type-to-confirm dialog per resources/ui/Admin User Detail.html.
// Soft delete only; blocked while the user has active bookings.
export function DeleteUserCard({ userId, userEmail, activeBookingsCount }: DeleteUserCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [showMismatch, setShowMismatch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const blocked = activeBookingsCount > 0;
  const matches = confirmEmail.trim().toLowerCase() === userEmail.toLowerCase();

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: () => adminApi.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted.');
      router.push('/admin/users');
      router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      setOpen(false);
      router.refresh();
    },
  });

  function openDialog() {
    setConfirmEmail('');
    setShowMismatch(false);
    setOpen(true);
  }

  function closeDialog() {
    if (mutation.isPending) return;
    setOpen(false);
  }

  return (
    <>
      <section className="a-card" aria-labelledby="delete-h">
        <h2 id="delete-h">
          <Trash2 className="ic" aria-hidden /> Delete User
        </h2>
        <p className="card-note">
          Removes the user&apos;s account. Their booking and payment records are retained for
          compliance.
        </p>

        <div className="delete-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={blocked}
            aria-disabled={blocked}
            aria-describedby={blocked ? 'deleteReason' : undefined}
            onClick={openDialog}
          >
            <Trash2 className="ic" aria-hidden />
            Delete user
          </button>
          {blocked && (
            <p className="disabled-reason" id="deleteReason">
              <Info className="ic" aria-hidden />
              <span>
                This user has {activeBookingsCount} active booking
                {activeBookingsCount === 1 ? '' : 's'}. Users can only be deleted once all their
                bookings are complete or cancelled.
              </span>
            </p>
          )}
        </div>
      </section>

      <div
        className={`dialog-scrim${open ? ' open' : ''}`}
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) closeDialog();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            closeDialog();
          }
        }}
      >
        <div
          className="dialog"
          role="dialog"
          aria-modal
          aria-labelledby="dlgTitle"
          aria-describedby="dlgBody"
        >
          <h2 id="dlgTitle">Delete this user?</h2>
          <p className="d-body" id="dlgBody">
            This removes the user&apos;s account. Their booking and payment records are retained
            for compliance. This can&apos;t be undone.
          </p>

          <div className="d-meta">
            <span className="d-meta-label">User email</span>
            <span className="d-meta-val">{userEmail}</span>
          </div>

          <div className="dialog-field">
            <label className="field-label" htmlFor="emailConfirm">
              Type the user&apos;s email to confirm
            </label>
            <input
              ref={inputRef}
              type="email"
              id="emailConfirm"
              className="input mono"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-invalid={showMismatch}
              value={confirmEmail}
              onChange={(e) => {
                setConfirmEmail(e.target.value);
                setShowMismatch(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (matches) mutation.mutate();
                  else setShowMismatch(true);
                }
              }}
            />
            {showMismatch && (
              <p className="afield-error" role="alert">
                <AlertCircle className="ic" aria-hidden />
                <span>Email doesn&apos;t match.</span>
              </p>
            )}
          </div>

          <div className="dialog-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeDialog}
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!matches || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              <Trash2 className="ic" aria-hidden />
              {mutation.isPending ? 'Deleting…' : 'Delete user'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
