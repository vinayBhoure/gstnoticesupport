import type {
  Booking,
  BookingDocument,
  PaymentRecord,
  ServiceType,
  BookingStatus,
  PaymentStatus,
  FilingFor,
  UploadedBy,
  PaymentRecordStatus,
  PaymentSource,
} from '@prisma/client';
import type { BookingWithRelations } from '../repositories/booking.repository';

// Explicit DTO types — never spread Prisma rows (database.md §5.3).
// draftS3Key / finalDraftS3Key are NEVER returned to clients — only the derived
// `hasFinalDraft` flag (api_contract.md line 84). The pre-signed URL is the only way
// a client ever reaches a draft object.
// s3Key on documents is NEVER returned to clients (api_contract.md line 105).

export type BookingSummaryDTO = {
  id: string;
  serviceType: ServiceType;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};

export type BookingDetailDTO = {
  id: string;
  serviceType: ServiceType;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  organizationName: string | null;
  filingFor: FilingFor;
  gstn: string | null;
  consentInformationAccurate: boolean;
  consentContactAuthorized: boolean;
  adminNote: string | null;
  hasFinalDraft: boolean;
  quotedAmountPaise: number | null;
  createdAt: string;
  updatedAt: string;
};

export type BookingDocumentDTO = {
  id: string;
  bookingId: string;
  uploadedBy: UploadedBy;
  fileName: string;
  uploadedAt: string;
};

export type PaymentRecordDTO = {
  id: string;
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amountPaise: number;
  currency: string;
  status: PaymentRecordStatus;
  source: PaymentSource;
  createdAt: string;
  updatedAt: string;
};

export type BookingDetailWithRelationsDTO = BookingDetailDTO & {
  documents: BookingDocumentDTO[];
  latestPayment: PaymentRecordDTO | null;
};

export function toBookingSummaryDTO(booking: Booking): BookingSummaryDTO {
  return {
    id: booking.id,
    serviceType: booking.serviceType,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

export function toBookingDetailDTO(booking: Booking): BookingDetailDTO {
  return {
    id: booking.id,
    serviceType: booking.serviceType,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    contactName: booking.contactName,
    contactEmail: booking.contactEmail,
    contactPhone: booking.contactPhone,
    organizationName: booking.organizationName,
    filingFor: booking.filingFor,
    gstn: booking.gstn,
    consentInformationAccurate: booking.consentInformationAccurate,
    consentContactAuthorized: booking.consentContactAuthorized,
    adminNote: booking.adminNote,
    hasFinalDraft: booking.finalDraftS3Key !== null,
    quotedAmountPaise: booking.quotedAmountPaise,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

export function toBookingDocumentDTO(doc: BookingDocument): BookingDocumentDTO {
  return {
    id: doc.id,
    bookingId: doc.bookingId,
    uploadedBy: doc.uploadedBy,
    fileName: doc.fileName,
    uploadedAt: doc.uploadedAt.toISOString(),
  };
}

export function toPaymentRecordDTO(payment: PaymentRecord): PaymentRecordDTO {
  return {
    id: payment.id,
    bookingId: payment.bookingId,
    razorpayOrderId: payment.razorpayOrderId,
    razorpayPaymentId: payment.razorpayPaymentId,
    amountPaise: payment.amountPaise,
    currency: payment.currency,
    status: payment.status,
    source: payment.source,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

export function toBookingDetailWithRelationsDTO(
  booking: BookingWithRelations,
): BookingDetailWithRelationsDTO {
  const latestPaymentRecord = booking.paymentRecords[0] ?? null;
  return {
    ...toBookingDetailDTO(booking),
    documents: booking.documents.map(toBookingDocumentDTO),
    latestPayment: latestPaymentRecord ? toPaymentRecordDTO(latestPaymentRecord) : null,
  };
}
