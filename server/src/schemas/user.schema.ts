import { z } from 'zod';

// User self-service account schemas (api_contract.md §2). Field validators mirror
// auth.schema.ts exactly — kept in lockstep so profile edits and signup share the
// same rules. Reused by the frontend via client/src/lib/shared-schemas (RULES.md §3.1).

const emailField = z
  .string()
  .trim()
  .email('Invalid email format')
  .transform((v) => v.toLowerCase());

const nameField = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters');

// Stored canonically as bare 10 digits; the UI shows a fixed +91 prefix.
const phoneField = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Email and interestedServices are never editable here (D67). At least one field
// must be present so an empty PATCH is rejected rather than silently no-op.
export const updateProfileSchema = z
  .object({
    name: nameField.optional(),
    phone: phoneField.optional(),
    allowPromotions: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined || data.phone !== undefined || data.allowPromotions !== undefined,
    { message: 'Provide at least one field to update' },
  );

// Account deletion confirmation — the user types their own email (D24: simple string
// match, no OTP/password/re-auth). emailField lowercases so the compare is case-insensitive.
export const deleteAccountSchema = z.object({
  confirmEmail: emailField,
});

export const paymentHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type PaymentHistoryQuery = z.infer<typeof paymentHistoryQuerySchema>;
