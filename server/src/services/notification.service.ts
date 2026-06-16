import { emailService } from '../lib/email';
import { env } from '../lib/env';
import * as templates from '../emails/templates';

// High-level, per-event email dispatch. Later phases reuse these methods.
export const notificationService = {
  async sendSignupOtp(to: string, data: { name: string; otp: string }): Promise<void> {
    const { subject, html } = templates.signupOtp(data);
    await emailService.sendEmail({ to, subject, html });
  },

  async sendPasswordResetOtp(
    to: string,
    data: { name: string; otp: string; userId: string },
  ): Promise<void> {
    const resetUrl = `${env.CLIENT_URL}/reset-password?uid=${encodeURIComponent(data.userId)}`;
    const { subject, html } = templates.passwordResetOtp({
      name: data.name,
      otp: data.otp,
      resetUrl,
    });
    await emailService.sendEmail({ to, subject, html });
  },

  // Login security alert — Pattern A: user (with invalidation link) + admin (informational).
  async sendLoginAlerts(
    user: { name: string; email: string },
    ctx: { ip: string; userAgent: string; jti: string },
  ): Promise<void> {
    const invalidateUrl = `${env.API_URL}/api/v1/auth/invalidate?ref=${encodeURIComponent(ctx.jti)}`;
    const userMail = templates.loginAlert({
      name: user.name,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      invalidateUrl,
    });
    const adminMail = templates.loginAlertAdmin({
      userEmail: user.email,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    await Promise.all([
      emailService.sendEmail({ to: user.email, ...userMail }),
      emailService.sendEmail({ to: env.ADMIN_EMAIL, ...adminMail }),
    ]);
  },

  async sendAccountCreatedAdmin(data: { userEmail: string; userId: string }): Promise<void> {
    const { subject, html } = templates.accountCreatedAdmin(data);
    await emailService.sendEmail({ to: env.ADMIN_EMAIL, subject, html });
  },
};
