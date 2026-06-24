'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { completeProfileSchema, type CompleteProfileInput } from '@server/schemas/auth.schema';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function CompleteProfileForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.completeProfile,
    onSuccess: () => {
      toast.success('Profile complete! Welcome to GST Notice Support.');
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} noValidate>
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
          id="phone"
          label="Mobile number"
          placeholder="9876543210"
          telPrefix
          error={errors.phone?.message}
          {...register('phone')}
        />

        <p className="text-xs text-[var(--neutral-600)] -mt-1">
          We use your mobile number only for case updates and document delivery.
        </p>

        <Button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          variant="primary" block className="mt-2"
        >
          {mutation.isPending ? 'Saving…' : 'Complete profile'}
        </Button>
      </div>
    </form>
  );
}
