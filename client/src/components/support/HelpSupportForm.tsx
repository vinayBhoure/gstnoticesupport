'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { supportSchema, type SupportFormData } from '@/lib/schemas/support.schema';

// Shared by both the user dashboard (/dashboard/help) and the admin surface
// (/admin/help) — same form, same /api/support route, same email flow the
// Contact page uses. Identity (name/email/mobile) is resolved server-side from
// the session cookie, so this form only ever collects title + message.
export function HelpSupportForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
  });

  async function onSubmit(data: SupportFormData) {
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.status === 429) {
        toast.error('You have sent too many messages. Please try again in a little while.');
        return;
      }
      if (!res.ok) throw new Error('send failed');
      reset();
      toast.success('Your message has been sent. Our team will contact you soon.');
    } catch {
      toast.error('Could not send your message. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Help and support form">
      <div className="form-row">
        <div className="lbl">
          <div className="ttl">Message title</div>
          <div className="desc">A short summary of what you need help with.</div>
        </div>
        <div className="fld">
          <input
            id="hs-title"
            type="text"
            className="input"
            placeholder="e.g. Unable to upload document"
            aria-describedby={errors.title ? 'err-hs-title' : undefined}
            {...register('title')}
          />
          {errors.title && (
            <span id="err-hs-title" className="text-sm text-[var(--warning-amber)]" role="alert">
              {errors.title.message}
            </span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="lbl">
          <div className="ttl">Message</div>
          <div className="desc">Describe your issue or question in detail.</div>
        </div>
        <div className="fld">
          <textarea
            id="hs-message"
            className="input"
            rows={6}
            style={{ resize: 'vertical', minHeight: 120 }}
            placeholder="Describe your issue or question…"
            aria-describedby={errors.message ? 'err-hs-message' : undefined}
            {...register('message')}
          />
          {errors.message && (
            <span id="err-hs-message" className="text-sm text-[var(--warning-amber)]" role="alert">
              {errors.message.message}
            </span>
          )}
        </div>
      </div>

      <div className="save-bar">
        <button
          type="submit"
          className="btn btn-primary"
          style={{ minHeight: 42 }}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Sending…' : 'Send Message'}
        </button>
      </div>
    </form>
  );
}
