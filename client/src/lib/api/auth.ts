import { apiClient } from './client';
import type { UserObject, SignupResponseData, ResetPasswordResponseData } from './types';
import type {
  SignupInput,
  VerifyOtpInput,
  ResendOtpInput,
  CompleteProfileInput,
  CheckPhoneInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from '@/lib/shared-schemas/auth.schema';

type UserResponse = { user: UserObject };
type PhoneAvailability = { available: boolean };

// All payload types are inferred from the shared server Zod schemas
// (RULES.md §3.2 — never recreate schemas in the frontend).
export const authApi = {
  signup: (payload: SignupInput): Promise<SignupResponseData> =>
    apiClient.post<SignupResponseData>('/auth/signup', payload),

  verifyOtp: (payload: VerifyOtpInput): Promise<UserResponse> =>
    apiClient.post<UserResponse>('/auth/verify-otp', payload),

  resendOtp: (payload: ResendOtpInput): Promise<null> =>
    apiClient.post<null>('/auth/resend-otp', payload),

  completeProfile: (payload: CompleteProfileInput): Promise<UserResponse> =>
    apiClient.post<UserResponse>('/auth/complete-profile', payload),

  checkPhone: (payload: CheckPhoneInput): Promise<PhoneAvailability> =>
    apiClient.post<PhoneAvailability>('/auth/check-phone', payload),

  login: (payload: LoginInput): Promise<UserResponse> =>
    apiClient.post<UserResponse>('/auth/login', payload),

  refresh: (): Promise<null> => apiClient.post<null>('/auth/refresh'),

  logout: (): Promise<null> => apiClient.post<null>('/auth/logout'),

  forgotPassword: (payload: ForgotPasswordInput): Promise<null> =>
    apiClient.post<null>('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordInput): Promise<ResetPasswordResponseData> =>
    apiClient.post<ResetPasswordResponseData>('/auth/reset-password', payload),

  changePassword: (payload: ChangePasswordInput): Promise<null> =>
    apiClient.post<null>('/auth/change-password', payload),

  invalidate: (ref: string, cookie?: string): Promise<null> =>
    apiClient.get<null>(`/auth/invalidate?ref=${encodeURIComponent(ref)}`, { cookie }),

  me: (cookie?: string): Promise<UserResponse> =>
    apiClient.get<UserResponse>('/auth/me', { cookie }),
};
