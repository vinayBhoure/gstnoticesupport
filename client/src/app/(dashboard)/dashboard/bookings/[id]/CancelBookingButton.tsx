'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bookingApi } from '@/lib/api/booking';
import { getErrorMessage } from '@/lib/api/client';

type CancelBookingButtonProps = {
  bookingId: string;
};

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const mutation = useMutation({
    mutationFn: () => bookingApi.cancel(bookingId),
    onSuccess: () => {
      toast.success('Booking cancelled.');
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['bookings', bookingId] });
      router.refresh();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (!confirming) {
    return (
      <button
        type="button"
        className="text-sm font-medium text-[var(--neutral-600)] hover:text-[var(--warning-amber)]"
        onClick={() => setConfirming(true)}
      >
        Cancel this service
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-[var(--r-card)] border border-[var(--neutral-200)] p-4">
      <p className="text-sm text-[var(--neutral-900)]">
        Cancel this service? This cannot be undone.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setConfirming(false)}
          disabled={mutation.isPending}
        >
          Keep it
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Cancelling…' : 'Yes, cancel'}
        </button>
      </div>
    </div>
  );
}
