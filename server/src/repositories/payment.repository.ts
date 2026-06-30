import { prisma } from '../lib/prisma';
import {
  PaymentRecordStatus,
  PaymentSource,
  BookingStatus,
  PaymentStatus,
} from '@prisma/client';
import type { Booking, PaymentRecord } from '@prisma/client';

export type PaymentRecordWithBooking = PaymentRecord & { booking: Booking };

export const paymentRepository = {
  // Created at order initiation. source is provisional ('webhook') and is overwritten
  // by whichever layer actually captures the payment.
  async create(data: {
    bookingId: string;
    razorpayOrderId: string;
    amountPaise: number;
  }): Promise<PaymentRecord> {
    return prisma.paymentRecord.create({
      data: {
        bookingId: data.bookingId,
        razorpayOrderId: data.razorpayOrderId,
        amountPaise: data.amountPaise,
        status: PaymentRecordStatus.created,
        source: PaymentSource.webhook,
      },
    });
  },

  async findByRazorpayPaymentId(paymentId: string): Promise<PaymentRecordWithBooking | null> {
    return prisma.paymentRecord.findUnique({
      where: { razorpayPaymentId: paymentId },
      include: { booking: true },
    });
  },

  async findByRazorpayOrderId(orderId: string): Promise<PaymentRecordWithBooking | null> {
    return prisma.paymentRecord.findUnique({
      where: { razorpayOrderId: orderId },
      include: { booking: true },
    });
  },

  // A failed attempt marks the payment record only — the booking stays at draft_ready /
  // paymentStatus=pending so the user can retry. Never overwrites a captured record.
  async markFailedByOrderId(orderId: string): Promise<void> {
    await prisma.paymentRecord.updateMany({
      where: { razorpayOrderId: orderId, status: { not: PaymentRecordStatus.captured } },
      data: { status: PaymentRecordStatus.failed, updatedAt: new Date() },
    });
  },

  // Atomic capture + transition. The conditional updateMany (status != captured) is the
  // idempotency claim: only the first concurrent layer gets count=1 and transitions the
  // booking; any later/duplicate layer gets count=0 and this returns null. Combined with
  // the unique razorpay_payment_id constraint, a payment transitions a booking exactly once
  // regardless of which reliability layer (webhook / verify / admin override) runs first.
  async captureAndTransition(params: {
    orderId: string;
    bookingId: string;
    paymentId: string;
    source: PaymentSource;
    performedByAdminId?: string;
  }): Promise<Booking | null> {
    return prisma.$transaction(async (tx) => {
      const claim = await tx.paymentRecord.updateMany({
        where: {
          razorpayOrderId: params.orderId,
          status: { not: PaymentRecordStatus.captured },
        },
        data: {
          razorpayPaymentId: params.paymentId,
          status: PaymentRecordStatus.captured,
          source: params.source,
          performedByAdminId: params.performedByAdminId ?? null,
          updatedAt: new Date(),
        },
      });
      if (claim.count === 0) {
        return null;
      }
      return tx.booking.update({
        where: { id: params.bookingId },
        data: {
          status: BookingStatus.filing,
          paymentStatus: PaymentStatus.paid,
          updatedAt: new Date(),
        },
      });
    });
  },
};
