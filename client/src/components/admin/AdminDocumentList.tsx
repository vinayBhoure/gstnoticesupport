'use client';

import { useState } from 'react';
import { FileText, FolderOpen, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api/admin';
import { getErrorMessage } from '@/lib/api/client';
import { formatBookingDate } from '@/lib/constants/booking-status';
import { triggerFileDownload } from '@/lib/download';
import type { BookingDocumentDTO } from '@/lib/api/types';

type AdminDocumentListProps = {
  bookingId: string;
  documents: BookingDocumentDTO[];
};

// Document rows per resources/ui/Admin Booking Detail.html → .doc-row. Download
// fetches a fresh pre-signed GET URL per click (never stored).
export function AdminDocumentList({ bookingId, documents }: AdminDocumentListProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function download(doc: BookingDocumentDTO) {
    setPendingId(doc.id);
    try {
      const { downloadUrl } = await adminApi.getDocumentDownloadUrl(bookingId, doc.id);
      triggerFileDownload(downloadUrl);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPendingId(null);
    }
  }

  if (documents.length === 0) {
    return (
      <div className="doc-empty">
        <FolderOpen className="ic" aria-hidden />
        No documents uploaded.
      </div>
    );
  }

  return (
    <div className="adoc-list">
      {documents.map((doc) => (
        <div key={doc.id} className="doc-row">
          <FileText className="ic-file" aria-hidden />
          <span className="doc-meta">
            <span className="doc-name">{doc.fileName}</span>
            <span className="doc-sub">
              {formatBookingDate(doc.uploadedAt)}{' '}
              <span className="doc-tag">{doc.uploadedBy === 'user' ? 'User' : 'Admin'}</span>
            </span>
          </span>
          <button
            type="button"
            className="doc-dl"
            aria-label={`Download ${doc.fileName}`}
            disabled={pendingId === doc.id}
            onClick={() => download(doc)}
          >
            {pendingId === doc.id ? (
              <>
                <Loader2 className="ic animate-spin" aria-hidden /> Preparing…
              </>
            ) : (
              <>
                <Download className="ic" aria-hidden /> Download
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
