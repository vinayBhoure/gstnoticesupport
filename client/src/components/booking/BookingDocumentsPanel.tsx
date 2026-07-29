'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { FileText, Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentApi, uploadToS3WithProgress } from '@/lib/api/document';
import { getErrorMessage } from '@/lib/api/client';
import { formatBookingDate } from '@/lib/constants/booking-status';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_BOOKING,
  ALLOWED_CONTENT_TYPE,
} from '@/lib/shared-schemas/document.schema';
import { fmtSize } from './DocumentUpload';
import { DeleteDocumentDialog } from './DeleteDocumentDialog';
import type { BookingDocumentDTO } from '@/lib/api/types';

type PendingUpload = {
  localId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'error';
  error?: string;
};

type BookingDocumentsPanelProps = {
  bookingId: string;
  initialDocuments: BookingDocumentDTO[];
  // Documents can only be added/removed while the booking still accepts
  // uploads (HLD §19: no mid-service re-upload once review has started).
  canManage: boolean;
};

// Uploaded Documents card on the booking detail page (issues #3, #9). The
// Add Document button is the only upload entry point — no drag-and-drop, no
// separate upload-session card. A file in flight renders as a row in this
// same list; once confirmed it becomes a normal row here, never duplicated.
export function BookingDocumentsPanel({
  bookingId,
  initialDocuments,
  canManage,
}: BookingDocumentsPanelProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState(initialDocuments);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [pendingDelete, setPendingDelete] = useState<BookingDocumentDTO | null>(null);

  const inFlightCount = pendingUploads.filter((u) => u.status === 'uploading').length;
  const isFull = documents.length + inFlightCount >= MAX_FILES_PER_BOOKING;

  function patchPending(localId: string, patch: Partial<PendingUpload>): void {
    setPendingUploads((prev) => prev.map((u) => (u.localId === localId ? { ...u, ...patch } : u)));
  }

  function dismissPending(localId: string): void {
    setPendingUploads((prev) => prev.filter((u) => u.localId !== localId));
  }

  async function uploadOne(file: File): Promise<void> {
    const localId = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setPendingUploads((prev) => [...prev, { localId, fileName: file.name, progress: 0, status: 'uploading' }]);

    try {
      const { uploadUrl, s3Key } = await documentApi.getUploadUrl(bookingId, {
        fileName: file.name,
        fileSize: file.size,
        contentType: ALLOWED_CONTENT_TYPE,
      });
      await uploadToS3WithProgress(uploadUrl, file, ALLOWED_CONTENT_TYPE, (percent) =>
        patchPending(localId, { progress: percent }),
      );
      const doc = await documentApi.confirmUpload(bookingId, { s3Key, fileName: file.name });
      dismissPending(localId);
      setDocuments((prev) => [...prev, doc]);
      router.refresh();
    } catch (error) {
      const message = getErrorMessage(error);
      patchPending(localId, { status: 'error', error: message });
      toast.error(message);
    }
  }

  function handleFiles(fileList: FileList | null): void {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    let remaining = MAX_FILES_PER_BOOKING - (documents.length + inFlightCount);

    for (const file of files) {
      const isPdf = file.type === ALLOWED_CONTENT_TYPE || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        toast.error(`${file.name}: only PDF files are accepted.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`${file.name}: exceeds the ${fmtSize(MAX_FILE_SIZE_BYTES)} limit.`);
        continue;
      }
      if (remaining <= 0) {
        toast.error(`You can upload at most ${MAX_FILES_PER_BOOKING} documents.`);
        break;
      }
      remaining -= 1;
      void uploadOne(file);
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => documentApi.remove(bookingId, documentId),
    onSuccess: (_, documentId) => {
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
      setPendingDelete(null);
      toast.success('Document deleted.');
      router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      setPendingDelete(null);
    },
  });

  const isEmpty = documents.length === 0 && pendingUploads.length === 0;

  return (
    <div className="detail-card">
      <div className="flex items-center justify-between gap-3 mb-[18px]">
        <h2 style={{ marginBottom: 0 }}>Uploaded Documents</h2>
        {canManage && !isFull && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              className="hidden"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <button type="button" className="btn-tertiary" onClick={() => inputRef.current?.click()}>
              <Plus size={15} strokeWidth={2} aria-hidden />
              Add Document
            </button>
          </>
        )}
      </div>

      {isEmpty ? (
        <p className="text-sm text-[var(--neutral-600)]">No documents uploaded yet.</p>
      ) : (
        <ul className="doc-list" aria-label="Uploaded documents">
          {documents.map((doc) => (
            <li key={doc.id} className="doc-item">
              <FileText className="ic" aria-hidden />
              <span className="name">{doc.fileName}</span>
              <span className="size">{formatBookingDate(doc.uploadedAt)}</span>
              {canManage && (
                <button
                  type="button"
                  className="doc-delete"
                  aria-label={`Delete ${doc.fileName}`}
                  onClick={() => setPendingDelete(doc)}
                >
                  <Trash2 size={16} strokeWidth={1.8} aria-hidden />
                </button>
              )}
            </li>
          ))}
          {pendingUploads.map((item) => (
            <li
              key={item.localId}
              className="doc-item"
              aria-label={`${item.fileName}, ${item.status === 'error' ? `error: ${item.error}` : `uploading, ${item.progress}%`}`}
            >
              <FileText className="ic" aria-hidden />
              <span className="name">{item.fileName}</span>
              <span className="size">
                {item.status === 'error' ? item.error : `Uploading… ${item.progress}%`}
              </span>
              {item.status === 'error' && (
                <button
                  type="button"
                  className="doc-delete"
                  aria-label={`Dismiss ${item.fileName}`}
                  onClick={() => dismissPending(item.localId)}
                >
                  <X size={16} strokeWidth={1.8} aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="conf-note">
        <ShieldCheck className="ic" aria-hidden />
        Documents are confidential and never shared.
      </p>

      <DeleteDocumentDialog
        open={pendingDelete !== null}
        fileName={pendingDelete?.fileName ?? ''}
        isPending={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
        }}
      />
    </div>
  );
}
