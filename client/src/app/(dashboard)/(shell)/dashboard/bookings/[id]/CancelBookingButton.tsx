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

// Cancel link + inline confirmation per resources/ui/Service Detail.html
// (.cancel-link / .cancel-confirm). Confirm uses btn-danger (amber — the only
// destructive-action colour in the system).
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

  return (
    <>
      <div className="cancel-link-wrap">
        <button
          type="button"
          className="cancel-link"
          aria-expanded={confirming}
          aria-controls="cancelConfirm"
          onClick={() => setConfirming((v) => !v)}
        >
          Cancel this service
        </button>
      </div>
      <div
        className={`cancel-confirm${confirming ? ' show' : ''}`}
        id="cancelConfirm"
        role="region"
        aria-label="Cancel confirmation"
      >
        <h3>Are you sure?</h3>
        <p>Cancellation cannot be undone.</p>
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-danger btn-block"
            style={{ marginBottom: 10 }}
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Cancelling…' : 'Confirm Cancellation'}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => setConfirming(false)}
            disabled={mutation.isPending}
          >
            Keep Service
          </button>
        </div>
      </div>
    </>
  );
}
