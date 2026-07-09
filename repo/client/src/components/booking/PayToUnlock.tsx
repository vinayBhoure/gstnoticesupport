'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { paymentApi } from '@/lib/api/payment';
import { getErrorMessage, getErrorCode } from '@/lib/api/client';
import { loadRazorpayScript, type RazorpayFailureResponse } from '@/lib/razorpay-checkout';
import { SERVICE_META } from '@/lib/constants/services';
import { SITE_NAME } from '@/lib/site';
import type { ServiceType } from '@/lib/api/types';

type PayToUnlockProps = {
  bookingId: string;
  serviceType: ServiceType;
};

// Pay-to-unlock CTA (D74 insertion point) per resources/ui/Service Detail.html
// → .lock-wrap / .btn-pay. Opens Razorpay Checkout with a `handler` callback
// (not `callback_url`) — Razorpay's redirect mode POSTs form data, which a
// Next.js page route can't receive. The handler builds the verify URL from the
// server-returned callbackUrl (already carries booking_id) plus the three
// razorpay_* params and navigates there as a same-origin GET, so cookies flow
// and the query shape matches verifyQuerySchema exactly (RULES.md §4.2 — no
// PII in the URL, only opaque IDs). If the mobile browser loses context mid
// UPI-intent flow, the webhook (Layer 1) still captures the payment — the
// verify page's `inconclusive` state + WhatsApp link is the designed fallback.
export function PayToUnlock({ bookingId, serviceType }: PayToUnlockProps) {
  const router = useRouter();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () => paymentApi.initiate(bookingId),
    onSuccess: async (order) => {
      try {
        await loadRazorpayScript();
      } catch {
        toast.error('Could not load the payment window. Please try again.');
        return;
      }

      const Razorpay = window.Razorpay;
      if (!Razorpay) {
        toast.error('Could not load the payment window. Please try again.');
        return;
      }

      setCheckoutOpen(true);
      const checkout = new Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amountPaise,
        currency: order.currency,
        name: SITE_NAME,
        description: SERVICE_META[serviceType].label,
        prefill: order.prefill,
        theme: { color: '#0B8B4E' },
        handler: (response) => {
          const verifyUrl = new URL(order.callbackUrl);
          verifyUrl.searchParams.set('razorpay_payment_id', response.razorpay_payment_id);
          verifyUrl.searchParams.set('razorpay_order_id', response.razorpay_order_id);
          verifyUrl.searchParams.set('razorpay_signature', response.razorpay_signature);
          window.location.assign(verifyUrl.toString());
        },
        modal: {
          ondismiss: () => setCheckoutOpen(false),
        },
      });
      checkout.on('payment.failed', (response: RazorpayFailureResponse) => {
        toast.error(response.error.description || 'Payment failed. Please try again.');
        setCheckoutOpen(false);
      });
      checkout.open();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      const code = getErrorCode(error);
      if (code === 'INVALID_STATUS' || code === 'PAYMENT_ALREADY_CAPTURED') {
        router.refresh();
      }
    },
  });

  const isBusy = mutation.isPending || checkoutOpen;

  return (
    <div className="lock-wrap">
      <Lock className="lock-icon-anim" aria-hidden />
      <button
        type="button"
        className="btn btn-primary btn-block btn-pay"
        data-loading={isBusy ? 'true' : undefined}
        aria-label="Pay to unlock draft reply"
        aria-busy={isBusy}
        disabled={isBusy}
        onClick={() => mutation.mutate()}
      >
        <span className="btn-lbl">Pay to Unlock Draft</span>
        <span className="spinner" aria-hidden />
      </button>
    </div>
  );
}
