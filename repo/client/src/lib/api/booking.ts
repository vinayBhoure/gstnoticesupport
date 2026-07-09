import { apiClient } from './client';
import type {
  BookingSummaryDTO,
  BookingDetailDTO,
  BookingDetailWithRelationsDTO,
} from './types';
import type { CreateBookingInput } from '@/lib/shared-schemas/booking.schema';

// Payload types are inferred from the shared server Zod schema
// (RULES.md §3.2 — never recreate schemas in the frontend).
// The server nests each resource under an inner key inside the envelope's
// `data`; apiClient unwraps `data`, so we unwrap the inner key here.
export const bookingApi = {
  create: (payload: CreateBookingInput): Promise<BookingDetailDTO> =>
    apiClient
      .post<{ booking: BookingDetailDTO }>('/bookings', payload)
      .then((r) => r.booking),

  list: (cookie?: string): Promise<BookingSummaryDTO[]> =>
    apiClient.get<BookingSummaryDTO[]>('/bookings', { cookie }),

  getById: (id: string, cookie?: string): Promise<BookingDetailWithRelationsDTO> =>
    apiClient
      .get<{ booking: BookingDetailWithRelationsDTO }>(`/bookings/${id}`, { cookie })
      .then((r) => r.booking),

  cancel: (id: string): Promise<BookingDetailDTO> =>
    apiClient
      .post<{ booking: BookingDetailDTO }>(`/bookings/${id}/cancel`)
      .then((r) => r.booking),
};
