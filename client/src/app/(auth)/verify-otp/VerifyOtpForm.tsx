'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';
import { OTPInput } from '@/components/ui/OTPInput';
import { Button } from '@/components/ui/Button';

type VerifyOtpFormProps = {
  userId: string;
};

export function VerifyOtpForm({ userId }: VerifyOtpFormProps) {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | undefined>();

  const verifyMutation = useMutation({
    mutationFn: () => authApi.verifyOtp({ userId, otp }),
    onSuccess: () => {
      router.push('/complete-profile');
    },
    onError: (error) => {
      setOtpError(getErrorMessage(error));
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendOtp({ userId }),
    onSuccess: () => {
      toast.success('A new code has been sent to your email.');
      setOtp('');
      setOtpError(undefined);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setOtpError(undefined);
    if (otp.length < 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }
    verifyMutation.mutate();
  }

  const isPending = verifyMutation.isPending;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-5">
        <OTPInput
          value={otp}
          onChange={(v) => {
            setOtp(v);
            setOtpError(undefined);
          }}
          error={otpError}
          disabled={isPending}
        />

        <Button
          type="submit"
          disabled={isPending || otp.length < 6}
          variant="primary" block
        >
          {isPending ? 'Verifying…' : 'Verify email'}
        </Button>

        <p className="text-center text-sm text-[var(--neutral-600)]">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            className="btn-tertiary"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
          >
            {resendMutation.isPending ? 'Sending…' : 'Resend'}
          </button>
        </p>
      </div>
    </form>
  );
}
