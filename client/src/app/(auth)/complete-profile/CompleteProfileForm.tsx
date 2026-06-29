'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { completeProfileSchema, type CompleteProfileInput } from '@/lib/shared-schemas/auth.schema';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';

type CompleteProfileFormProps = { defaultName: string };

export function CompleteProfileForm({ defaultName }: CompleteProfileFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { name: defaultName, phone: '' },
  });

  const mutation = useMutation({
    mutationFn: authApi.completeProfile,
    onSuccess: () => {
      router.push('/dashboard');
      router.refresh();
    },
    onError: (error) => setServerError(getErrorMessage(error)),
  });

  function onSubmit(data: CompleteProfileInput) {
    setServerError(null);
    mutation.mutate(data);
  }

  return (
    <AuthCardShell
      title="Complete your profile"
      subtitle="We use these details to keep you updated on your GST notice response."
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
          id="phone"
          label="Phone Number"
          type="tel"
          telPrefix
          placeholder="10-digit mobile number"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <button
          type="submit"
          className="btn btn-primary btn-block mt-1"
          disabled={mutation.isPending}
          aria-busy={mutation.isPending}
        >
          {mutation.isPending ? 'Saving…' : 'Continue to Dashboard'}
        </button>
      </form>
    </AuthCardShell>
  );
}
