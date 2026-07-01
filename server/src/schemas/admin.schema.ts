import { z } from 'zod';
import { SERVICE_TYPES } from './booking.schema';

// Admin surface request schemas (api_contract.md §6). Structural validation only;
// business rules that map to specific error codes (INVALID_TRANSITION, DRAFT_LOCKED,
// FILE_TOO_LARGE, INVALID_FILE_TYPE) live in admin.service so the contract's exact
// codes are emitted instead of a generic VALIDATION_ERROR.

// Enum literals mirror prisma/schema.prisma. Kept in lockstep with the Prisma enums.
export const BOOKING_STATUSES = [
  'document_upload',
  'in_review',
  'draft_ready',
  'filing',
  'complete',
  'cancelled',
] as const;
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed'] as const;

// Admin may only drive these two manual transitions (HLD §11); the rest are
// system/user driven. The state machine still validates legality per current status.
export const ADMIN_TRANSITION_STATUSES = ['in_review', 'complete'] as const;

// Draft PDF upload limits (api_contract.md §6.4). Larger than user uploads (5 MB).
export const DRAFT_MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const DRAFT_ALLOWED_CONTENT_TYPE = 'application/pdf';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const adminBookingListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
  status: z.enum(BOOKING_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  serviceType: z.enum(SERVICE_TYPES).optional(),
});

export const adminBookingIdParamsSchema = z.object({
  id: z.string().uuid('Invalid booking ID format'),
});

export const updateStatusSchema = z.object({
  status: z.enum(ADMIN_TRANSITION_STATUSES, {
    error: 'status must be "in_review" or "complete"',
  }),
});

export const draftUploadUrlSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, 'fileName is required')
    .max(255, 'fileName must be at most 255 characters'),
  fileSize: z.number().int('fileSize must be an integer').positive('fileSize must be positive'),
  contentType: z.string().trim().min(1, 'contentType is required'),
});

export const draftConfirmSchema = z.object({
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

// Empty string clears the note (api_contract.md §6.6).
export const updateNoteSchema = z.object({
  note: z.string().max(5000, 'note must be at most 5000 characters'),
});

export const markPaidSchema = z.object({
  razorpayPaymentId: z.string().trim().min(1, 'razorpayPaymentId is required'),
});

export type AdminBookingListQuery = z.infer<typeof adminBookingListQuerySchema>;
export type AdminBookingIdParams = z.infer<typeof adminBookingIdParamsSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type DraftUploadUrlInput = z.infer<typeof draftUploadUrlSchema>;
export type DraftConfirmInput = z.infer<typeof draftConfirmSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type MarkPaidInput = z.infer<typeof markPaidSchema>;
