import { apiClient, type PaginatedResult } from './client';
import type { UserObject, PaymentHistoryItemDTO } from './types';
import type {
  UpdateProfileInput,
  DeleteAccountInput,
  PaymentHistoryQuery,
} from '@/lib/shared-schemas/user.schema';

type UserResponse = { user: UserObject };

// User self-service account endpoints (server routes/user.routes.ts — authenticate-gated).
// Payload types are inferred from the shared server Zod schemas (RULES.md §3.2).
export const userApi = {
  paymentHistory: (
    query: Partial<PaymentHistoryQuery>,
    cookie?: string,
  ): Promise<PaginatedResult<PaymentHistoryItemDTO>> => {
    const params = new URLSearchParams();
    if (query.page !== undefined) params.set('page', String(query.page));
    if (query.limit !== undefined) params.set('limit', String(query.limit));
    const qs = params.toString();
    return apiClient.getList<PaymentHistoryItemDTO>(
      `/user/payment-history${qs ? `?${qs}` : ''}`,
      { cookie },
    );
  },

  updateProfile: (payload: UpdateProfileInput): Promise<UserObject> =>
    apiClient.patch<UserResponse>('/user/profile', payload).then((r) => r.user),

  deleteAccount: (payload: DeleteAccountInput): Promise<null> =>
    apiClient.delete<null>('/user', { body: payload }),
};
