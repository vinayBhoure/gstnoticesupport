'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileCheck2,
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

type FinalDraftCardProps = {
  bookingId: string;
  status: BookingStatus;
  hasFinalDraft: boolean;
  updatedAt: string;
};

type UploadState =
  | { phase: 'idle' }
  | { phase: 'uploading'; fileName: string; percent: number }
  | { phase: 'done'; fileName: string; replaced: boolean };

// Post-payment deliverable. Unlike DraftCard (which is locked once payment begins),
// this card is only ENABLED once payment has moved the booking into filing, and stays
// available through complete. Uploading here never changes the booking status and
// leaves the original pre-payment draft untouched.
export function FinalDraftCard({ bookingId, status, hasFinalDraft, updatedAt }: FinalDraftCardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ phase: 'idle' });
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const replacingRef = useRef(false);

  const uploadable = status === 'filing' || status === 'complete';
  const showDraft = hasFinalDraft || state.phase === 'done';

  async function upload(file: File): Promise<void> {
    setFileError(null);
    const wasReplace = replacingRef.current;
    replacingRef.current = false;

    if (file.type !== DRAFT_ALLOWED_CONTENT_TYPE && !file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Only PDF files are accepted. Please choose a single .pdf file.');
      return;
    }
    if (file.size > DRAFT_MAX_FILE_SIZE_BYTES) {
      setFileError('Final draft must be 20 MB or smaller.');
      return;
    }

    setState({ phase: 'uploading', fileName: file.name, percent: 0 });
    try {
      const { uploadUrl, s3Key } = await adminApi.getFinalDraftUploadUrl(bookingId, {
        fileName: file.name,
        fileSize: file.size,
        contentType: DRAFT_ALLOWED_CONTENT_TYPE,
      });
      await uploadToS3WithProgress(uploadUrl, file, DRAFT_ALLOWED_CONTENT_TYPE, (percent) =>
        setState({ phase: 'uploading', fileName: file.name, percent }),
      );
      await adminApi.confirmFinalDraft(bookingId, { s3Key, fileName: file.name });
      setState({ phase: 'done', fileName: file.name, replaced: wasReplace });
      toast.success(
        wasReplace
          ? 'Updated final draft uploaded — the user has been notified by email.'
          : 'Final draft uploaded — the user has been notified by email.',
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
    <section className="a-card" aria-labelledby="finalDraftHeading">
      <h2 id="finalDraftHeading">
        <FileCheck2 className="ic" aria-hidden /> Final Draft
      </h2>
      <p className="card-note">
        The final, post-payment document. Uploaded after the user has paid; the original
        draft stays available to them.
      </p>

      {/* empty + not yet payable: locked */}
      {!showDraft && !uploadable && (
        <div className="locked-reason">
          <Lock className="ic" aria-hidden />
          Available once the user completes payment.
        </div>
      )}

      {/* empty + payable: dropzone */}
      {!showDraft && uploadable && state.phase !== 'uploading' && (
        <div>
          <div
            className={`dropzone${isDragging ? ' dragover' : ''}`}
            role="button"
            tabIndex={0}
            aria-label="Upload final draft. PDF only, single file. Click to choose a file or drag and drop."
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
            <span className="dz-title">Upload final draft (PDF)</span>
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

      {/* uploading */}
      {state.phase === 'uploading' && (
        <div className="upload-progress" aria-live="polite">
          <div className="up-row">
            <FileCheck2 className="ic" aria-hidden />
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
                {state.phase === 'done' ? state.fileName : 'Final draft (PDF)'}
              </span>
              <span className="df-sub">Uploaded {formatBookingDate(updatedAt)}</span>
            </span>
          </div>
          {uploadable ? (
            <div className="replace-row">
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => {
                  replacingRef.current = true;
                  inputRef.current?.click();
                }}
              >
                <RefreshCw className="ic" aria-hidden /> Replace final draft
              </button>
              <p className="replace-note">
                Replacing sends the user an &quot;updated final draft&quot; email.
              </p>
              {state.phase === 'done' && state.replaced && (
                <p className="replace-success">
                  <CheckCircle className="ic" aria-hidden />
                  Updated final draft uploaded — the user has been notified by email.
                </p>
              )}
              {fileError && (
                <div className="dz-error" role="alert">
                  <AlertCircle className="ic" aria-hidden />
                  <span>{fileError}</span>
                </div>
              )}
            </div>
          ) : null}
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
        Final drafts are confidential and encrypted — shared only with this client.
      </p>
    </section>
  );
}
