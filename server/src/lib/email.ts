import { Resend } from 'resend';
import { env } from './env';
import { logger } from './logger';

const resend = new Resend(env.RESEND_API_KEY);

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export const emailService = {
  // Best-effort: a failed email must never break an auth flow.
  // Never log recipient address, OTP, or body content (RULES.md §4.1).
  async sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
    try {
      const { error } = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to,
        subject,
        html,
      });
      if (error) {
        logger.error({ subject, reason: error.name }, 'Email send returned an error');
      }
    } catch (err) {
      logger.error({ err, subject }, 'Email transport threw');
    }
  },
};
