'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/shared-schemas/auth.schema';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage, getErrorCode } from '@/lib/api/client';

type Banner = { kind: 'success' | 'error'; message: string } | null;

// Security section per resources/ui/Settings.html — authenticated password change
// (POST /auth/change-password). The current session stays valid; other sessions
// are revoked server-side.
export function ChangePasswordPanel() {
  const [confirmValue, setConfirmValue] = useState('');
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  const mutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      reset();
      setConfirmValue('');
      setBanner({ kind: 'success', message: 'Password updated.' });
    },
    onError: (error) => {
      if (getErrorCode(error) === 'INVALID_CREDENTIALS') {
        setError('currentPassword', { message: 'Incorrect current password.' });
        return;
      }
      setBanner({ kind: 'error', message: getErrorMessage(error) });
    },
  });

  function onSubmit(data: ChangePasswordInput) {
    setBanner(null);
    if (confirmValue !== data.newPassword) {
      setConfirmError("New passwords don't match.");
      return;
    }
    setConfirmError(null);
    mutation.mutate(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-row">
        <div className="lbl">
          <div className="ttl">Current password</div>
          <div className="desc">Confirm your identity before setting a new one.</div>
        </div>
        <div className="fld">
          <input
            type="password"
            className="input"
            autoComplete="current-password"
            {...register('currentPassword')}
          />
          {errors.currentPassword && (
            <span className="text-sm text-[var(--warning-amber)]" role="alert">
              {errors.currentPassword.message}
            </span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="lbl">
          <div className="ttl">New password</div>
          <div className="desc">
            At least 8 characters, with an uppercase letter, a digit and a symbol.
          </div>
        </div>
        <div className="fld">
          <input
            type="password"
            className="input"
            autoComplete="new-password"
            {...register('newPassword')}
          />
          {errors.newPassword && (
            <span className="text-sm text-[var(--warning-amber)]" role="alert">
              {errors.newPassword.message}
            </span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="lbl">
          <div className="ttl">Confirm new password</div>
          <div className="desc">Re-enter the new password.</div>
        </div>
        <div className="fld">
          <input
            type="password"
            className="input"
            autoComplete="new-password"
            value={confirmValue}
            onChange={(e) => {
              setConfirmValue(e.target.value);
              setConfirmError(null);
            }}
          />
          {confirmError && (
            <span className="text-sm text-[var(--warning-amber)]" role="alert">
              {confirmError}
            </span>
          )}
        </div>
      </div>

      <div className="save-bar">
        {banner && (
          <div className={`form-banner ${banner.kind}`} role="alert">
            {banner.kind === 'success' ? (
              <CheckCircle className="ic" aria-hidden />
            ) : (
              <AlertCircle className="ic" aria-hidden />
            )}
            <span>{banner.message}</span>
          </div>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ minHeight: 42 }}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  );
}
