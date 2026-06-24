import { apiClient } from './client';
import type { UserObject, SignupResponseData } from './types';

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
  allowPromotions?: boolean;
};

export type VerifyOtpPayload = {
  userId: string;
  otp: string;
};

export type ResendOtpPayload = {
  userId: string;
};

export type CompleteProfilePayload = {
  name: string;
  phone: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  userId: string;
  otp: string;
  newPassword: string;
};

type UserResponse = { user: UserObject };

export const authApi = {
  signup: (payload: SignupPayload): Promise<SignupResponseData> =>
    apiClient.post<SignupResponseData>('/auth/signup', payload),

  verifyOtp: (payload: VerifyOtpPayload): Promise<UserResponse> =>
    apiClient.post<UserResponse>('/auth/verify-otp', payload),

  resendOtp: (payload: ResendOtpPayload): Promise<void> =>
    apiClient.post<void>('/auth/resend-otp', payload),

  completeProfile: (payload: CompleteProfilePayload): Promise<UserResponse> =>
    apiClient.post<UserResponse>('/auth/complete-profile', payload),

  login: (payload: LoginPayload): Promise<UserResponse> =>
    apiClient.post<UserResponse>('/auth/login', payload),

  refresh: (): Promise<void> =>
    apiClient.post<void>('/auth/refresh'),

  logout: (): Promise<void> =>
    apiClient.post<void>('/auth/logout'),

  forgotPassword: (payload: ForgotPasswordPayload): Promise<void> =>
    apiClient.post<void>('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload): Promise<UserResponse> =>
    apiClient.post<UserResponse>('/auth/reset-password', payload),

  invalidate: (ref: string): Promise<void> =>
    apiClient.get<void>(`/auth/invalidate?ref=${encodeURIComponent(ref)}`),

  me: (cookie?: string): Promise<UserResponse> =>
    apiClient.get<UserResponse>('/auth/me', { cookie }),
};
