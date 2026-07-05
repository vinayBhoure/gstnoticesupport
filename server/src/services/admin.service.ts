import { BookingStatus, PaymentSource } from '@prisma/client';
import type { ServiceType } from '@prisma/client';
import { bookingRepository } from '../repositories/booking.repository';
import { userRepository } from '../repositories/user.repository';
import { paymentRepository } from '../repositories/payment.repository';
import { paymentService } from './payment.service';
import { notificationService } from './notification.service';
import { assertTransition, assertPayable } from './booking-state-machine';
import { ApiError } from '../utils/ApiError';
import {
  buildDraftKey,
  buildFinalDraftKey,
  getUploadUrl,
  uploadUrlExpiresAt,
  getDownloadUrl,
  draftUrlExpiresAt,
} from '../lib/s3';
import { fetchPayment } from '../lib/razorpay';
import { logger } from '../lib/logger';
import {
  toAdminBookingListItemDTO,
  toAdminBookingDetailDTO,
  toAdminUserListItemDTO,
  toAdminUserDetailDTO,
  type AdminBookingListItemDTO,
  type AdminBookingDetailDTO,
  type AdminUserListItemDTO,
  type AdminUserDetailDTO,
  type AdminStatsDTO,
} from '../dto/admin.dto';
import { SERVICE_TYPES } from '../schemas/booking.schema';
import {
  BOOKING_STATUSES,
  DRAFT_ALLOWED_CONTENT_TYPE,
  DRAFT_MAX_FILE_SIZE_BYTES,
  type AdminBookingListQuery,
  type AdminUserListQuery,
  type UpdateStatusInput,
  type DraftUploadUrlInput,
  type DraftConfirmInput,
  type UpdateNoteInput,
  type MarkPaidInput,
} from '../schemas/admin.schema';

// Draft upload/confirm is allowed while a case is in review or a draft already exists
// (re-upload). It is locked once payment/filing has begun (filing/complete/cancelled)
// and before review has started (document_upload).
const DRAFT_UPLOADABLE_STATUSES: BookingStatus[] = [
  BookingStatus.in_review,
  BookingStatus.draft_ready,
];

// The final draft is the post-payment deliverable — it can only be uploaded (or
// replaced) once payment has moved the booking into filing, and remains editable
// through complete. It never changes the booking status.
const FINAL_DRAFT_UPLOADABLE_STATUSES: BookingStatus[] = [
  BookingStatus.filing,
  BookingStatus.complete,
];

type UploadUrlResult = { uploadUrl: string; s3Key: string; expiresAt: string };
type AdminBookingListResult = {
  data: AdminBookingListItemDTO[];
  meta: { page: number; limit: number; total: number };
};
type AdminUserListResult = {
  data: AdminUserListItemDTO[];
  meta: { page: number; limit: number; total: number };
};
type DocumentDownloadResult = { downloadUrl: string; fileName: string; expiresAt: string };

function emptyStatusCounts(): Record<BookingStatus, number> {
  return BOOKING_STATUSES.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<BookingStatus, number>,
  );
}

function emptyServiceCounts(): Record<ServiceType, number> {
  return SERVICE_TYPES.reduce(
    (acc, serviceType) => {
      acc[serviceType] = 0;
      return acc;
    },
    {} as Record<ServiceType, number>,
  );
}

