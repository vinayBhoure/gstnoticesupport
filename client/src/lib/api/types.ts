// Mirrors the backend response envelope (server/src/utils/envelope.ts) and the
// error shape from server/src/middleware/errorHandler.ts. Keep in sync — these
// are the wire contract, not recreated business types.

export type ApiEnvelope<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiListEnvelope<T> = {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
};

export type ApiResponse<T> = ApiEnvelope<T> | ApiErrorBody;

// Mirrors server/src/dto/user.dto.ts → UserDTO (phone is nullable until complete-profile).
export type UserObject = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'user' | 'admin';
  emailVerified: boolean;
  termsAccepted: boolean;
  allowPromotions: boolean;
  interestedServices: string[];
  createdAt: string;
  updatedAt: string;
};

export type SignupResponseData = {
  userId: string;
};

// ── Booking domain enums (mirror server/prisma/schema.prisma) ──
export type ServiceType =
  | 'asmt_10'
  | 'scn'
  | 'commissioner_appeal'
  | 'gstat_appeal'
  | 'representation';
export type BookingStatus =
  | 'document_upload'
  | 'in_review'
  | 'draft_ready'
  | 'filing'
  | 'complete'
  | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type FilingFor = 'self' | 'others';
export type UploadedBy = 'user' | 'admin';
export type PaymentRecordStatus = 'created' | 'authorized' | 'captured' | 'failed';
export type PaymentSource = 'webhook' | 'verify' | 'admin_override';

// Mirrors server/src/dto/booking.dto.ts → the wire contract (never the Prisma row).
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

// Document/draft endpoint payloads (server/src/services/document.service.ts).
export type UploadUrlResponse = {
  uploadUrl: string;
  s3Key: string;
  expiresAt: string;
};

export type DraftUrlResponse = {
  draftUrl: string;
  expiresAt: string;
};

// ── Admin surface (mirror server/src/dto/admin.dto.ts) ──
export type AdminUserSummaryDTO = {
  id: string;
  name: string;
  email: string;
};

export type AdminBookingListItemDTO = {
  id: string;
  serviceType: ServiceType;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  user: AdminUserSummaryDTO;
  createdAt: string;
  updatedAt: string;
};

export type AdminBookingDetailDTO = BookingDetailDTO & {
  user: AdminUserSummaryDTO;
  documents: BookingDocumentDTO[];
  paymentRecords: PaymentRecordDTO[];
  hasDraft: boolean;
};

export type AdminStatsDTO = {
  totalBookings: number;
  byStatus: Record<BookingStatus, number>;
  byServiceType: Record<ServiceType, number>;
  totalRevenuePaise: number;
};

export type AdminUserListItemDTO = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interestedServices: ServiceType[];
  createdAt: string;
};

export type AdminUserDetailDTO = AdminUserListItemDTO & {
  activeBookingsCount: number;
};

export type DocumentDownloadResponse = {
  downloadUrl: string;
  fileName: string;
  expiresAt: string;
};

// ── Payments (mirror server/src/dto/payment.dto.ts) ──
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

// Mirrors server/src/dto/payment.dto.ts → PaymentHistoryItemDTO (user Payment History).
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
