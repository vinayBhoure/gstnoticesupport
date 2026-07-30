'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { z } from 'zod';
import { signupSchema, type SignupInput } from '@/lib/shared-schemas/auth.schema';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { AuthBanner } from '@/components/ui/AuthBanner';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { PasswordChecklist } from '@/components/ui/PasswordChecklist';
import { authApi } from '@/lib/api/auth';
import { getErrorCode, getErrorMessage } from '@/lib/api/client';
import { isTransportError } from '@/lib/api/error-messages';
import { storeMaskedEmail } from '@/lib/auth/verify-otp-hint';

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  // A duplicate account is resolved by logging in, so the banner offers that route.
  const [showLoginLink, setShowLoginLink] = useState(false);

  // Three generics: form values use the schema INPUT type (allowPromotions optional
  // via .default), while the submit handler receives the transformed OUTPUT type.
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
  } = useForm<z.input<typeof signupSchema>, unknown, SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { termsAccepted: false, allowPromotions: false },
    mode: 'onChange',
    delayError: 400,
  });

  const password = useWatch({ control, name: 'password' }) ?? '';

  const mutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      storeMaskedEmail(data.maskedEmail);
      router.push(`/verify-otp?userId=${encodeURIComponent(data.userId)}`);
    },
    onError: (error) => {
      if (isTransportError(error)) {
        toast.error(getErrorMessage(error));
        return;
      }
      const code = getErrorCode(error);
      setShowLoginLink(code === 'EMAIL_TAKEN' || code === 'ACCOUNT_UNVERIFIED');
      setServerError(getErrorMessage(error));
    },
  });

  function onSubmit(data: SignupInput) {
    if (mutation.isPending) return;
    setServerError(null);
    setShowLoginLink(false);
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
        <AuthBanner>
          {serverError}
          {showLoginLink && (
            <>
              {' '}
              <Link
                href="/login"
                className="font-semibold text-[var(--accent-green)] underline underline-offset-2"
              >
                Go to log in
              </Link>
            </>
          )}
        </AuthBanner>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={() => setServerError(null)}
        noValidate
        className="flex flex-col gap-5"
      >
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
        <div className="flex flex-col gap-2">
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordChecklist password={password} />
        </div>

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
          disabled={!isValid || mutation.isPending}
          aria-busy={mutation.isPending}
        >
          {mutation.isPending ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </AuthCardShell>
  );
}
