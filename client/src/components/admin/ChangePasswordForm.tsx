'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from '@/lib/shared-schemas/auth.schema';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage, getErrorCode } from '@/lib/api/client';
import { Input } from '@/components/ui/Input';
// Strength meter per resources/ui/Admin Settings.html (visual aid only — the shared Zod
// schema is the actual gate). Shared with the signup and reset-password screens.
import {
  STRENGTH_COLORS,
  STRENGTH_LABELS,
  passwordStrength as strength,
} from '@/lib/password-strength';

type Banner = { kind: 'success' | 'error'; message: string } | null;

export function ChangePasswordForm() {
  const [confirmValue, setConfirmValue] = useState('');
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  const newPassword = useWatch({ control, name: 'newPassword' }) ?? '';
  const score = strength(newPassword);

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
    <div className="a-card" role="region" aria-labelledby="pwHeading" style={{ padding: 28 }}>
      <div className="card-head">
        <Lock className="ic" aria-hidden />
        <h2 id="pwHeading">Change Password</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-[22px]">
        <Input
          id="currentPw"
          label="Current Password"
          type="password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />

        <div>
          <Input
            id="newPw"
            label="New Password"
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <div className="strength-row" aria-hidden>
            <div className="strength-track">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="strength-seg"
                  style={{
                    background: i < score ? STRENGTH_COLORS[score - 1] : 'var(--neutral-200)',
                  }}
                />
              ))}
            </div>
            <span
              className="strength-lbl"
              style={{ color: newPassword && score ? STRENGTH_COLORS[score - 1] : undefined }}
            >
              {newPassword ? (STRENGTH_LABELS[score - 1] ?? '') : ''}
            </span>
          </div>
          <p className="field-hint">Minimum 8 characters, with an uppercase letter, digit and symbol.</p>
        </div>

        <div>
          <Input
            id="confirmPw"
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            error={confirmError ?? undefined}
            value={confirmValue}
            onChange={(e) => {
              setConfirmValue(e.target.value);
              setConfirmError(null);
            }}
          />
        </div>

        <div className="submit-row" style={{ marginTop: 2 }}>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Updating…' : 'Update password'}
          </button>
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
        </div>
      </form>
    </div>
  );
}
