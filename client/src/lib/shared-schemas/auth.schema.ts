// AUTO-GENERATED — DO NOT EDIT.
// Source of truth: server/src/schemas/auth.schema.ts (RULES.md §3.1/§3.2).
// Regenerate with: npm run sync:schemas

import { z } from 'zod';

const emailField = z
  .string()
  .trim()
  .email('Invalid email format')
  .transform((v) => v.toLowerCase());

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a digit')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

const nameField = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters');

// Stored canonically as bare 10 digits; the UI shows a fixed +91 prefix.
const indianMobileField = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

const otpField = z.string().regex(/^[0-9]{6}$/, 'OTP must be 6 digits');

const userIdField = z.string().uuid('Invalid user id');

export const signupSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  termsAccepted: z.boolean().refine((v) => v === true, {
    message: 'You must accept the terms to continue',
  }),
  allowPromotions: z.boolean().optional().default(false),
});

export const verifyOtpSchema = z.object({
  userId: userIdField,
  otp: otpField,
});

export const resendOtpSchema = z.object({
  userId: userIdField,
});

export const completeProfileSchema = z.object({
  name: nameField,
  phone: indianMobileField,
});

export const checkPhoneSchema = z.object({
  phone: indianMobileField,
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z.object({
  userId: userIdField,
  otp: otpField,
  newPassword: passwordField,
});

export const invalidateQuerySchema = z.object({
  ref: z.string().uuid('Invalid session reference format'),
});

// Authenticated password change (Admin Settings prototype; any signed-in user).
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordField,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type CheckPhoneInput = z.infer<typeof checkPhoneSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type InvalidateQuery = z.infer<typeof invalidateQuerySchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
