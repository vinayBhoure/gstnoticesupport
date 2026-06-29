'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { verifyOtpSchema, type VerifyOtpInput } from '@/lib/shared-schemas/auth.schema';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { OTPInput } from '@/components/ui/OTPInput';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';

type VerifyOtpFormProps = { userId: string };

export function VerifyOtpForm({ userId }: VerifyOtpFormProps) {
  const router = useRouter();
  const [otpError, setOtpError] = useState<string | null>(null);

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
    onSuccess: () => {
      router.push('/complete-profile');
      router.refresh();
    },
    onError: (error) => setOtpError(getErrorMessage(error)),
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendOtp({ userId }),
    onSuccess: () => toast.success('A new code has been sent to your email.'),
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  function onSubmit(data: VerifyOtpInput) {
    setOtpError(null);
    verifyMutation.mutate(data);
  }

  return (
    <AuthCardShell
      title="Verify your email"
      subtitle="Enter the 6-digit code we just sent to your email address."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <OTPInput
          value={otp}
          onChange={(v) => {
            setValue('otp', v, { shouldValidate: false });
            setOtpError(null);
          }}
          error={otpError ?? errors.otp?.message}
          disabled={verifyMutation.isPending}
        />

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={verifyMutation.isPending || otp.length !== 6}
          aria-busy={verifyMutation.isPending}
        >
          {verifyMutation.isPending ? 'Verifying…' : 'Verify Email'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--neutral-600)]">
        Didn&apos;t get the code?{' '}
        <button
          type="button"
          onClick={() => resendMutation.mutate()}
          disabled={resendMutation.isPending}
          className="font-semibold text-[var(--accent-green)] underline underline-offset-2 disabled:opacity-50"
        >
          {resendMutation.isPending ? 'Sending…' : 'Resend code'}
        </button>
      </p>
    </AuthCardShell>
  );
}
