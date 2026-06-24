export type ApiEnvelope<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiListEnvelope<T> = {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
};

export type ApiResponse<T> = ApiEnvelope<T> | ApiError;

export type UserObject = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  termsAccepted: boolean;
  allowPromotions: boolean;
  interestedServices: string[];
  createdAt: string;
  updatedAt: string;
};

export type SignupResponseData = {
  userId: string;
};
