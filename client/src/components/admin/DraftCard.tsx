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
  QUOTE_MIN_PAISE,
  QUOTE_MAX_PAISE,
} from '@/lib/shared-schemas/admin.schema';
import { formatBookingDate, formatInr } from '@/lib/constants/booking-status';
import type { BookingStatus, ServiceType } from '@/lib/api/types';

type DraftCardProps = {
  bookingId: string;
  status: BookingStatus;
  serviceType: ServiceType;
  hasDraft: boolean;
  quotedAmountPaise: number | null;
  updatedAt: string;
};

type UploadState =
  | { phase: 'idle' }
  | { phase: 'uploading'; fileName: string; percent: number }
  | { phase: 'done'; fileName: string; replaced: boolean };

// Draft card per resources/ui/Admin Booking Detail.html: dropzone (empty) →
// progress (uploading) → uploaded (+Replace) → locked once payment/filing begins.
// Flow: pre-signed PUT → S3 → draft-confirm (auto-transitions to draft_ready).
export function DraftCard({
  bookingId,
  status,
  serviceType,
  hasDraft,
  quotedAmountPaise,
  updatedAt,
}: DraftCardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ phase: 'idle' });
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const replacingRef = useRef(false);

  const isRepresentation = serviceType === 'representation';
  const [quoteRupees, setQuoteRupees] = useState<string>(
    quotedAmountPaise != null ? String(quotedAmountPaise / 100) : '',
  );

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

    // representation is consultation-priced — the admin must enter a valid fee quote
    // before the draft can be confirmed (the server enforces this too).
    let quotedAmountPaise: number | undefined;
    if (isRepresentation) {
      const paise = Math.round(Number(quoteRupees) * 100);
      if (!quoteRupees.trim() || Number.isNaN(paise) || paise < QUOTE_MIN_PAISE || paise > QUOTE_MAX_PAISE) {
        setFileError(
          `Enter a quoted fee between ${formatInr(QUOTE_MIN_PAISE)} and ${formatInr(QUOTE_MAX_PAISE)} before uploading.`,
        );
        return;
      }
      quotedAmountPaise = paise;
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
      await adminApi.confirmDraft(bookingId, { s3Key, fileName: file.name, quotedAmountPaise });
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

      {/* representation is consultation-priced — the fee is quoted per booking here */}
      {isRepresentation && !draftLocked && (
        <div className="quote-field" style={{ marginBottom: 14 }}>
          <label htmlFor="quotedFee" className="dz-title" style={{ display: 'block', marginBottom: 6 }}>
            Quoted fee (₹)
          </label>
          <input
            id="quotedFee"
            type="number"
            inputMode="numeric"
            min={QUOTE_MIN_PAISE / 100}
            max={QUOTE_MAX_PAISE / 100}
            step={1}
            className="input"
            placeholder="e.g. 7500"
            value={quoteRupees}
            onChange={(e) => setQuoteRupees(e.target.value)}
          />
          <p className="dz-sub" style={{ marginTop: 6 }}>
            The user pays this amount to unlock the draft. Between {formatInr(QUOTE_MIN_PAISE)} and{' '}
            {formatInr(QUOTE_MAX_PAISE)}.
          </p>
        </div>
      )}

      {isRepresentation && draftLocked && quotedAmountPaise != null && (
        <p className="df-sub" style={{ marginBottom: 14 }}>
          Quoted fee: <strong>{formatInr(quotedAmountPaise)}</strong>
        </p>
      )}

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
