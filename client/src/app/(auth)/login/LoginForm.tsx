'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { loginSchema, type LoginInput } from '@server/schemas/auth.schema';
import { authApi } from '@/lib/api/auth';
import { ApiRequestError, getErrorMessage } from '@/lib/api/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      router.push('/dashboard');
    },
    onError: (error) => {
      if (error instanceof ApiRequestError && error.code === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email first. Check your inbox for the code.');
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} noValidate>
      <div className="flex flex-col gap-4">
        <Input
          id="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <a href="/forgot-password" className="text-sm text-[var(--accent-green)] font-medium">
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          variant="primary" block
        >
          {mutation.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </div>

      <p className="text-center text-sm text-[var(--neutral-600)] mt-5">
        Don&apos;t have an account?{' '}
        <a href="/signup" className="text-[var(--accent-green)] font-medium">
          Create one
        </a>
      </p>
    </form>
  );
}
