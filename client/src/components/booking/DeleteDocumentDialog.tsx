'use client';

import { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

type DeleteDocumentDialogProps = {
  open: boolean;
  fileName: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

// Delete-document confirmation (issue #3) — shares the .dialog-scrim/.dialog
// pattern with DeleteUserCard. No typed confirmation: unlike deleting a user,
// a removed document can simply be re-uploaded, so the risk tier matches
// CancelBookingButton's simple confirm/cancel (amber .btn-danger), not the
// higher-friction type-to-confirm used for account deletion.
export function DeleteDocumentDialog({
  open,
  fileName,
  isPending,
  onCancel,
  onConfirm,
}: DeleteDocumentDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => confirmRef.current?.focus(), 30);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div
      className={`dialog-scrim${open ? ' open' : ''}`}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPending) onCancel();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !isPending) {
          e.stopPropagation();
          onCancel();
        }
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal
        aria-labelledby="delDocTitle"
        aria-describedby="delDocBody"
      >
        <h2 id="delDocTitle">Delete this document?</h2>
        <p className="d-body" id="delDocBody">
          Are you sure you want to delete this document? This action cannot be undone.
        </p>

        <div className="d-meta">
          <span className="d-meta-label">File</span>
          <span className="d-meta-val">{fileName}</span>
        </div>

        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isPending}>
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isPending}
          >
            <Trash2 className="ic" aria-hidden />
            {isPending ? 'Deleting…' : 'Delete document'}
          </button>
        </div>
      </div>
    </div>
  );
}
