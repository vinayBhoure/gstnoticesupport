'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Clock } from 'lucide-react';
import { verifyOtpSchema, type VerifyOtpInput } from '@/lib/shared-schemas/auth.schema';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { AuthBanner } from '@/components/ui/AuthBanner';
import { OTPInput } from '@/components/ui/OTPInput';
import { authApi } from '@/lib/api/auth';
import { getErrorCode, getErrorMessage } from '@/lib/api/client';
import { isTransportError } from '@/lib/api/error-messages';
import { useCountdown, formatMmSs } from '@/hooks/useCountdown';
import { readMaskedEmail, clearMaskedEmail } from '@/lib/auth/verify-otp-hint';

// Mirrors resources/ui/OTP Verification.html. RESEND_COOLDOWN is 60s, not the prototype's 30s:
// otp.service.ts enforces a 60s DB-backed cooldown, so a 30s button would re-enable straight
// into an OTP_COOLDOWN rejection.
const OTP_EXPIRY_SECS = 600;
const RESEND_COOLDOWN_SECS = 60;
const EXPIRY_WARN_SECS = 90;
const MAX_RESENDS = 3;

// The hint is written before navigation and never changes while this screen is mounted,
// so there is nothing to subscribe to.
const noopSubscribe = () => () => {};

type VerifyOtpFormProps = { userId: string };

export function VerifyOtpForm({ userId }: VerifyOtpFormProps) {
  const router = useRouter();
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCount, setResendCount] = useState(0);

  const expiry = useCountdown(OTP_EXPIRY_SECS);
  const resend = useCountdown(RESEND_COOLDOWN_SECS);

  // sessionStorage does not exist during SSR, so the server snapshot is null and the value
  // appears on hydration. useSyncExternalStore avoids syncing it through an effect.
  const maskedEmail = useSyncExternalStore(
    noopSubscribe,
    useCallback(() => readMaskedEmail(), []),
    () => null,
  );

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { userId, otp: '' },
  });

  const otp = useWatch({ control, name: 'otp' }) ?? '';

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: ({ user }) => {
      clearMaskedEmail();
      toast.success('Email verified successfully.');
      // A brand-new account has no phone yet, and the dashboard is gated on it (D100).
      router.push(user.phone ? '/dashboard' : '/complete-profile');
      router.refresh();
    },
    onError: (error) => {
      // Verifying an already-verified address is a success from the user's point of view.
      if (getErrorCode(error) === 'ALREADY_VERIFIED') {
        clearMaskedEmail();
        toast.success(getErrorMessage(error));
        router.push('/dashboard');
        router.refresh();
        return;
      }
      if (isTransportError(error)) {
        toast.error(getErrorMessage(error));
        return;
      }
      setOtpError(getErrorMessage(error));
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendOtp({ userId, purpose: 'email_verification' }),
    onSuccess: () => {
      setResendCount((n) => n + 1);
      setOtpError(null);
      setValue('otp', '', { shouldValidate: false });
      expiry.restart(OTP_EXPIRY_SECS);
      resend.restart(RESEND_COOLDOWN_SECS);
      toast.success('A new verification OTP has been sent.');
    },
    onError: (error) => {
      if (getErrorCode(error) === 'ALREADY_VERIFIED') {
        toast.success(getErrorMessage(error));
        router.push('/dashboard');
        return;
      }
      toast.error(getErrorMessage(error));
    },
  });

  const isExpired = expiry.isFinished;
  const resendLimitReached = resendCount >= MAX_RESENDS;
  const canResend = resend.isFinished && !resendMutation.isPending && !resendLimitReached;

  function onSubmit(data: VerifyOtpInput) {
    if (verifyMutation.isPending || isExpired) return;
    setOtpError(null);
    verifyMutation.mutate(data);
  }

  return (
    <AuthCardShell
      title="Verify your email"
      subtitle={
        maskedEmail
          ? `We sent a 6-digit code to ${maskedEmail}. Enter it below to continue.`
          : 'Enter the 6-digit code we just sent to your email address.'
      }
    >
      {(otpError || isExpired) && (
        <AuthBanner>
          {isExpired ? 'OTP has expired. Please request a new one.' : otpError}
        </AuthBanner>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <OTPInput
          value={otp}
          autoFocus
          onChange={(v) => {
            setValue('otp', v, { shouldValidate: false });
            setOtpError(null);
          }}
          error={errors.otp?.message}
          disabled={verifyMutation.isPending || isExpired}
        />

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
          <p className="-mt-3 text-right text-[13px] text-[var(--neutral-600)]">
            You have reached the OTP resend limit. Please try again later.
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={verifyMutation.isPending || isExpired || otp.length !== 6}
          aria-busy={verifyMutation.isPending}
        >
          {verifyMutation.isPending ? 'Verifying…' : 'Verify Email'}
        </button>
      </form>
    </AuthCardShell>
  );
}
