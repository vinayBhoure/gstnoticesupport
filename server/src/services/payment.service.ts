import { PaymentSource, BookingStatus } from '@prisma/client';
import type { Booking } from '@prisma/client';
import { paymentRepository } from '../repositories/payment.repository';
import { bookingRepository } from '../repositories/booking.repository';
import { notificationService } from './notification.service';
import { assertPayable } from './booking-state-machine';
import { ApiError } from '../utils/ApiError';
import { getServicePriceInPaise } from '../lib/pricing';
import { createOrder, fetchPayment, verifyPaymentRedirectSignature } from '../lib/razorpay';
import { env } from '../lib/env';
import { logger } from '../lib/logger';
import type { InitiateOrderDTO, VerifyResultDTO } from '../dto/payment.dto';
import type { VerifyQuery } from '../schemas/payment.schema';

// Outcome of the shared idempotent capture core, reused by all three reliability layers.
type CaptureResult =
  | { status: 'processed'; booking: Booking }
  | { status: 'already_processed'; booking: Booking }
  | { status: 'order_not_found' }
  | { status: 'invalid_state' };

type NormalizedWebhookEvent = {
  event: string;
  orderId: string;
  paymentId: string;
};

// Narrow the untyped webhook JSON to the fields we need (RULES.md §1.2 — no `any`).
function parseWebhookEvent(payload: unknown): NormalizedWebhookEvent | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const root = payload as Record<string, unknown>;
  const event = typeof root.event === 'string' ? root.event : null;
  const payloadObj = root.payload as Record<string, unknown> | undefined;
  const paymentObj = payloadObj?.payment as Record<string, unknown> | undefined;
  const entity = paymentObj?.entity as Record<string, unknown> | undefined;
  if (!event || !entity) return null;
  const orderId = typeof entity.order_id === 'string' ? entity.order_id : null;
  const paymentId = typeof entity.id === 'string' ? entity.id : null;
  if (!orderId || !paymentId) return null;
  return { event, orderId, paymentId };
}

