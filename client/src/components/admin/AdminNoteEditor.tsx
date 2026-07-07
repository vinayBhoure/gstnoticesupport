'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Check, AlertCircle } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { getErrorMessage } from '@/lib/api/client';

const MAX_NOTE_LENGTH = 5000; // updateNoteSchema (server) — prototype's 2000 superseded

type AdminNoteEditorProps = {
  bookingId: string;
  initialNote: string | null;
};

// Admin Note per resources/ui/Admin Booking Detail.html. Visible to the user on
// their service detail page ("Expert Summary"). Empty string clears the note.
export function AdminNoteEditor({ bookingId, initialNote }: AdminNoteEditorProps) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote ?? '');
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const mutation = useMutation({
    mutationFn: () => adminApi.updateNote(bookingId, { note }),
    onSuccess: () => {
      setStatus('saved');
      router.refresh();
    },
    onError: (error) => {
      setStatus('error');
      setErrorMessage(getErrorMessage(error));
    },
  });

  return (
    <div style={{ marginTop: 14 }}>
      <label className="field-label" htmlFor="adminNote">
        Note
      </label>
      <textarea
        id="adminNote"
        className="input"
        maxLength={MAX_NOTE_LENGTH}
        value={note}
        aria-describedby="noteCount"
        onChange={(e) => {
          setNote(e.target.value);
          setStatus('idle');
        }}
      />
      <div className="note-foot">
        <span className="char-count" id="noteCount" aria-live="polite">
          {note.length} / {MAX_NOTE_LENGTH}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
          <span
            className={`note-status${status === 'saved' ? ' ok' : status === 'error' ? ' err' : ''}`}
            aria-live="polite"
          >
            {status === 'saved' && (
              <>
                <Check className="ic" aria-hidden /> Saved
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle className="ic" aria-hidden /> {errorMessage}
              </>
            )}
          </span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving…' : 'Save note'}
          </button>
        </span>
      </div>
    </div>
  );
}
