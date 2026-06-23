import { z } from 'zod';
import { ServiceType, FilingFor } from '@prisma/client';

// Canonical Indian GSTIN format regex (format-only, no external API per LLD).
// Decision recorded in docs/tracking/decisions.md.
const GSTN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const createBookingSchema = z.object({
  serviceType: z.nativeEnum(ServiceType, {
    error: 'Invalid service type',
  }),
  contactName: z
    .string()
    .trim()
    .min(2, 'Contact name must be at least 2 characters')
    .max(100, 'Contact name must be at most 100 characters'),
  contactEmail: z
    .string()
    .trim()
    .email('Invalid email format')
    .transform((v) => v.toLowerCase()),
  contactPhone: z
    .string()
    .trim()
    .min(7, 'Phone number is too short')
    .max(20, 'Phone number is too long')
    .regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number format'),
  organizationName: z
    .string()
    .trim()
    .max(255, 'Organization name must be at most 255 characters')
    .optional()
    .nullable(),
  filingFor: z.nativeEnum(FilingFor, {
    error: 'filingFor must be "self" or "others"',
  }),
  gstn: z
    .string()
    .length(15, 'GSTN must be exactly 15 characters')
    .regex(GSTN_REGEX, 'Invalid GSTN format'),
  consentInformationAccurate: z.boolean().refine((v) => v === true, {
    message: 'You must confirm that the information is accurate',
  }),
  consentContactAuthorized: z.boolean().refine((v) => v === true, {
    message: 'You must confirm that you are authorized to initiate this service',
  }),
});

export const bookingIdParamSchema = z.object({
  id: z.string().uuid('Invalid booking ID format'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingIdParam = z.infer<typeof bookingIdParamSchema>;
