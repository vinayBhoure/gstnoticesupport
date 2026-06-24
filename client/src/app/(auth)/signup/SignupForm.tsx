'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { z } from 'zod';
import { signupSchema, type SignupInput } from '@server/schemas/auth.schema';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';

type SignupFormValues = z.input<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { allowPromotions: false },
  });

  const mutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      router.push(`/verify-otp?userId=${data.userId}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data as SignupInput))} noValidate>
      <div className="flex flex-col gap-4">
        <Input
          id="name"
          label="Full name"
          placeholder="Ravi Kumar"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
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
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex flex-col gap-3 mt-1">
          <Checkbox
            id="termsAccepted"
            label={
              <>
                I agree to the{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
              </>
            }
            error={errors.termsAccepted?.message}
            {...register('termsAccepted')}
          />
          <Checkbox
            id="allowPromotions"
            label="Send me updates on GST law changes and notices"
            {...register('allowPromotions')}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          variant="primary" block className="mt-2"
        >
          {mutation.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </div>

      <p className="text-center text-sm text-[var(--neutral-600)] mt-5">
        Already have an account?{' '}
        <a href="/login" className="text-[var(--accent-green)] font-medium">
          Sign in
        </a>
      </p>
    </form>
  );
}
