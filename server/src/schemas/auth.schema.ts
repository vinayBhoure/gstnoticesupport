import { z } from 'zod';

const emailField = z
  .string()
  .trim()
  .email('Invalid email format')
  .transform((v) => v.toLowerCase());

// Messages are surfaced verbatim by the live password checklist on signup/reset.
const passwordField = z
  .string()
  .min(8, 'Password must contain at least 8 characters')
  .regex(/[A-Z]/, 'Password must include one uppercase letter')
  .regex(/[a-z]/, 'Password must include one lowercase letter')
  .regex(/[0-9]/, 'Password must include one number')
  .regex(/[^A-Za-z0-9]/, 'Password must include one special character');

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

// `purpose` lets the reset screen re-request its own code without a second endpoint.
// Defaults to email_verification so existing signup clients keep working unchanged.
export const resendOtpSchema = z.object({
  userId: userIdField,
  purpose: z.enum(['email_verification', 'password_reset']).optional().default('email_verification'),
});

export const completeProfileSchema = z.object({
  name: nameField,
  phone: indianMobileField,
});

export const checkPhoneSchema = z.object({
  phone: indianMobileField,
});

// Login identifiers carry their own "required" message so a blank field reads as missing
// rather than malformed — the signup emailField would report "Invalid email format" for ''.
const loginEmailField = z
  .string()
  .trim()
  .min(1, 'Email/mobile number is required.')
  .email('Invalid email format')
  .transform((v) => v.toLowerCase());

const loginPhoneField = z
  .string()
  .trim()
  .min(1, 'Email/mobile number is required.')
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

// Login accepts exactly one of email or mobile number (toggle in the UI).
export const loginSchema = z
  .object({
    email: loginEmailField.optional(),
    phone: loginPhoneField.optional(),
    password: z.string().min(1, 'Password is required.'),
  })
  .superRefine((data, ctx) => {
    const provided = [data.email, data.phone].filter((v) => v !== undefined).length;
    if (provided !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide your email or mobile number',
        path: [data.phone !== undefined ? 'phone' : 'email'],
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    userId: userIdField,
    otp: otpField,
    newPassword: passwordField,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
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
