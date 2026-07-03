'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileText,
  CheckCircle,
  RefreshCw,
  Lock,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api/admin';
import { uploadToS3WithProgress } from '@/lib/api/document';
import { getErrorMessage } from '@/lib/api/client';
import {
  DRAFT_ALLOWED_CONTENT_TYPE,
  DRAFT_MAX_FILE_SIZE_BYTES,
} from '@/lib/shared-schemas/admin.schema';
import { formatBookingDate } from '@/lib/constants/booking-status';
import type { BookingStatus } from '@/lib/api/types';

type DraftCardProps = {
  bookingId: string;
  status: BookingStatus;
  hasDraft: boolean;
  updatedAt: string;
};

type UploadState =
  | { phase: 'idle' }
  | { phase: 'uploading'; fileName: string; percent: number }
  | { phase: 'done'; fileName: string; replaced: boolean };

// Draft card per resources/ui/Admin Booking Detail.html: dropzone (empty) →
// progress (uploading) → uploaded (+Replace) → locked once payment/filing begins.
// Flow: pre-signed PUT → S3 → draft-confirm (auto-transitions to draft_ready).
export function DraftCard({ bookingId, status, hasDraft, updatedAt }: DraftCardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ phase: 'idle' });
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const replacingRef = useRef(false);

  const draftLocked = status !== 'in_review' && status !== 'draft_ready';
  const showDraft = hasDraft || state.phase === 'done';

  async function upload(file: File): Promise<void> {
    setFileError(null);
    const wasReplace = replacingRef.current;
    replacingRef.current = false;

    if (file.type !== DRAFT_ALLOWED_CONTENT_TYPE && !file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Only PDF files are accepted. Please choose a single .pdf file.');
      return;
    }
    if (file.size > DRAFT_MAX_FILE_SIZE_BYTES) {
      setFileError('Draft must be 20 MB or smaller.');
      return;
    }

    setState({ phase: 'uploading', fileName: file.name, percent: 0 });
    try {
      const { uploadUrl, s3Key } = await adminApi.getDraftUploadUrl(bookingId, {
        fileName: file.name,
        fileSize: file.size,
        contentType: DRAFT_ALLOWED_CONTENT_TYPE,
      });
      await uploadToS3WithProgress(uploadUrl, file, DRAFT_ALLOWED_CONTENT_TYPE, (percent) =>
        setState({ phase: 'uploading', fileName: file.name, percent }),
      );
      await adminApi.confirmDraft(bookingId, { s3Key, fileName: file.name });
      setState({ phase: 'done', fileName: file.name, replaced: wasReplace });
      toast.success(
        wasReplace
          ? 'Updated draft uploaded — the user has been notified by email.'
          : 'Draft uploaded. Booking is now Draft Ready — the user has been notified.',
      );
      router.refresh();
    } catch (error) {
      setState({ phase: 'idle' });
      toast.error(getErrorMessage(error));
      router.refresh();
    }
  }

  function handleFiles(files: FileList | null): void {
    if (!files || files.length === 0) return;
    if (files.length > 1) {
      setFileError('Only PDF files are accepted. Please choose a single .pdf file.');
      return;
    }
    void upload(files[0]);
  }

  return (
    <section className="a-card" aria-labelledby="draftHeading">
      <h2 id="draftHeading">
        <FileText className="ic" aria-hidden /> Draft
      </h2>

      {/* empty: dropzone */}
      {!showDraft && !draftLocked && state.phase !== 'uploading' && (
        <div>
          <div
            className={`dropzone${isDragging ? ' dragover' : ''}`}
            role="button"
            tabIndex={0}
            aria-label="Upload prepared draft. PDF only, single file. Click to choose a file or drag and drop."
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
          >
            <Upload className="ic-up" aria-hidden />
            <span className="dz-title">Upload prepared draft (PDF)</span>
            <span className="dz-sub">Drag &amp; drop or click to choose · single file</span>
          </div>
          {fileError && (
            <div className="dz-error" role="alert">
              <AlertCircle className="ic" aria-hidden />
              <span>{fileError}</span>
            </div>
          )}
        </div>
      )}

      {/* draft missing but locked (e.g. document_upload) */}
      {!showDraft && draftLocked && (
        <div className="locked-reason">
          <Lock className="ic" aria-hidden />
          {status === 'document_upload'
            ? 'Set the booking to In Review before uploading a draft.'
            : 'A draft cannot be uploaded at this stage.'}
        </div>
      )}

      {/* uploading */}
      {state.phase === 'uploading' && (
        <div className="upload-progress" aria-live="polite">
          <div className="up-row">
            <FileText className="ic" aria-hidden />
            <span className="up-name">{state.fileName}</span>
            <span className="up-pct">{state.percent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${state.percent}%` }} />
          </div>
        </div>
      )}

      {/* uploaded */}
      {showDraft && state.phase !== 'uploading' && (
        <div>
          <div className="draft-file">
            <CheckCircle className="ic-ok" aria-hidden />
            <span className="df-meta">
              <span className="df-name">
                {state.phase === 'done' ? state.fileName : 'Prepared draft (PDF)'}
              </span>
              <span className="df-sub">Uploaded {formatBookingDate(updatedAt)}</span>
            </span>
          </div>
          {!draftLocked ? (
            <div className="replace-row">
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => {
                  replacingRef.current = true;
                  inputRef.current?.click();
                }}
              >
                <RefreshCw className="ic" aria-hidden /> Replace draft
              </button>
              <p className="replace-note">
                Replacing sends the user an &quot;updated draft&quot; email. Status stays
                unchanged.
              </p>
              {state.phase === 'done' && state.replaced && (
                <p className="replace-success">
                  <CheckCircle className="ic" aria-hidden />
                  Updated draft uploaded — the user has been notified by email.
                </p>
              )}
              {fileError && (
                <div className="dz-error" role="alert">
                  <AlertCircle className="ic" aria-hidden />
                  <span>{fileError}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="locked-reason">
              <Lock className="ic" aria-hidden />
              Draft is final once payment begins.
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <p className="trust-line">
        <ShieldCheck className="ic" aria-hidden />
        Drafts are confidential and encrypted — shared only with this client.
      </p>
    </section>
  );
}
