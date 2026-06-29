'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import type { z } from 'zod';
import { signupSchema, type SignupInput } from '@/lib/shared-schemas/auth.schema';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  // Three generics: form values use the schema INPUT type (allowPromotions optional
  // via .default), while the submit handler receives the transformed OUTPUT type.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof signupSchema>, unknown, SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { termsAccepted: false, allowPromotions: false },
  });

  const mutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      router.push(`/verify-otp?userId=${encodeURIComponent(data.userId)}`);
    },
    onError: (error) => setServerError(getErrorMessage(error)),
  });

  function onSubmit(data: SignupInput) {
    setServerError(null);
    mutation.mutate(data);
  }

  return (
    <AuthCardShell
      title="Create your account"
      subtitle="Upload your GST notice and get a drafted response from our experts."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[var(--accent-green)] underline underline-offset-2">
            Log in
          </Link>
        </>
      }
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <Input
          id="name"
          label="Full Name"
          type="text"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Checkbox
          id="termsAccepted"
          error={errors.termsAccepted?.message}
          label={
            <>
              I agree to the{' '}
              <Link href="/terms" className="text-[var(--accent-green)] underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[var(--accent-green)] underline">
                Privacy Policy
              </Link>
              .
            </>
          }
          {...register('termsAccepted')}
        />
        <Checkbox
          id="allowPromotions"
          label="Send me occasional updates about GST deadlines and services."
          {...register('allowPromotions')}
        />

        <button
          type="submit"
          className="btn btn-primary btn-block mt-1"
          disabled={mutation.isPending}
          aria-busy={mutation.isPending}
        >
          {mutation.isPending ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </AuthCardShell>
  );
}
