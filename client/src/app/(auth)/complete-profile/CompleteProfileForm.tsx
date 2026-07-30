'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { completeProfileSchema, type CompleteProfileInput } from '@/lib/shared-schemas/auth.schema';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { AuthBanner } from '@/components/ui/AuthBanner';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api/auth';
import { ApiRequestError, getErrorMessage } from '@/lib/api/client';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const PHONE_TAKEN_MESSAGE = 'An account already exists with this mobile number. Please log in.';

type CompleteProfileFormProps = { defaultName: string };

export function CompleteProfileForm({ defaultName }: CompleteProfileFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { name: defaultName, phone: '' },
    mode: 'onChange',
    delayError: 400,
  });

  const debouncedPhone = useDebouncedValue(phone, 350);
  const isPlausiblePhone = /^[6-9]\d{9}$/.test(debouncedPhone);

  const phoneCheck = useQuery({
    queryKey: ['phone-availability', debouncedPhone],
    queryFn: () => authApi.checkPhone({ phone: debouncedPhone }),
    enabled: isPlausiblePhone,
    staleTime: 30_000,
  });
  const phoneTaken = isPlausiblePhone && phoneCheck.data?.available === false;

  const mutation = useMutation({
    mutationFn: authApi.completeProfile,
    onSuccess: () => {
      router.push('/dashboard');
      router.refresh();
    },
    onError: (error) => {
      if (error instanceof ApiRequestError && error.code === 'PHONE_TAKEN') {
        setError('phone', { message: PHONE_TAKEN_MESSAGE });
        return;
      }
      setServerError(getErrorMessage(error));
    },
  });

  function onSubmit(data: CompleteProfileInput) {
    setServerError(null);
    mutation.mutate(data);
  }

  const phoneReg = register('phone');
  const submitDisabled =
    !isValid ||
    !isPlausiblePhone ||
    phoneCheck.isFetching ||
    phoneTaken ||
    mutation.isPending;

  return (
    <AuthCardShell
      title="Complete your profile"
      subtitle="We use these details to keep you updated on your GST notice response."
    >
      {serverError && <AuthBanner>{serverError}</AuthBanner>}

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
          error={errors.phone?.message ?? (phoneTaken ? PHONE_TAKEN_MESSAGE : undefined)}
          {...phoneReg}
          onChange={(e) => {
            setPhone(e.target.value);
            void phoneReg.onChange(e);
          }}
        />

        <button
          type="submit"
          className="btn btn-primary btn-block mt-1"
          disabled={submitDisabled}
          aria-busy={mutation.isPending}
        >
          {mutation.isPending ? 'Saving…' : 'Continue to Dashboard'}
        </button>
      </form>
    </AuthCardShell>
  );
}
