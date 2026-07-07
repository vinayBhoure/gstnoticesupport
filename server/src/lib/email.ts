import { Resend } from 'resend';
import { env } from './env';
import { logger } from './logger';

const resend = new Resend(env.RESEND_API_KEY);

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  // Stable identifier for the notification (e.g. 'booking_created_admin').
  // Logged for delivery observability; never contains PII.
  event?: string;
};

export type SendEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: string };

export const emailService = {
  // Best-effort: a failed email must never break an auth flow. Callers may inspect
  // the result but are not required to. Never log recipient address, OTP, or body
  // content (RULES.md §4.1) — only the event name, subject, and Resend id/reason.
  async sendEmail({ to, subject, html, event }: SendEmailInput): Promise<SendEmailResult> {
    try {
      const { data, error } = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to,
        subject,
        html,
      });
      if (error) {
        logger.error({ event, subject, reason: error.name }, 'Email send returned an error');
        return { ok: false, reason: error.name };
      }
      logger.info({ event, resendId: data?.id ?? null }, 'Email sent');
      return { ok: true, id: data?.id ?? null };
    } catch (err) {
      logger.error({ err, event, subject }, 'Email transport threw');
      return { ok: false, reason: 'transport_error' };
    }
  },
};
