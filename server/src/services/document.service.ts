import { Prisma, BookingStatus } from '@prisma/client';
import { bookingRepository } from '../repositories/booking.repository';
import { documentRepository } from '../repositories/document.repository';
import {
  buildDocumentKey,
  getUploadUrl,
  getDownloadUrl,
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

    try {
      const document = await documentRepository.create({
        bookingId,
        uploadedBy: 'user',
        fileName: input.fileName,
        s3Key: input.s3Key,
      });
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

  async getDraftUrl(bookingId: string, userId: string): Promise<DraftUrlResult> {
    const booking = await bookingRepository.findByIdAndUserId(bookingId, userId);
    if (!booking) throw new ApiError(404, 'NOT_FOUND', 'Booking not found');

    if (!DRAFT_ACCESSIBLE_STATUSES.includes(booking.status)) {
      throw new ApiError(403, 'DRAFT_NOT_ACCESSIBLE', 'The draft is not available yet');
    }
    if (!booking.draftS3Key) {
      throw new ApiError(404, 'NOT_FOUND', 'No draft has been uploaded for this booking');
    }

    const draftUrl = await getDownloadUrl(booking.draftS3Key);
    return { draftUrl, expiresAt: draftUrlExpiresAt().toISOString() };
  },
};
