// Mirrors the backend response envelope (server/src/utils/envelope.ts) and the
// error shape from server/src/middleware/errorHandler.ts. Keep in sync — these
// are the wire contract, not recreated business types.

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

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
};

export type ApiResponse<T> = ApiEnvelope<T> | ApiErrorBody;

// Mirrors server/src/dto/user.dto.ts → UserDTO (phone is nullable until complete-profile).
export type UserObject = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
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
