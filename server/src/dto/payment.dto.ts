import type {
  PaymentRecord,
  PaymentRecordStatus,
  ServiceType,
  BookingStatus,
} from '@prisma/client';

// Response shapes for the payment endpoints (api_contract.md §5).
// Never exposes razorpay_payment_id verification details or internal record fields.

// A captured payment joined with its booking's service type + status, for the
// user Payment History page (api_contract.md §2.2, KB1 §8.1). bookingStatus drives
// the status badge in the prototype's Status column.
export type PaymentHistoryRow = PaymentRecord & {
  booking: { serviceType: ServiceType; status: BookingStatus };
};

export type PaymentHistoryItemDTO = {
  id: string;
  bookingId: string;
  serviceType: ServiceType;
  bookingStatus: BookingStatus;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amountPaise: number;
  currency: string;
  status: PaymentRecordStatus;
  createdAt: string;
};

export function toPaymentHistoryItemDTO(row: PaymentHistoryRow): PaymentHistoryItemDTO {
  return {
    id: row.id,
    bookingId: row.bookingId,
    serviceType: row.booking.serviceType,
    bookingStatus: row.booking.status,
    razorpayOrderId: row.razorpayOrderId,
    razorpayPaymentId: row.razorpayPaymentId,
    amountPaise: row.amountPaise,
    currency: row.currency,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export type InitiateOrderDTO = {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  callbackUrl: string;
};

export type VerifyOutcome = 'success' | 'failed' | 'inconclusive' | 'tampered';

export type VerifyResultDTO = {
  outcome: VerifyOutcome;
  bookingId?: string;
};
