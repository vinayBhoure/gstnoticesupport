'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { loginSchema, type LoginInput } from '@/lib/shared-schemas/auth.schema';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { AuthBanner } from '@/components/ui/AuthBanner';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import { getErrorCode, getErrorMessage, getErrorMeta } from '@/lib/api/client';
import { isTransportError } from '@/lib/api/error-messages';
import { storeMaskedEmail } from '@/lib/auth/verify-otp-hint';

type Banner = { kind: 'error' | 'info'; message: string } | null;

type LoginFormProps = {
  // Already validated server-side (sanitizeReturnTo) — safe to push directly.
  returnTo?: string;
};

export function LoginForm({ returnTo }: LoginFormProps) {
  const router = useRouter();
  const [banner, setBanner] = useState<Banner>(null);
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), shouldUnregister: true });

  const identifierReg = register(method);

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user }) => {
      // Cross-origin auth requires the browser to receive Set-Cookie directly from
      // the backend, so login runs client-side and we navigate here. Access control
      // is still enforced server-side by requireUser()/requireAdmin() in the layouts —
      // the (dashboard) layout re-checks user.phone regardless of this navigation.
      if (user.role !== 'admin' && !user.phone) {
        router.push('/complete-profile');
      } else {
        router.push(returnTo ?? (user.role === 'admin' ? '/admin' : '/dashboard'));
      }
      router.refresh();
    },
    onError: (error) => {
      // An unverified account is a recoverable state, not a failure: the server has already
      // sent a fresh code, so carry the userId it returned straight into /verify-otp.
      if (getErrorCode(error) === 'EMAIL_NOT_VERIFIED') {
        const userId = getErrorMeta(error, 'userId');
        const maskedEmail = getErrorMeta(error, 'maskedEmail');
        if (userId) {
          if (maskedEmail) storeMaskedEmail(maskedEmail);
          toast.success(getErrorMessage(error));
          router.push(`/verify-otp?userId=${encodeURIComponent(userId)}`);
          return;
        }
      }

      if (isTransportError(error)) {
        toast.error(getErrorMessage(error));
        return;
      }

      // Server copy is already uniform for a bad identifier and a bad password — it must
      // never disclose which one was wrong (HLD §14.2).
      setBanner({ kind: 'error', message: getErrorMessage(error) });
    },
  });

  function onSubmit(data: LoginInput) {
    if (mutation.isPending) return; // guards a double-click racing past the disabled button
    setBanner(null);
    mutation.mutate(data);
  }

  return (
    <AuthCardShell
      title="Welcome back"
      subtitle="Log in to track and manage your GST notice responses."
      footer={
        <>
          New here?{' '}
          <Link href="/signup" className="font-semibold text-[var(--accent-green)] underline underline-offset-2">
            Create an account
          </Link>
        </>
      }
    >
      {banner && <AuthBanner kind={banner.kind}>{banner.message}</AuthBanner>}

      {/* Editing any field clears a stale failure message (spec §5). */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={() => setBanner(null)}
        noValidate
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-1.5">
          {method === 'email' ? (
            <Input
              id="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...identifierReg}
            />
          ) : (
            <Input
              id="phone"
              label="Mobile Number"
              type="tel"
              telPrefix
              autoComplete="tel"
              placeholder="10-digit mobile number"
              error={errors.phone?.message}
              {...identifierReg}
            />
          )}
          <button
            type="button"
            onClick={() => {
              setMethod((m) => (m === 'email' ? 'phone' : 'email'));
              setBanner(null);
            }}
            className="self-start text-[13px] font-semibold text-[var(--accent-green)] underline underline-offset-2"
          >
            {method === 'email' ? 'Use mobile number instead' : 'Use email instead'}
          </button>
        </div>

        <div className="field">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="password" className="field__label">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[13px] font-semibold text-[var(--accent-green)] underline underline-offset-2"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block mt-1"
          disabled={mutation.isPending}
          aria-busy={mutation.isPending}
        >
          {mutation.isPending ? 'Logging in…' : 'Log In'}
        </button>
      </form>
    </AuthCardShell>
  );
}
