import { apiClient } from './client';
import type { BookingDocumentDTO, UploadUrlResponse, DraftUrlResponse } from './types';
import type { UploadUrlInput, ConfirmUploadInput } from '@/lib/shared-schemas/document.schema';

// Booking-scoped document endpoints. apiClient unwraps the envelope's `data`;
// where the server nests an inner key we unwrap it here.
export const documentApi = {
  getUploadUrl: (bookingId: string, payload: UploadUrlInput): Promise<UploadUrlResponse> =>
    apiClient.post<UploadUrlResponse>(`/bookings/${bookingId}/upload-url`, payload),

  confirmUpload: (
    bookingId: string,
    payload: ConfirmUploadInput,
  ): Promise<BookingDocumentDTO> =>
    apiClient
      .post<{ document: BookingDocumentDTO }>(`/bookings/${bookingId}/confirm-upload`, payload)
      .then((r) => r.document),

  list: (bookingId: string, cookie?: string): Promise<BookingDocumentDTO[]> =>
    apiClient
      .get<{ documents: BookingDocumentDTO[] }>(`/bookings/${bookingId}/documents`, { cookie })
      .then((r) => r.documents),

  // variant: 'final' | 'original'. Omitted → server returns the final draft if one
  // exists, else the original.
  getDraftUrl: (
    bookingId: string,
    variant?: 'original' | 'final',
  ): Promise<DraftUrlResponse> =>
    apiClient.get<DraftUrlResponse>(
      `/bookings/${bookingId}/draft-url${variant ? `?variant=${variant}` : ''}`,
    ),
};

// Direct browser → S3 upload via the pre-signed PUT URL. This deliberately does
// NOT go through apiClient: S3 is not our API (no /api/v1 prefix, no cookies, no
// response envelope). The Content-Type must match what the URL was signed for.
export async function uploadToS3(
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`S3 upload failed (${res.status})`);
  }
}

// XHR variant with upload progress — fetch cannot report request-body progress.
// Used where the UI renders a per-file progress bar (Document Upload, admin draft).
export function uploadToS3WithProgress(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`S3 upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('S3 upload failed (network error)'));
    xhr.send(file);
  });
}
