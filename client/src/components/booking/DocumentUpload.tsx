'use client';

import { useRef, useState } from 'react';
import { Upload, File as FileIcon, CheckCircle, X, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_BOOKING,
  ALLOWED_CONTENT_TYPE,
} from '@/lib/shared-schemas/document.schema';
import { documentApi, uploadToS3 } from '@/lib/api/document';
import { getErrorMessage } from '@/lib/api/client';
import type { BookingDocumentDTO } from '@/lib/api/types';

type SessionUpload = {
  localId: string;
  fileName: string;
  status: 'uploading' | 'done' | 'error';
  error?: string;
};

type DocumentUploadProps = {
  bookingId: string;
  // Count of documents already confirmed on the server, for the file-limit math.
  // The authoritative document list is rendered by the parent, not here — this
  // component only shows uploads performed in the current session.
  usedCount: number;
  onUploaded?: (doc: BookingDocumentDTO) => void;
};

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Document upload flow (HLD §9.2): client-side validation → pre-signed PUT URL →
// direct browser→S3 PUT → confirm-upload. Files never pass through our API.
export function DocumentUpload({ bookingId, usedCount, onUploaded }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<SessionUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const confirmedCount = usedCount + uploads.filter((u) => u.status === 'done').length;
  const inFlightCount = uploads.filter((u) => u.status === 'uploading').length;
  const usedSlots = confirmedCount + inFlightCount;
  const isFull = usedSlots >= MAX_FILES_PER_BOOKING;

  async function uploadOne(file: File): Promise<void> {
    const localId = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setUploads((prev) => [...prev, { localId, fileName: file.name, status: 'uploading' }]);

    const fail = (message: string) => {
      setUploads((prev) =>
        prev.map((u) => (u.localId === localId ? { ...u, status: 'error', error: message } : u)),
      );
    };

    try {
      const { uploadUrl, s3Key } = await documentApi.getUploadUrl(bookingId, {
        fileName: file.name,
        fileSize: file.size,
        contentType: ALLOWED_CONTENT_TYPE,
      });
      await uploadToS3(uploadUrl, file, ALLOWED_CONTENT_TYPE);
      const doc = await documentApi.confirmUpload(bookingId, { s3Key, fileName: file.name });
      setUploads((prev) =>
        prev.map((u) => (u.localId === localId ? { ...u, status: 'done' } : u)),
      );
      onUploaded?.(doc);
    } catch (error) {
      const message = getErrorMessage(error);
      fail(message);
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
        toast.error(`${file.name}: only PDF files are allowed.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`${file.name}: exceeds the ${formatMb(MAX_FILE_SIZE_BYTES)} limit.`);
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

  return (
    <div className="flex flex-col gap-4">
      <div
        className={[
          'flex flex-col items-center justify-center gap-2 rounded-[var(--r-card)] border-2 border-dashed p-8 text-center transition-colors',
          isFull
            ? 'pointer-events-none border-[var(--neutral-200)] opacity-55'
            : isDragging
              ? 'border-[var(--accent-green)] bg-[var(--neutral-50)]'
              : 'border-[var(--neutral-200)] bg-white',
        ].join(' ')}
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
        <Upload
          size={28}
          className={isDragging ? 'text-[var(--accent-green)]' : 'text-[var(--neutral-600)]'}
          aria-hidden
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isFull}
          className="text-sm font-medium text-[var(--accent-green)] disabled:text-[var(--neutral-600)]"
        >
          Drag files here or click to upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      <p className="text-center text-sm text-[var(--neutral-600)]">
        PDF only · max {MAX_FILES_PER_BOOKING} files · {formatMb(MAX_FILE_SIZE_BYTES)} each · 40 MB
        total
      </p>

      <p className="flex items-center justify-center gap-1.5 text-sm text-[var(--neutral-600)]">
        <ShieldCheck size={16} className="text-[var(--accent-green)]" aria-hidden />
        Your documents are confidential and never shared.
      </p>

      {uploads.length > 0 && (
        <ul className="flex flex-col gap-2">
          {uploads.map((item) => (
            <li
              key={item.localId}
              className="flex items-center gap-3 rounded-[var(--r-btn)] border border-[var(--neutral-200)] p-3"
            >
              {item.status === 'uploading' && (
                <Loader2 size={18} className="shrink-0 animate-spin text-[var(--neutral-600)]" aria-hidden />
              )}
              {item.status === 'done' && (
                <CheckCircle size={18} className="shrink-0 text-[var(--accent-green)]" aria-hidden />
              )}
              {item.status === 'error' && (
                <FileIcon size={18} className="shrink-0 text-[var(--warning-amber)]" aria-hidden />
              )}
              <span className="flex-1 truncate text-sm text-[var(--neutral-900)]">
                {item.fileName}
                {item.status === 'error' && (
                  <span className="block text-xs text-[var(--warning-amber)]">{item.error}</span>
                )}
              </span>
              {item.status === 'error' && (
                <button
                  type="button"
                  onClick={() => dismiss(item.localId)}
                  aria-label={`Dismiss ${item.fileName}`}
                  className="shrink-0 text-[var(--neutral-600)] hover:text-[var(--neutral-900)]"
                >
                  <X size={18} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
