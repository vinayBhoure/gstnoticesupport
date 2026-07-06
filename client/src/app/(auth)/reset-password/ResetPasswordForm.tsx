'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/shared-schemas/auth.schema';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { Input } from '@/components/ui/Input';
import { OTPInput } from '@/components/ui/OTPInput';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';

type ResetPasswordFormProps = { userId: string };

export function ResetPasswordForm({ userId }: ResetPasswordFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { userId, otp: '', newPassword: '' },
  });

  const otp = useWatch({ control, name: 'otp' }) ?? '';

  const mutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      router.push('/dashboard');
      router.refresh();
    },
    onError: (error) => setServerError(getErrorMessage(error)),
  });

  function onSubmit(data: ResetPasswordInput) {
    setServerError(null);
    mutation.mutate(data);
  }

  return (
    <AuthCardShell
      title="Set a new password"
      subtitle="Enter the 6-digit code from your email and choose a new password."
    >
      {serverError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-5 flex items-start gap-3 rounded-[var(--r-btn)] border border-[#F0D9B5] bg-[#FFF8EF] p-3.5 text-sm text-[var(--neutral-900)]"
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--warning-amber)]" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--primary-navy)] text-center">
            Verification code
          </span>
          <OTPInput
            value={otp}
            onChange={(v) => setValue('otp', v, { shouldValidate: false })}
            error={errors.otp?.message}
            disabled={mutation.isPending}
          />
        </div>

        <Input
          id="newPassword"
          label="New Password"
          type="password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={mutation.isPending || otp.length !== 6}
          aria-busy={mutation.isPending}
        >
          {mutation.isPending ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </AuthCardShell>
  );
}
