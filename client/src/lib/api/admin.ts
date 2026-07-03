import { apiClient, type PaginatedResult } from './client';
import type {
  AdminBookingListItemDTO,
  AdminBookingDetailDTO,
  AdminStatsDTO,
  AdminUserListItemDTO,
  AdminUserDetailDTO,
  DocumentDownloadResponse,
  UploadUrlResponse,
} from './types';
import type {
  UpdateStatusInput,
  DraftUploadUrlInput,
  DraftConfirmInput,
  UpdateNoteInput,
  MarkPaidInput,
} from '@/lib/shared-schemas/admin.schema';

type BookingResponse = { booking: AdminBookingDetailDTO };
type UserResponse = { user: AdminUserDetailDTO };

// Query params accepted by GET /admin/bookings and GET /admin/users. The synced
// adminBookingListQuerySchema is the validation source of truth server-side.
export type AdminBookingListParams = {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  serviceType?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortDir?: 'asc' | 'desc';
};

export type AdminUserListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// Admin surface API (server routes/admin.routes.ts — all authenticate + requireRole('admin')).
export const adminApi = {
  getStats: (cookie?: string): Promise<AdminStatsDTO> =>
    apiClient.get<AdminStatsDTO>('/admin/stats', { cookie }),

  listBookings: (
    params: AdminBookingListParams = {},
    cookie?: string,
  ): Promise<PaginatedResult<AdminBookingListItemDTO>> =>
    apiClient.getList<AdminBookingListItemDTO>(`/admin/bookings${toQueryString(params)}`, {
      cookie,
    }),

  getBooking: (id: string, cookie?: string): Promise<AdminBookingDetailDTO> =>
    apiClient
      .get<BookingResponse>(`/admin/bookings/${id}`, { cookie })
      .then((r) => r.booking),

  updateStatus: (id: string, payload: UpdateStatusInput): Promise<AdminBookingDetailDTO> =>
    apiClient
      .patch<BookingResponse>(`/admin/bookings/${id}/status`, payload)
      .then((r) => r.booking),

  getDraftUploadUrl: (id: string, payload: DraftUploadUrlInput): Promise<UploadUrlResponse> =>
    apiClient.post<UploadUrlResponse>(`/admin/bookings/${id}/draft-upload-url`, payload),

  confirmDraft: (id: string, payload: DraftConfirmInput): Promise<AdminBookingDetailDTO> =>
    apiClient
      .post<BookingResponse>(`/admin/bookings/${id}/draft-confirm`, payload)
      .then((r) => r.booking),

  updateNote: (id: string, payload: UpdateNoteInput): Promise<AdminBookingDetailDTO> =>
    apiClient
      .patch<BookingResponse>(`/admin/bookings/${id}/note`, payload)
      .then((r) => r.booking),

  markPaid: (id: string, payload: MarkPaidInput): Promise<AdminBookingDetailDTO> =>
    apiClient
      .post<BookingResponse>(`/admin/bookings/${id}/mark-paid`, payload)
      .then((r) => r.booking),

  getDocumentDownloadUrl: (
    bookingId: string,
    documentId: string,
  ): Promise<DocumentDownloadResponse> =>
    apiClient.get<DocumentDownloadResponse>(
      `/admin/bookings/${bookingId}/documents/${documentId}/download-url`,
    ),

  listUsers: (
    params: AdminUserListParams = {},
    cookie?: string,
  ): Promise<PaginatedResult<AdminUserListItemDTO>> =>
    apiClient.getList<AdminUserListItemDTO>(`/admin/users${toQueryString(params)}`, { cookie }),

  getUser: (id: string, cookie?: string): Promise<AdminUserDetailDTO> =>
    apiClient.get<UserResponse>(`/admin/users/${id}`, { cookie }).then((r) => r.user),

  deleteUser: (id: string): Promise<null> => apiClient.delete<null>(`/admin/users/${id}`),
};
