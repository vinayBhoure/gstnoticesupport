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
    // Route through the frontend page (which proxies to the API) so the user sees
    // a friendly confirmation screen, never the raw JSON response.
    const invalidateUrl = `${env.CLIENT_URL}/auth/invalidate?ref=${encodeURIComponent(ctx.jti)}`;
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

  // ============================================================
  // Phase 5 — Payment notifications (best-effort)
  // ============================================================

  // Payment confirmed — Pattern B: user + admin (notification matrix).
  async sendPaymentConfirmed(booking: {
    id: string;
    serviceType: string;
    contactName: string;
    contactEmail: string;
    amountPaise: number;
  }): Promise<void> {
    const draftUrl = `${env.CLIENT_URL}/dashboard/bookings/${encodeURIComponent(booking.id)}/draft`;

    const userMail = templates.paymentConfirmedUser({
      name: booking.contactName,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      amountPaise: booking.amountPaise,
      draftUrl,
    });
    const adminMail = templates.paymentConfirmedAdmin({
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
      amountPaise: booking.amountPaise,
    });

    await Promise.all([
      emailService.sendEmail({ to: booking.contactEmail, ...userMail }),
      emailService.sendEmail({ to: env.ADMIN_EMAIL, ...adminMail }),
    ]);
  },

  // Failed payment attempt — admin only (notification matrix).
  async sendPaymentFailed(booking: {
    id: string;
    serviceType: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  }): Promise<void> {
    const adminMail = templates.paymentFailedAdmin({
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
      contactPhone: booking.contactPhone,
    });
    await emailService.sendEmail({ to: env.ADMIN_EMAIL, ...adminMail });
  },

  // ============================================================
  // Phase 6 — Admin case-management notifications (user only)
  // ============================================================

  async sendStatusInReview(booking: {
    id: string;
    serviceType: string;
    contactName: string;
    contactEmail: string;
  }): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/dashboard/bookings/${encodeURIComponent(booking.id)}`;
    const { subject, html } = templates.statusInReviewUser({
      name: booking.contactName,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      dashboardUrl,
    });
    await emailService.sendEmail({ to: booking.contactEmail, subject, html });
  },

  // Draft Ready — mandatory pre-deposit disclosure touchpoint (KB2 §7). The template
  // renders the disclosure for commissioner_appeal / gstat_appeal.
  async sendDraftReady(booking: {
    id: string;
    serviceType: string;
    contactName: string;
    contactEmail: string;
  }): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/dashboard/bookings/${encodeURIComponent(booking.id)}`;
    const { subject, html } = templates.draftReadyUser({
      name: booking.contactName,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      dashboardUrl,
    });
    await emailService.sendEmail({ to: booking.contactEmail, subject, html });
  },

  async sendDraftUpdated(booking: {
    id: string;
    serviceType: string;
    contactName: string;
    contactEmail: string;
  }): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/dashboard/bookings/${encodeURIComponent(booking.id)}`;
    const { subject, html } = templates.draftUpdatedUser({
      name: booking.contactName,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      dashboardUrl,
    });
    await emailService.sendEmail({ to: booking.contactEmail, subject, html });
  },

  // Status: Complete — Pattern B: user + admin.
  async sendStatusComplete(booking: {
    id: string;
    serviceType: string;
    contactName: string;
    contactEmail: string;
  }): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/dashboard/bookings/${encodeURIComponent(booking.id)}`;
    const userMail = templates.statusCompleteUser({
      name: booking.contactName,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      dashboardUrl,
    });
    const adminMail = templates.statusCompleteAdmin({
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

  // ============================================================
  // Account lifecycle — welcome (post-verification) and deletion
  // ============================================================

  async sendWelcome(user: { name: string; email: string }): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/dashboard`;
    const { subject, html } = templates.welcomeUser({ name: user.name, dashboardUrl });
    await emailService.sendEmail({ to: user.email, subject, html });
  },

  // Account deleted — Pattern B: user + admin (HLD §12.2).
  async sendAccountDeleted(user: { name: string; email: string; userId: string }): Promise<void> {
    const userMail = templates.accountDeletedUser({ name: user.name });
    const adminMail = templates.accountDeletedAdmin({ userEmail: user.email, userId: user.userId });
    await Promise.all([
      emailService.sendEmail({ to: user.email, ...userMail }),
      emailService.sendEmail({ to: env.ADMIN_EMAIL, ...adminMail }),
    ]);
  },
};
