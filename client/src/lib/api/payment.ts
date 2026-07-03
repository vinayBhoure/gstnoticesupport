import { apiClient } from './client';
import type { InitiateOrderDTO, VerifyResultDTO } from './types';
import type { VerifyQuery } from '@/lib/shared-schemas/payment.schema';

// Payment endpoints (server routes/payment.routes.ts — all authenticate-gated).
export const paymentApi = {
  initiate: (bookingId: string): Promise<InitiateOrderDTO> =>
    apiClient.post<InitiateOrderDTO>(`/payments/${bookingId}/initiate`),

  verify: (query: VerifyQuery): Promise<VerifyResultDTO> =>
    apiClient.get<VerifyResultDTO>(`/payments/verify?${new URLSearchParams(query)}`),
};
