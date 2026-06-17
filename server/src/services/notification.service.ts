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

  // ============================================================
  // Phase 3 — Booking lifecycle notifications (best-effort)
  // ============================================================

  async sendBookingCreated(booking: {
    id: string;
    serviceType: string;
    contactName: string;
    contactEmail: string;
    gstn: string;
  }): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/dashboard/bookings/${encodeURIComponent(booking.id)}`;
    const adminDashboardUrl = `${env.CLIENT_URL}/admin/bookings/${encodeURIComponent(booking.id)}`;

    const userMail = templates.bookingCreatedUser({
      name: booking.contactName,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      dashboardUrl,
    });
    const adminMail = templates.bookingCreatedAdmin({
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
      gstn: booking.gstn,
      dashboardUrl: adminDashboardUrl,
    });

    await Promise.all([
      emailService.sendEmail({ to: booking.contactEmail, ...userMail }),
      emailService.sendEmail({ to: env.ADMIN_EMAIL, ...adminMail }),
    ]);
  },

  async sendBookingCancelled(booking: {
    id: string;
    serviceType: string;
    contactName: string;
    contactEmail: string;
  }): Promise<void> {
    const userMail = templates.bookingCancelledUser({
      name: booking.contactName,
      bookingId: booking.id,
      serviceType: booking.serviceType,
    });
    const adminMail = templates.bookingCancelledAdmin({
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
    });

    await Promise.all([
      emailService.sendEmail({ to: booking.contactEmail, ...userMail }),
      emailService.sendEmail({ to: env.ADMIN_EMAIL, ...adminMail }),
    ]);
  },
};
