'use client';

import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { UploadCloud, FileText, Check, AlertCircle, X, Lock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_BOOKING,
  ALLOWED_CONTENT_TYPE,
} from '@/lib/shared-schemas/document.schema';
import { documentApi, uploadToS3WithProgress } from '@/lib/api/document';
import { getErrorMessage } from '@/lib/api/client';
import { DeleteDocumentDialog } from './DeleteDocumentDialog';
import type { BookingDocumentDTO } from '@/lib/api/types';

type SessionUpload = {
  localId: string;
  fileName: string;
  size: number;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
  // Set once confirm-upload succeeds — the real BookingDocument id, needed to
  // delete this upload (issue #3) rather than just dismissing it locally.
  documentId?: string;
};

type DocumentUploadProps = {
  bookingId: string;
  // Count of documents already confirmed on the server, for the file-limit math.
  // The authoritative document list is rendered by the parent, not here — this
  // component only shows uploads performed in the current session.
  usedCount: number;
  onUploaded?: (doc: BookingDocumentDTO) => void;
  // Called after a confirmed upload is deleted from this session's list, so a
  // parent tracking its own count (BookingActionPanel, NewBookingWizard) stays in sync.
  onDeleted?: (documentId: string) => void;
};

// Prototype byte formatting: B / KB / MB (resources/ui/Booking Step 3).
export function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Document upload flow (HLD §9.2): client-side validation → pre-signed PUT URL →
// direct browser→S3 PUT → confirm-upload. Files never pass through our API.
// Upload-confirmation icon animation is one of the three allowed motion spots
// (design.md §5.2) — CSS transitions on .file-icon-wrap.
export function DocumentUpload({ bookingId, usedCount, onUploaded, onDeleted }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<SessionUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SessionUpload | null>(null);

  const confirmedCount = usedCount + uploads.filter((u) => u.status === 'done').length;
  const inFlightCount = uploads.filter((u) => u.status === 'uploading').length;
  const usedSlots = confirmedCount + inFlightCount;
  const isFull = usedSlots >= MAX_FILES_PER_BOOKING;

  function patchUpload(localId: string, patch: Partial<SessionUpload>): void {
    setUploads((prev) => prev.map((u) => (u.localId === localId ? { ...u, ...patch } : u)));
  }

  async function uploadOne(file: File): Promise<void> {
    const localId = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setUploads((prev) => [
      ...prev,
      { localId, fileName: file.name, size: file.size, progress: 0, status: 'uploading' },
    ]);

    try {
      const { uploadUrl, s3Key } = await documentApi.getUploadUrl(bookingId, {
        fileName: file.name,
        fileSize: file.size,
        contentType: ALLOWED_CONTENT_TYPE,
      });
      await uploadToS3WithProgress(uploadUrl, file, ALLOWED_CONTENT_TYPE, (percent) =>
        patchUpload(localId, { progress: percent }),
      );
      const doc = await documentApi.confirmUpload(bookingId, { s3Key, fileName: file.name });
      patchUpload(localId, { status: 'done', progress: 100, documentId: doc.id });
      onUploaded?.(doc);
    } catch (error) {
      const message = getErrorMessage(error);
      patchUpload(localId, { status: 'error', error: message });
      toast.error(message);
    }
  }

  function handleFiles(fileList: FileList | null): void {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    let remaining = MAX_FILES_PER_BOOKING - usedSlots;

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

  function dismiss(localId: string): void {
    setUploads((prev) => prev.filter((u) => u.localId !== localId));
  }

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => documentApi.remove(bookingId, documentId),
    onSuccess: () => {
      if (pendingDelete) {
        dismiss(pendingDelete.localId);
        if (pendingDelete.documentId) onDeleted?.(pendingDelete.documentId);
      }
      setPendingDelete(null);
      toast.success('Document deleted.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      setPendingDelete(null);
    },
  });

  return (
    <div role="region" aria-label="Document upload">
      <div
        className={[
          'drop-zone',
          isDragging ? 'is-dragover' : '',
          isFull ? 'is-maxed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="button"
        tabIndex={isFull ? -1 : 0}
        aria-label="Upload documents — drag and drop or activate to browse"
        aria-describedby="upload-constraints"
        onClick={() => {
          if (!isFull) inputRef.current?.click();
        }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isFull) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isFull) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!isFull) handleFiles(e.dataTransfer.files);
        }}
      >
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
        <div className="drop-zone__icon">
          <UploadCloud size={40} strokeWidth={1.4} aria-hidden />
        </div>
        <p className="drop-zone__label">Drag and drop your PDFs here</p>
        <p className="drop-zone__sub">
          or <span>click to browse files</span>
        </p>
      </div>

      <div className="upload-constraints" id="upload-constraints" aria-live="polite">
        <span>PDF only</span>
        <span className="dot">●</span>
        <span>Max {MAX_FILES_PER_BOOKING} files</span>
        <span className="dot">●</span>
        <span>{fmtSize(MAX_FILE_SIZE_BYTES)} per file</span>
        <span className="dot">●</span>
        <span>40 MB total</span>
      </div>

      {isFull && (
        <div className="over-limit-msg" role="alert" aria-live="polite">
          <AlertCircle size={14} strokeWidth={1.5} aria-hidden />
          Maximum {MAX_FILES_PER_BOOKING} files reached.
        </div>
      )}

      <p className="upload-privacy">
        <Lock size={14} strokeWidth={1.5} aria-hidden />
        Your documents are confidential and never shared.
      </p>

      {uploads.length > 0 && (
        <ul className="file-list" aria-label="Uploaded files" aria-live="polite">
          {uploads.map((item) => (
            <li
              key={item.localId}
              className="file-item"
              aria-label={`${item.fileName}${
                item.status === 'done'
                  ? ', uploaded successfully'
                  : item.status === 'error'
                    ? `, error: ${item.error}`
                    : ', uploading'
              }`}
            >
              <div className="file-item__top">
                <div
                  className={[
                    'file-icon-wrap',
                    item.status === 'done' ? 'is-success' : '',
                    item.status === 'error' ? 'is-error' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="fi-file">
                    <FileText size={18} strokeWidth={1.5} aria-hidden />
                  </span>
                  <span className="fi-check">
                    <Check size={18} strokeWidth={2.2} aria-hidden />
                  </span>
                  <span className="fi-error">
                    <AlertCircle size={18} strokeWidth={2} aria-hidden />
                  </span>
                </div>
                <div className="file-info">
                  <div className="file-name">{item.fileName}</div>
                  <div className={`file-meta${item.status === 'error' ? ' is-error' : ''}`}>
                    {item.status === 'error'
                      ? item.error
                      : item.status === 'done'
                        ? `${fmtSize(item.size)} · Uploaded`
                        : fmtSize(item.size)}
                  </div>
                </div>
                {item.status === 'error' && (
                  <button
                    type="button"
                    className="file-delete"
                    onClick={() => dismiss(item.localId)}
                    aria-label={`Remove ${item.fileName}`}
                  >
                    <X size={16} strokeWidth={1.8} aria-hidden />
                  </button>
                )}
                {item.status === 'done' && (
                  <button
                    type="button"
                    className="doc-delete"
                    onClick={() => setPendingDelete(item)}
                    aria-label={`Delete ${item.fileName}`}
                  >
                    <Trash2 size={16} strokeWidth={1.8} aria-hidden />
                  </button>
                )}
              </div>
              <div className={`file-progress-wrap${item.status !== 'uploading' ? ' is-hidden' : ''}`}>
                <div
                  className="file-progress-bar"
                  role="progressbar"
                  aria-valuenow={item.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <DeleteDocumentDialog
        open={pendingDelete !== null}
        fileName={pendingDelete?.fileName ?? ''}
        isPending={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete?.documentId) deleteMutation.mutate(pendingDelete.documentId);
        }}
      />
    </div>
  );
}
