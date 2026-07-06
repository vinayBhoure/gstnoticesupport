import { createHmac, timingSafeEqual } from 'node:crypto';
import Razorpay from 'razorpay';
import { env } from './env';

// Razorpay client wrapper (mirrors lib/s3.ts / lib/email.ts style).
// Orders API + Fetch Payment API via the SDK; signature checks via crypto so the
// HMAC comparison is explicit and timing-safe (integration skill — webhook security).

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export type CreateOrderParams = {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
};

export type RazorpayOrderResult = {
  id: string;
  amount: number;
  currency: string;
};

export async function createOrder({
  amountPaise,
  receipt,
  notes,
}: CreateOrderParams): Promise<RazorpayOrderResult> {
  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    // receipt must be ≤ 40 chars (Razorpay constraint).
    receipt: receipt.slice(0, 40),
    notes,
  });
  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
  };
}

export type FetchedPayment = {
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  orderId: string;
};

// Synchronous source of truth used by Layer 2 (verify) and Layer 3 (admin override).
export async function fetchPayment(paymentId: string): Promise<FetchedPayment> {
  const payment = await razorpay.payments.fetch(paymentId);
  return {
    status: payment.status,
    orderId: payment.order_id,
  };
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// Layer 1 — webhook. HMAC-SHA256 over the RAW request body buffer with the webhook secret.
// Never parse the body before this check; JSON re-serialization breaks the signature.
export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  const expected = createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return timingSafeEqualHex(expected, signature);
}

// Layer 2 — verify redirect. HMAC-SHA256 over `order_id|payment_id` with the key SECRET.
export function verifyPaymentRedirectSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expected = createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex');
  return timingSafeEqualHex(expected, params.signature);
}
