import { z } from 'zod';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (HLD §9.3)
export const MAX_FILES_PER_BOOKING = 8; // HLD §9.3
export const ALLOWED_CONTENT_TYPE = 'application/pdf';

// Structural validation only. The business checks that map to specific codes
// (FILE_TOO_LARGE, INVALID_FILE_TYPE) live in the service so the contract's
// exact error codes are emitted instead of a generic VALIDATION_ERROR.
export const uploadUrlSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, 'fileName is required')
    .max(255, 'fileName must be at most 255 characters'),
  fileSize: z.number().int('fileSize must be an integer').positive('fileSize must be positive'),
  contentType: z.string().trim().min(1, 'contentType is required'),
});

export const confirmUploadSchema = z.object({
  s3Key: z
    .string()
    .trim()
    .min(1, 's3Key is required')
    .max(512, 's3Key must be at most 512 characters'),
  fileName: z
    .string()
    .trim()
    .min(1, 'fileName is required')
    .max(255, 'fileName must be at most 255 characters'),
});

// Draft variants for GET /bookings/:id/draft-url. 'original' = the pre-payment draft
// (draftS3Key); 'final' = the post-payment final draft (finalDraftS3Key). When omitted,
// the service returns the final draft if one exists, else the original.
export const DRAFT_VARIANTS = ['original', 'final'] as const;

export const draftUrlQuerySchema = z.object({
  variant: z.enum(DRAFT_VARIANTS).optional(),
});

// Path params for DELETE /bookings/:id/documents/:docId.
export const documentIdParamSchema = z.object({
  id: z.string().uuid('Invalid booking ID format'),
  docId: z.string().uuid('Invalid document ID format'),
});

export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;
export type DraftUrlQuery = z.infer<typeof draftUrlQuerySchema>;
export type DocumentIdParam = z.infer<typeof documentIdParamSchema>;
