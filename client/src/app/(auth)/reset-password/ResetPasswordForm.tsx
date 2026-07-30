'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Clock } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/shared-schemas/auth.schema';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { AuthBanner } from '@/components/ui/AuthBanner';
import { Input } from '@/components/ui/Input';
import { OTPInput } from '@/components/ui/OTPInput';
import { PasswordChecklist } from '@/components/ui/PasswordChecklist';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';
import { isTransportError } from '@/lib/api/error-messages';
import { useCountdown, formatMmSs } from '@/hooks/useCountdown';

// Step 2 of resources/ui/Forgot Password.html. Cooldown is 60s to match the server-side
// OTP cooldown rather than the prototype's 30s — see VerifyOtpForm for the same note.
const OTP_EXPIRY_SECS = 600;
const RESEND_COOLDOWN_SECS = 60;
const EXPIRY_WARN_SECS = 90;
const MAX_RESENDS = 3;

type ResetPasswordFormProps = { userId: string };

export function ResetPasswordForm({ userId }: ResetPasswordFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendCount, setResendCount] = useState(0);

  const expiry = useCountdown(OTP_EXPIRY_SECS);
  const resend = useCountdown(RESEND_COOLDOWN_SECS);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: { userId, otp: '', newPassword: '', confirmPassword: '' },
  });

  const otp = useWatch({ control, name: 'otp' }) ?? '';
  const newPassword = useWatch({ control, name: 'newPassword' }) ?? '';

  const mutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: ({ emailVerified }) => {
      if (emailVerified) {
        toast.success('Password updated successfully.');
        router.push('/dashboard');
        router.refresh();
        return;
      }
      // No session was issued: the address still has to be proven before signing in.
      toast.success(
        'Password updated successfully. Please verify your email. Log in to receive a new verification OTP.',
      );
      router.push('/login');
    },
    onError: (error) => {
      if (isTransportError(error)) {
        toast.error(getErrorMessage(error));
        return;
      }
      setServerError(getErrorMessage(error));
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendOtp({ userId, purpose: 'password_reset' }),
    onSuccess: () => {
      setResendCount((n) => n + 1);
      setServerError(null);
      setValue('otp', '', { shouldValidate: false });
      expiry.restart(OTP_EXPIRY_SECS);
      resend.restart(RESEND_COOLDOWN_SECS);
      toast.success('Password reset OTP sent successfully.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const isExpired = expiry.isFinished;
  const resendLimitReached = resendCount >= MAX_RESENDS;
  const canResend = resend.isFinished && !resendMutation.isPending && !resendLimitReached;

  function onSubmit(data: ResetPasswordInput) {
    if (mutation.isPending || isExpired) return;
    setServerError(null);
    mutation.mutate(data);
  }

  return (
    <AuthCardShell
      title="Set a new password"
      subtitle="Enter the 6-digit code from your email and choose a new password."
    >
      {(serverError || isExpired) && (
        <AuthBanner>
          {isExpired ? 'OTP has expired. Please request a new one.' : serverError}
        </AuthBanner>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-center text-sm font-medium text-[var(--neutral-900)]">
            Verification code
          </span>
          <OTPInput
            value={otp}
            autoFocus
            onChange={(v) => {
              setValue('otp', v, { shouldValidate: true });
              setServerError(null);
            }}
            error={errors.otp?.message}
            disabled={mutation.isPending || isExpired}
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <span
            className="inline-flex items-center gap-1.5"
            style={{
              color:
                isExpired || expiry.secondsLeft <= EXPIRY_WARN_SECS
                  ? 'var(--warning-amber)'
                  : 'var(--neutral-600)',
            }}
          >
            <Clock size={14} aria-hidden />
            {isExpired ? (
              <span className="font-semibold">Expired</span>
            ) : (
              <>
                Code expires in{' '}
                <span className="font-mono font-medium">{formatMmSs(expiry.secondsLeft)}</span>
              </>
            )}
          </span>

          <button
            type="button"
            onClick={() => resendMutation.mutate()}
            disabled={!canResend}
            className="inline-flex items-center gap-1.5 font-semibold text-[var(--accent-green)] underline underline-offset-2 disabled:text-[var(--neutral-600)] disabled:no-underline disabled:opacity-70"
          >
            {resendMutation.isPending ? 'Sending…' : 'Resend'}
            {!resend.isFinished && !resendLimitReached && (
              <span className="font-mono text-[13px]" aria-hidden>
                in {resend.secondsLeft}s
              </span>
            )}
          </button>
        </div>

        {resendLimitReached && (
          <p className="-mt-4 text-right text-[13px] text-[var(--neutral-600)]">
            You have reached the OTP resend limit. Please try again later.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Input
            id="newPassword"
            label="New Password"
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <PasswordChecklist password={newPassword} />
        </div>

        <Input
          id="confirmPassword"
          label="Confirm New Password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={mutation.isPending || isExpired || !isValid}
          aria-busy={mutation.isPending}
        >
          {mutation.isPending ? 'Updating…' : 'Reset Password'}
        </button>
      </form>
    </AuthCardShell>
  );
}
