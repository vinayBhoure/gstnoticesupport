'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Mail } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/lib/shared-schemas/auth.schema';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import { ApiRequestError } from '@/lib/api/client';

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
      if (error instanceof ApiRequestError && error.code === 'EMAIL_NOT_VERIFIED') {
        setBanner({
          kind: 'info',
          message:
            "Your email isn't verified yet. Please use the 6-digit code we emailed you when you signed up.",
        });
        return;
      }
      // Generic — never disclose which credential was wrong (security).
      setBanner({
        kind: 'error',
        message:
          method === 'email' ? 'Email or password is incorrect.' : 'Mobile number or password is incorrect.',
      });
    },
  });

  function onSubmit(data: LoginInput) {
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
      {banner && (
        <div
          role="alert"
          aria-live="assertive"
          className={`mb-5 flex items-start gap-3 rounded-[var(--r-btn)] border p-3.5 text-sm ${
            banner.kind === 'error'
              ? 'border-[#F0D9B5] bg-[#FFF8EF]'
              : 'border-[var(--neutral-200)] bg-[var(--neutral-50)]'
          }`}
        >
          {banner.kind === 'error' ? (
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--warning-amber)]" />
          ) : (
            <Mail size={18} className="mt-0.5 shrink-0 text-[var(--primary-deep-blue)]" />
          )}
          <span className="text-[var(--neutral-900)]">{banner.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
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
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              placeholder="10-digit mobile number"
              error={errors.phone?.message}
              {...identifierReg}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                identifierReg.onChange(e);
              }}
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

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="password" className="text-sm font-medium text-[var(--primary-navy)]">
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