export const adminService = {
  async listBookings(query: AdminBookingListQuery): Promise<AdminBookingListResult> {
    const { data, total } = await bookingRepository.findAllForAdmin({
      page: query.page,
      limit: query.limit,
      status: query.status,
      paymentStatus: query.paymentStatus,
      serviceType: query.serviceType,
      search: query.search,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
    });
    return {
      data: data.map(toAdminBookingListItemDTO),
      meta: { page: query.page, limit: query.limit, total },
    };
  },

  async getBooking(id: string): Promise<AdminBookingDetailDTO> {
    const booking = await bookingRepository.findByIdForAdmin(id);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');
    return toAdminBookingDetailDTO(booking);
  },

  // Manual transitions: document_upload → in_review, filing → complete. The state
  // machine rejects anything illegal for the current status (409 INVALID_TRANSITION).
  async updateStatus(id: string, input: UpdateStatusInput): Promise<AdminBookingDetailDTO> {
    const booking = await bookingRepository.findByIdForAdmin(id);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');

    assertTransition(booking.status, input.status);
    await bookingRepository.updateStatus(id, input.status);

    const recipient = {
      id: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
    };
    if (input.status === BookingStatus.in_review) {
      notificationService.sendStatusInReview(recipient).catch(() => {});
    } else if (input.status === BookingStatus.complete) {
      notificationService.sendStatusComplete(recipient).catch(() => {});
    }

    return adminService.getBooking(id);
  },

  async createDraftUploadUrl(id: string, input: DraftUploadUrlInput): Promise<UploadUrlResult> {
    const booking = await bookingRepository.findByIdForAdmin(id);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');

    if (input.contentType !== DRAFT_ALLOWED_CONTENT_TYPE) {
      throw new ApiError(400, 'INVALID_FILE_TYPE', 'Only PDF files are accepted');
    }
    if (input.fileSize > DRAFT_MAX_FILE_SIZE_BYTES) {
      throw new ApiError(400, 'FILE_TOO_LARGE', 'Draft must be 20 MB or smaller');
    }
    if (!DRAFT_UPLOADABLE_STATUSES.includes(booking.status)) {
      throw new ApiError(409, 'DRAFT_LOCKED', 'A draft cannot be uploaded at this stage');
    }

    const s3Key = buildDraftKey(id, input.fileName);
    const uploadUrl = await getUploadUrl({ key: s3Key, contentLength: input.fileSize });
    return { uploadUrl, s3Key, expiresAt: uploadUrlExpiresAt().toISOString() };
  },

  // Confirm sets the draft pointer and transitions to draft_ready (first draft) or
  // keeps draft_ready (re-upload). First draft emails "draft ready"; re-upload emails
  // "draft updated" (notification matrix §12.2). No booking_documents row is created —
  // the draft is delivered solely via draftS3Key (kept out of the user's document list).
  async confirmDraftUpload(id: string, input: DraftConfirmInput): Promise<AdminBookingDetailDTO> {
    const booking = await bookingRepository.findByIdForAdmin(id);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');

    // The key embeds drafts/{bookingId}- — reject a key not issued for this booking.
    if (!input.s3Key.startsWith(`drafts/${id}-`)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 's3Key does not belong to this booking');
    }
    if (!DRAFT_UPLOADABLE_STATUSES.includes(booking.status)) {
      throw new ApiError(409, 'DRAFT_LOCKED', 'A draft cannot be uploaded at this stage');
    }

    // representation is consultation-priced: the admin must supply the fee quote here,
    // and it is meaningless (rejected) for fixed-price services.
    if (booking.serviceType === 'representation' && input.quotedAmountPaise == null) {
      throw new ApiError(400, 'QUOTE_REQUIRED', 'Enter the quoted fee for this representation booking');
    }
    if (booking.serviceType !== 'representation' && input.quotedAmountPaise != null) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'quotedAmountPaise only applies to representation bookings',
      );
    }

    const isFirstDraft = booking.status === BookingStatus.in_review;
    await bookingRepository.setDraftAndStatus(
      id,
      input.s3Key,
      BookingStatus.draft_ready,
      input.quotedAmountPaise,
    );

    const recipient = {
      id: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
    };
    if (isFirstDraft) {
      notificationService.sendDraftReady(recipient).catch(() => {});
    } else {
      notificationService.sendDraftUpdated(recipient).catch(() => {});
    }

    return adminService.getBooking(id);
  },

  // Final (post-payment) draft upload URL. Same PDF/size limits as the pre-payment
  // draft, but gated on filing/complete — the final draft cannot be uploaded before
  // the user has paid. Uses a distinct final-drafts/ key prefix.
  async createFinalDraftUploadUrl(
    id: string,
    input: DraftUploadUrlInput,
  ): Promise<UploadUrlResult> {
    const booking = await bookingRepository.findByIdForAdmin(id);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');

    if (input.contentType !== DRAFT_ALLOWED_CONTENT_TYPE) {
      throw new ApiError(400, 'INVALID_FILE_TYPE', 'Only PDF files are accepted');
    }
    if (input.fileSize > DRAFT_MAX_FILE_SIZE_BYTES) {
      throw new ApiError(400, 'FILE_TOO_LARGE', 'Draft must be 20 MB or smaller');
    }
    if (!FINAL_DRAFT_UPLOADABLE_STATUSES.includes(booking.status)) {
      throw new ApiError(
        409,
        'DRAFT_LOCKED',
        'The final draft can only be uploaded after the user completes payment',
      );
    }

    const s3Key = buildFinalDraftKey(id, input.fileName);
    const uploadUrl = await getUploadUrl({ key: s3Key, contentLength: input.fileSize });
    return { uploadUrl, s3Key, expiresAt: uploadUrlExpiresAt().toISOString() };
  },

  // Confirm sets the finalDraftS3Key pointer only — the booking status is unchanged
  // (it stays filing/complete). First upload emails "final draft ready"; a replacement
  // emails "final draft updated". The original pre-payment draft (draftS3Key) is left
  // intact so the user can still access the version they paid to unlock.
  async confirmFinalDraftUpload(
    id: string,
    input: DraftConfirmInput,
  ): Promise<AdminBookingDetailDTO> {
    const booking = await bookingRepository.findByIdForAdmin(id);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');

    // The key embeds final-drafts/{bookingId}- — reject a key not issued for this booking.
    if (!input.s3Key.startsWith(`final-drafts/${id}-`)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 's3Key does not belong to this booking');
    }
    if (!FINAL_DRAFT_UPLOADABLE_STATUSES.includes(booking.status)) {
      throw new ApiError(
        409,
        'DRAFT_LOCKED',
        'The final draft can only be uploaded after the user completes payment',
      );
    }

    const isFirstFinalDraft = booking.finalDraftS3Key === null;
    await bookingRepository.setFinalDraft(id, input.s3Key);

    const recipient = {
      id: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
    };
    if (isFirstFinalDraft) {
      notificationService.sendFinalDraftReady(recipient).catch(() => {});
    } else {
      notificationService.sendFinalDraftUpdated(recipient).catch(() => {});
    }

    return adminService.getBooking(id);
  },

  async updateNote(id: string, input: UpdateNoteInput): Promise<AdminBookingDetailDTO> {
    const booking = await bookingRepository.findByIdForAdmin(id);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');

    await bookingRepository.setAdminNote(id, input.note);
    return adminService.getBooking(id);
  },

  // Layer 3 — manual override. Razorpay's Fetch Payment API is the source of truth;
  // the admin cannot fabricate a payment. Reuses the shared idempotent capture core.
  async markPaid(
    id: string,
    adminId: string,
    input: MarkPaidInput,
  ): Promise<AdminBookingDetailDTO> {
    const booking = await bookingRepository.findByIdForAdmin(id);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');

    // 409 INVALID_STATUS if not draft_ready; PAYMENT_ALREADY_CAPTURED if already paid.
    assertPayable(booking);

    let payment;
    try {
      payment = await fetchPayment(input.razorpayPaymentId);
    } catch (err) {
      logger.error({ err, bookingId: id }, 'Razorpay fetch payment failed during admin mark-paid');
      throw new ApiError(502, 'RAZORPAY_ERROR', 'Unable to verify the payment with Razorpay. Please try again.');
    }

    if (payment.status !== 'captured') {
      throw new ApiError(422, 'PAYMENT_NOT_CAPTURED', 'Razorpay reports this payment is not captured');
    }

    // Cross-booking guard: the payment's order must belong to THIS booking, so an
    // admin cannot apply another booking's captured payment here.
    const record = await paymentRepository.findByRazorpayOrderId(payment.orderId);
    if (!record || record.bookingId !== id) {
      throw new ApiError(422, 'PAYMENT_NOT_CAPTURED', 'This payment does not belong to this booking');
    }

    const result = await paymentService.processCaptured({
      orderId: payment.orderId,
      paymentId: input.razorpayPaymentId,
      source: PaymentSource.admin_override,
      performedByAdminId: adminId,
    });
    if (result.status === 'order_not_found' || result.status === 'invalid_state') {
      throw new ApiError(422, 'PAYMENT_NOT_CAPTURED', 'This payment could not be applied to the booking');
    }

    return adminService.getBooking(id);
  },

  // Pre-signed GET for a user-uploaded document (Admin Booking Detail → Download).
  // Admin-only; the key never leaves the server — only the short-lived URL does.
  async getDocumentDownloadUrl(
    bookingId: string,
    documentId: string,
  ): Promise<DocumentDownloadResult> {
    const booking = await bookingRepository.findByIdForAdmin(bookingId);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');

    const document = booking.documents.find((doc) => doc.id === documentId);
    if (!document) throw new ApiError(404, 'NOT_FOUND', 'Document not found');

    const downloadUrl = await getDownloadUrl(document.s3Key);
    return {
      downloadUrl,
      fileName: document.fileName,
      expiresAt: draftUrlExpiresAt().toISOString(),
    };
  },

  async listUsers(query: AdminUserListQuery): Promise<AdminUserListResult> {
    const { data, total } = await userRepository.findAllForAdmin({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
    return {
      data: data.map(toAdminUserListItemDTO),
      meta: { page: query.page, limit: query.limit, total },
    };
  },

  async getUser(id: string): Promise<AdminUserDetailDTO> {
    const user = await userRepository.findById(id);
    if (!user || user.role !== 'user') throw new ApiError(404, 'NOT_FOUND', 'User not found');

    const activeBookingsCount = await bookingRepository.countActiveByUserId(id);
    return toAdminUserDetailDTO(user, activeBookingsCount);
  },

  // Soft delete only (database.md §3.1); bookings/payment records are retained.
  // Blocked while the user has any active booking (Admin User Detail prototype gate).
  async deleteUser(id: string): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user || user.role !== 'user') throw new ApiError(404, 'NOT_FOUND', 'User not found');

    const activeBookingsCount = await bookingRepository.countActiveByUserId(id);
    if (activeBookingsCount > 0) {
      throw new ApiError(
        409,
        'USER_HAS_ACTIVE_BOOKINGS',
        'Users can only be deleted once all their bookings are complete or cancelled',
      );
    }

    await userRepository.softDelete(id);
  },

  async getStats(): Promise<AdminStatsDTO> {
    const [statusRows, serviceRows, totalRevenuePaise] = await Promise.all([
      bookingRepository.countGroupedByStatus(),
      bookingRepository.countGroupedByServiceType(),
      paymentRepository.sumCapturedRevenuePaise(),
    ]);

    const byStatus = emptyStatusCounts();
    for (const row of statusRows) byStatus[row.status] = row.count;

    const byServiceType = emptyServiceCounts();
    for (const row of serviceRows) byServiceType[row.serviceType] = row.count;

    const totalBookings = statusRows.reduce((sum, row) => sum + row.count, 0);

    return { totalBookings, byStatus, byServiceType, totalRevenuePaise };
  },
};