export const paymentService = {
  // POST /payments/:bookingId/initiate — Razorpay Order + payment_records row.
  async initiate(userId: string, bookingId: string): Promise<InitiateOrderDTO> {
    const booking = await bookingRepository.findByIdAndUserId(bookingId, userId);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');

    assertPayable(booking);

    // Price is always derived server-side from the service type — never from the client.
    const amountPaise = getServicePriceInPaise(booking.serviceType);

    let order;
    try {
      order = await createOrder({
        amountPaise,
        receipt: booking.id,
        notes: { bookingId: booking.id, userId },
      });
    } catch (err) {
      logger.error({ err, bookingId: booking.id }, 'Razorpay order creation failed');
      throw new ApiError(502, 'RAZORPAY_ERROR', 'Unable to start payment right now. Please try again.');
    }

    await paymentRepository.create({
      bookingId: booking.id,
      razorpayOrderId: order.id,
      amountPaise,
    });

    return {
      orderId: order.id,
      amountPaise,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
      prefill: {
        name: booking.contactName,
        email: booking.contactEmail,
        contact: booking.contactPhone,
      },
      callbackUrl: `${env.CLIENT_URL}/payment/verify?booking_id=${encodeURIComponent(booking.id)}`,
    };
  },

  // Shared idempotent capture core (Layer 1 webhook, Layer 2 verify, future Layer 3 admin).
  // Sends the payment-confirmed email exactly once, only on a real transition.
  async processCaptured(params: {
    orderId: string;
    paymentId: string;
    source: PaymentSource;
    performedByAdminId?: string;
  }): Promise<CaptureResult> {
    const existing = await paymentRepository.findByRazorpayPaymentId(params.paymentId);
    if (existing) {
      return { status: 'already_processed', booking: existing.booking };
    }

    const record = await paymentRepository.findByRazorpayOrderId(params.orderId);
    if (!record) {
      return { status: 'order_not_found' };
    }

    if (record.booking.status !== BookingStatus.draft_ready) {
      // Another layer already transitioned this booking — nothing to do.
      return { status: 'already_processed', booking: record.booking };
    }

    let booking: Booking | null;
    try {
      booking = await paymentRepository.captureAndTransition({
        orderId: params.orderId,
        bookingId: record.bookingId,
        paymentId: params.paymentId,
        source: params.source,
        performedByAdminId: params.performedByAdminId,
      });
    } catch (err) {
      // Unique razorpay_payment_id violation under a true race — already processed.
      logger.warn({ err, orderId: params.orderId }, 'Capture race resolved via unique constraint');
      return { status: 'already_processed', booking: record.booking };
    }

    if (!booking) {
      return { status: 'already_processed', booking: record.booking };
    }

    notificationService
      .sendPaymentConfirmed({
        id: booking.id,
        serviceType: booking.serviceType,
        contactName: booking.contactName,
        contactEmail: booking.contactEmail,
        amountPaise: record.amountPaise,
      })
      .catch(() => {});

    return { status: 'processed', booking };
  },

  // A failed/cancelled attempt: mark the record failed (booking stays payable) + notify admin.
  async recordFailed(orderId: string): Promise<void> {
    const record = await paymentRepository.findByRazorpayOrderId(orderId);
    if (!record) return;

    await paymentRepository.markFailedByOrderId(orderId);

    notificationService
      .sendPaymentFailed({
        id: record.booking.id,
        serviceType: record.booking.serviceType,
        contactName: record.booking.contactName,
        contactEmail: record.booking.contactEmail,
        contactPhone: record.booking.contactPhone,
      })
      .catch(() => {});
  },

  // Layer 1 — webhook dispatch. Caller has already verified the signature.
  async handleWebhookEvent(payload: unknown): Promise<void> {
    const event = parseWebhookEvent(payload);
    if (!event) return;

    if (event.event === 'payment.captured') {
      const result = await paymentService.processCaptured({
        orderId: event.orderId,
        paymentId: event.paymentId,
        source: PaymentSource.webhook,
      });
      if (result.status === 'order_not_found') {
        logger.warn({ orderId: event.orderId }, 'Webhook captured event for unknown order');
      }
      return;
    }

    if (event.event === 'payment.failed') {
      await paymentService.recordFailed(event.orderId);
    }
  },

  // Layer 2 — verify page fallback. Returns an outcome enum (never redirects).
  async verify(userId: string, query: VerifyQuery): Promise<VerifyResultDTO> {
    const signatureOk = verifyPaymentRedirectSignature({
      orderId: query.razorpay_order_id,
      paymentId: query.razorpay_payment_id,
      signature: query.razorpay_signature,
    });
    if (!signatureOk) {
      return { outcome: 'tampered' };
    }

    // Ownership — booking must belong to the requesting user.
    const booking = await bookingRepository.findByIdAndUserId(query.booking_id, userId);
    if (!booking) {
      return { outcome: 'tampered' };
    }

    let payment;
    try {
      payment = await fetchPayment(query.razorpay_payment_id);
    } catch (err) {
      logger.error({ err, bookingId: query.booking_id }, 'Razorpay fetch payment failed during verify');
      return { outcome: 'inconclusive', bookingId: query.booking_id };
    }

    if (payment.orderId !== query.razorpay_order_id) {
      return { outcome: 'tampered' };
    }

    if (payment.status === 'captured') {
      const result = await paymentService.processCaptured({
        orderId: query.razorpay_order_id,
        paymentId: query.razorpay_payment_id,
        source: PaymentSource.verify,
      });
      if (result.status === 'processed' || result.status === 'already_processed') {
        return { outcome: 'success', bookingId: query.booking_id };
      }
      return { outcome: 'inconclusive', bookingId: query.booking_id };
    }

    if (payment.status === 'failed') {
      await paymentService.recordFailed(query.razorpay_order_id);
      return { outcome: 'failed', bookingId: query.booking_id };
    }

    return { outcome: 'inconclusive', bookingId: query.booking_id };
  },
};
