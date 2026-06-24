'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@server/schemas/auth.schema';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';
import { Input } from '@/components/ui/Input';
import { OTPInput } from '@/components/ui/OTPInput';
import { Button } from '@/components/ui/Button';

type ResetFields = Pick<ResetPasswordInput, 'newPassword'>;

type ForgotPasswordFormProps = {
  prefillUserId?: string;
};

export function ForgotPasswordForm({ prefillUserId }: ForgotPasswordFormProps) {
  const router = useRouter();
  const isResetStep = Boolean(prefillUserId);

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | undefined>();
  const [sentEmail, setSentEmail] = useState(false);

  const emailForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetForm = useForm<ResetFields>({
    resolver: zodResolver(resetPasswordSchema.pick({ newPassword: true })),
  });

  const forgotMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      setSentEmail(true);
      toast.success('Check your email for a reset code and your user ID.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const resetMutation = useMutation({
    mutationFn: (data: ResetFields) =>
      authApi.resetPassword({
        userId: prefillUserId!,
        otp,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      toast.success('Password updated. You are now signed in.');
      router.push('/dashboard');
    },
    onError: (error) => {
      setOtpError(getErrorMessage(error));
    },
  });

  if (isResetStep) {
    return (
      <form
        onSubmit={resetForm.handleSubmit((data) => resetMutation.mutate(data))}
        noValidate
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--neutral-900)]">
              6-digit reset code
            </span>
            <OTPInput
              value={otp}
              onChange={(v) => {
                setOtp(v);
                setOtpError(undefined);
              }}
              error={otpError}
              disabled={resetMutation.isPending}
            />
          </div>

          <Input
            id="newPassword"
            type="password"
            label="New password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            error={resetForm.formState.errors.newPassword?.message}
            {...resetForm.register('newPassword')}
          />

          <Button
            type="submit"
            disabled={resetMutation.isPending || otp.length < 6}
            variant="primary" block
          >
            {resetMutation.isPending ? 'Resetting…' : 'Reset password'}
          </Button>
        </div>
      </form>
    );
  }

  if (sentEmail) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-[var(--neutral-600)] text-sm">
          If an account with that email exists, we sent a reset code and your user ID. Check your
          inbox and click the link in the email to reset your password.
        </p>
        <a href="/login" className="btn btn-secondary btn-block">
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={emailForm.handleSubmit((data) => forgotMutation.mutate(data))}
      noValidate
    >
      <div className="flex flex-col gap-4">
        <Input
          id="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          error={emailForm.formState.errors.email?.message}
          {...emailForm.register('email')}
        />

        <Button
          type="submit"
          disabled={forgotMutation.isPending}
          variant="primary" block
        >
          {forgotMutation.isPending ? 'Sending…' : 'Send reset code'}
        </Button>
      </div>

      <p className="text-center text-sm text-[var(--neutral-600)] mt-5">
        Remembered it?{' '}
        <a href="/login" className="text-[var(--accent-green)] font-medium">
          Back to sign in
        </a>
      </p>
    </form>
  );
}
