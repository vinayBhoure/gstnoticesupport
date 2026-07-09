import { z } from 'zod';

// Path param for POST /payments/:bookingId/initiate
export const initiateParamsSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID format'),
});

// Query params for GET /payments/verify — the redirect from Razorpay (api_contract.md §5.2).
// Structural validation only; signature authenticity is verified in the service.
export const verifyQuerySchema = z.object({
  razorpay_payment_id: z.string().trim().min(1, 'razorpay_payment_id is required'),
  razorpay_order_id: z.string().trim().min(1, 'razorpay_order_id is required'),
  razorpay_signature: z.string().trim().min(1, 'razorpay_signature is required'),
  booking_id: z.string().uuid('Invalid booking ID format'),
});

export type InitiateParams = z.infer<typeof initiateParamsSchema>;
export type VerifyQuery = z.infer<typeof verifyQuerySchema>;
