import { Prisma, BookingStatus } from '@prisma/client';
import { bookingRepository } from '../repositories/booking.repository';
import { documentRepository } from '../repositories/document.repository';
import { notificationService } from './notification.service';
import {
  buildDocumentKey,
  getUploadUrl,
  getDownloadUrl,
  deleteObject,
  uploadUrlExpiresAt,
  draftUrlExpiresAt,
} from '../lib/s3';
import { ApiError } from '../utils/ApiError';
import { toBookingDocumentDTO, type BookingDocumentDTO } from '../dto/booking.dto';
import {
  ALLOWED_CONTENT_TYPE,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_BOOKING,
  type UploadUrlInput,
  type ConfirmUploadInput,
  type DraftUrlQuery,
} from '../schemas/document.schema';

const DRAFT_ACCESSIBLE_STATUSES: BookingStatus[] = [BookingStatus.filing, BookingStatus.complete];

type UploadUrlResult = { uploadUrl: string; s3Key: string; expiresAt: string };
type DraftUrlResult = { draftUrl: string; expiresAt: string };

export const documentService = {
  async getUploadUrl(
    bookingId: string,
    userId: string,
    input: UploadUrlInput,
  ): Promise<UploadUrlResult> {
    // 404 collapses "not found" and "wrong owner" — no existence leak (decisions.md).
    const booking = await bookingRepository.findByIdAndUserId(bookingId, userId);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');

    if (input.contentType !== ALLOWED_CONTENT_TYPE) {
      throw new ApiError(400, 'INVALID_FILE_TYPE', 'Only PDF files are accepted');
    }
    if (input.fileSize > MAX_FILE_SIZE_BYTES) {
      throw new ApiError(400, 'FILE_TOO_LARGE', 'File must be 5 MB or smaller');
    }
    if (booking.status !== BookingStatus.document_upload) {
      throw new ApiError(409, 'INVALID_STATUS', 'Documents cannot be uploaded at this stage');
    }
    if (booking.documents.length >= MAX_FILES_PER_BOOKING) {
      throw new ApiError(409, 'FILE_LIMIT_REACHED', 'This booking already has 8 documents');
    }

    const s3Key = buildDocumentKey(userId, bookingId, input.fileName);
    const uploadUrl = await getUploadUrl({ key: s3Key, contentLength: input.fileSize });

    return { uploadUrl, s3Key, expiresAt: uploadUrlExpiresAt().toISOString() };
  },

  async confirmUpload(
    bookingId: string,
    userId: string,
    input: ConfirmUploadInput,
  ): Promise<BookingDocumentDTO> {
    const booking = await bookingRepository.findByIdAndUserId(bookingId, userId);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');

    // The key embeds {userId}/{bookingId}/ — reject a key that wasn't issued for
    // this user's booking so a confirm can't reference an arbitrary object.
    if (!input.s3Key.startsWith(`${userId}/${bookingId}/`)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 's3Key does not belong to this booking');
    }

    if (await documentRepository.existsByS3Key(input.s3Key)) {
      throw new ApiError(409, 'DUPLICATE_KEY', 'This document has already been recorded');
    }

    // Booking was fetched before this document was created, so an empty list here
    // means this is the first upload for the booking — the one-time admin signal.
    const isFirstUpload = booking.documents.length === 0;

    try {
      const document = await documentRepository.create({
        bookingId,
        uploadedBy: 'user',
        fileName: input.fileName,
        s3Key: input.s3Key,
      });

      if (isFirstUpload) {
        // Best-effort — email failure must never block the upload confirmation.
        notificationService
          .sendDocumentsUploaded({
            id: booking.id,
            serviceType: booking.serviceType,
            contactName: booking.contactName,
            contactEmail: booking.contactEmail,
          })
          .catch(() => {
            // Intentionally suppressed — emailService already logs internally.
          });
      }

      return toBookingDocumentDTO(document);
    } catch (error) {
      // Unique-constraint race backstop (HLD §10.4 idempotency via unique s3Key).
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ApiError(409, 'DUPLICATE_KEY', 'This document has already been recorded');
      }
      throw error;
    }
  },

  async listDocuments(bookingId: string, userId: string): Promise<BookingDocumentDTO[]> {
    const booking = await bookingRepository.findByIdAndUserId(bookingId, userId);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');
    return booking.documents.map(toBookingDocumentDTO);
  },

  // Users may remove a document only while the booking still accepts uploads
  // (HLD §19: no mid-service re-upload once review has started). The DB row is
  // deleted first; the S3 object delete is best-effort so a transient S3 error
  // can never leave a dangling row the user still sees.
  async deleteDocument(bookingId: string, documentId: string, userId: string): Promise<void> {
    const booking = await bookingRepository.findByIdAndUserId(bookingId, userId);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');

    if (booking.status !== BookingStatus.document_upload) {
      throw new ApiError(409, 'INVALID_STATUS', 'Documents cannot be removed at this stage');
    }

    const document = await documentRepository.findByIdAndBookingId(documentId, bookingId);
    if (!document || document.uploadedBy !== 'user') {
      throw new ApiError(404, 'NOT_FOUND', 'Document not found');
    }

    await documentRepository.deleteById(documentId);

    deleteObject(document.s3Key).catch(() => {
      // Intentionally suppressed — an orphaned object is swept by the S3
      // lifecycle policy; the DB row is already gone, which is what matters.
    });
  },

  // Draft download URL, gated on filing/complete. When no variant is requested, the
  // final (post-payment) draft is preferred if one exists, else the original — so
  // existing "view draft" links surface the best available version automatically.
  async getDraftUrl(
    bookingId: string,
    userId: string,
    query: DraftUrlQuery = {},
  ): Promise<DraftUrlResult> {
    const booking = await bookingRepository.findByIdAndUserId(bookingId, userId);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');

    if (!DRAFT_ACCESSIBLE_STATUSES.includes(booking.status)) {
      throw new ApiError(403, 'DRAFT_NOT_ACCESSIBLE', 'The draft is not available yet');
    }

    const variant = query.variant ?? (booking.finalDraftS3Key ? 'final' : 'original');
    const key = variant === 'final' ? booking.finalDraftS3Key : booking.draftS3Key;
    if (!key) {
      throw new ApiError(404, 'NOT_FOUND', 'No draft has been uploaded for this booking');
    }

    const draftUrl = await getDownloadUrl(key);
    return { draftUrl, expiresAt: draftUrlExpiresAt().toISOString() };
  },
};
