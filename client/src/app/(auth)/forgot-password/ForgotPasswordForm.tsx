'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { MailCheck } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/shared-schemas/auth.schema';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { AuthBanner } from '@/components/ui/AuthBanner';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/api/client';
import { isTransportError } from '@/lib/api/error-messages';

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      setSent(true);
      toast.success('Password reset OTP sent successfully.');
    },
    onError: (error) => {
      if (isTransportError(error)) {
        toast.error(getErrorMessage(error));
        return;
      }
      // Unlike login, this endpoint does say when no account matches, so the user can
      // correct a typo instead of waiting for a code that will never arrive.
      setServerError(getErrorMessage(error));
    },
  });

  if (sent) {
    return (
      <AuthCardShell
        title="Check your email"
        subtitle="We've sent a password reset code and link to your inbox."
        footer={
          <Link href="/login" className="font-semibold text-[var(--accent-green)] underline underline-offset-2">
            Back to log in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <MailCheck size={40} className="text-[var(--accent-green)]" />
          <p className="text-sm text-[var(--neutral-600)]">
            Open the email and follow the reset link to set a new password. The code expires in 10 minutes.
          </p>
        </div>
      </AuthCardShell>
    );
  }

  return (
    <AuthCardShell
      title="Reset your password"
      subtitle="Enter your account email and we'll send you a reset code."
      footer={
        <Link href="/login" className="font-semibold text-[var(--accent-green)] underline underline-offset-2">
          Back to log in
        </Link>
      }
    >
      {serverError && <AuthBanner>{serverError}</AuthBanner>}

      <form
        onSubmit={handleSubmit((d) => {
          if (mutation.isPending) return;
          setServerError(null);
          mutation.mutate(d);
        })}
        onChange={() => setServerError(null)}
        noValidate
        className="flex flex-col gap-5"
      >
        <Input
          id="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <button
          type="submit"
          className="btn btn-primary btn-block mt-1"
          disabled={mutation.isPending}
          aria-busy={mutation.isPending}
        >
          {mutation.isPending ? 'Sending…' : 'Send Reset Code'}
        </button>
      </form>
    </AuthCardShell>
  );
}
