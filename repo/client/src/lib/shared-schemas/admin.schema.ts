// AUTO-GENERATED — DO NOT EDIT.
// Source of truth: server/src/schemas/admin.schema.ts (RULES.md §3.1/§3.2).
// Regenerate with: npm run sync:schemas

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

// Per-booking custom fee bounds (paise) for consultation-priced services
// (representation). The admin enters this at draft-confirm; the user pays it.
export const QUOTE_MIN_PAISE = 50_000; // ₹500
export const QUOTE_MAX_PAISE = 10_000_000; // ₹1,00,000

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Sortable columns for the admin bookings table (Admin Bookings prototype:
// Booking Date / Updated headers). Default preserves the original createdAt desc.
export const BOOKING_SORT_FIELDS = ['createdAt', 'updatedAt'] as const;
export const SORT_DIRECTIONS = ['asc', 'desc'] as const;

export const adminBookingListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
  status: z.enum(BOOKING_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  serviceType: z.enum(SERVICE_TYPES).optional(),
  // Case-insensitive contains on the owning user's name/email.
  search: z.string().trim().max(255).optional(),
  sortBy: z.enum(BOOKING_SORT_FIELDS).optional().default('createdAt'),
  sortDir: z.enum(SORT_DIRECTIONS).optional().default('desc'),
});

export const adminBookingIdParamsSchema = z.object({
  id: z.string().uuid('Invalid booking ID format'),
});

export const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
  search: z.string().trim().max(255).optional(),
});

export const adminUserIdParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export const adminDocumentParamsSchema = z.object({
  id: z.string().uuid('Invalid booking ID format'),
  documentId: z.string().uuid('Invalid document ID format'),
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
  // Required for representation bookings, rejected for others — the service enforces
  // that rule (it has the booking's serviceType); here we only bound the value.
  quotedAmountPaise: z
    .number()
    .int('quotedAmountPaise must be an integer')
    .min(QUOTE_MIN_PAISE, 'Quote must be at least ₹500')
    .max(QUOTE_MAX_PAISE, 'Quote must be at most ₹1,00,000')
    .optional(),
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
export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;
export type AdminUserIdParams = z.infer<typeof adminUserIdParamsSchema>;
export type AdminDocumentParams = z.infer<typeof adminDocumentParamsSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type DraftUploadUrlInput = z.infer<typeof draftUploadUrlSchema>;
export type DraftConfirmInput = z.infer<typeof draftConfirmSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type MarkPaidInput = z.infer<typeof markPaidSchema>;
