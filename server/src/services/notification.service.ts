import { emailService } from '../lib/email';
import { whatsappService } from '../lib/whatsapp';
import { toWhatsAppNumber } from '../lib/phone';
import { env, ADMIN_NOTIFICATION_EMAIL } from '../lib/env';
import * as templates from '../emails/templates';
import * as wa from '../whatsapp/templates';

// High-level, per-event notification dispatch. Each user-facing event sends an email
// AND (best-effort, in parallel) a WhatsApp template message. Both transports never
// throw — a failure in one never blocks the other, and neither ever blocks the caller.
//
// WhatsApp routing: user messages go to the account holder's phone (skipped when no
// phone is on file or the number can't be normalized — the email still goes out);
// admin messages go to WHATSAPP_ADMIN_NUMBER (skipped when unset). Every WhatsApp send
// is also a no-op until WHATSAPP_ENABLED='true' and the Cloud API creds are configured.

type Recipient = { name: string; email: string; phone: string | null };

// Resolved admin WhatsApp recipient (null when unset) — mirrors ADMIN_NOTIFICATION_EMAIL.
const ADMIN_WHATSAPP = toWhatsAppNumber(env.WHATSAPP_ADMIN_NUMBER);

// Paise → ₹ string for WhatsApp params (email templates format their own).
function formatRupees(amountPaise: number): string {
  return `₹${Math.round(amountPaise / 100).toLocaleString('en-IN')}`;
}

function waUser(phone: string | null, tpl: wa.WhatsAppTemplate, event: string) {
  return whatsappService.sendTemplate({ to: toWhatsAppNumber(phone), ...tpl, event });
}

function waAdmin(tpl: wa.WhatsAppTemplate, event: string) {
  return whatsappService.sendTemplate({ to: ADMIN_WHATSAPP, ...tpl, event });
}

export const notificationService = {
  // OTP emails are email-only: no phone number exists at signup, and one-time codes
  // stay on the channel the account is verified through (auth security).
  async sendSignupOtp(to: string, data: { name: string; otp: string }): Promise<void> {
    const { subject, html } = templates.signupOtp(data);
    await emailService.sendEmail({ to, subject, html, event: 'signup_otp' });
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
    await emailService.sendEmail({ to, subject, html, event: 'password_reset_otp' });
  },

  // Login security alert — user only (email + WhatsApp). Admin must not be notified on
  // login (notification matrix) — every sign-in would otherwise spam the admin.
  async sendLoginAlerts(
    user: { name: string; email: string; phone: string | null },
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
    await Promise.all([
      emailService.sendEmail({ to: user.email, ...userMail, event: 'login_alert_user' }),
      waUser(user.phone, wa.loginAlertUser({ name: user.name }), 'login_alert_user'),
    ]);
  },

  async sendAccountCreatedAdmin(data: { userEmail: string; userId: string }): Promise<void> {
    const { subject, html } = templates.accountCreatedAdmin(data);
    await Promise.all([
      emailService.sendEmail({ to: ADMIN_NOTIFICATION_EMAIL, subject, html, event: 'account_created_admin' }),
      waAdmin(wa.accountCreatedAdmin({ email: data.userEmail }), 'account_created_admin'),
    ]);
  },

  // ============================================================
  // Phase 3 — Booking lifecycle notifications (best-effort)
  // ============================================================

  // recipient = the account holder who booked (never the booking's own contact
  // email/name/phone — those describe who the case is filed for, informational only).
  async sendBookingCreated(
    recipient: Recipient,
    booking: {
      id: string;
      serviceType: string;
      contactName: string;
      contactEmail: string;
      organizationName?: string | null;
      gstn: string | null;
    },
  ): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/dashboard/bookings/${encodeURIComponent(booking.id)}`;
    const adminDashboardUrl = `${env.CLIENT_URL}/admin/bookings/${encodeURIComponent(booking.id)}`;

    const userMail = templates.bookingCreatedUser({
      name: recipient.name,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      organizationName: booking.organizationName,
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
      emailService.sendEmail({ to: recipient.email, ...userMail, event: 'booking_created_user' }),
      emailService.sendEmail({ to: ADMIN_NOTIFICATION_EMAIL, ...adminMail, event: 'booking_created_admin' }),
      waUser(
        recipient.phone,
        wa.bookingCreatedUser({
          name: recipient.name,
          service: booking.serviceType,
          bookingId: booking.id,
          filedFor: booking.contactName,
        }),
        'booking_created_user',
      ),
      waAdmin(
        wa.bookingCreatedAdmin({
          service: booking.serviceType,
          bookingId: booking.id,
          contact: booking.contactName,
          // GSTIN became optional (D104); WhatsApp template params must be non-empty
          // strings, so mirror the email template's fallback wording.
          gstn: booking.gstn ?? 'Not provided',
        }),
        'booking_created_admin',
      ),
    ]);
  },

  async sendBookingCancelled(
    recipient: Recipient,
    booking: {
      id: string;
      serviceType: string;
      contactName: string;
      contactEmail: string;
      organizationName?: string | null;
    },
  ): Promise<void> {
    const userMail = templates.bookingCancelledUser({
      name: recipient.name,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      organizationName: booking.organizationName,
    });
    const adminMail = templates.bookingCancelledAdmin({
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
    });

    await Promise.all([
      emailService.sendEmail({ to: recipient.email, ...userMail, event: 'booking_cancelled_user' }),
      emailService.sendEmail({ to: ADMIN_NOTIFICATION_EMAIL, ...adminMail, event: 'booking_cancelled_admin' }),
      waUser(
        recipient.phone,
        wa.bookingCancelledUser({
          name: recipient.name,
          service: booking.serviceType,
          bookingId: booking.id,
        }),
        'booking_cancelled_user',
      ),
      waAdmin(
        wa.bookingCancelledAdmin({
          service: booking.serviceType,
          bookingId: booking.id,
          contact: booking.contactName,
        }),
        'booking_cancelled_admin',
      ),
    ]);
  },

  // ============================================================
  // Document upload notifications (admin only, best-effort)
  // ============================================================

  // Fired once per booking, on the first confirmed document upload (document.service.ts).
  async sendDocumentsUploaded(booking: {
    id: string;
    serviceType: string;
    contactName: string;
    contactEmail: string;
  }): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/admin/bookings/${encodeURIComponent(booking.id)}`;
    const { subject, html } = templates.documentsUploadedAdmin({
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
      dashboardUrl,
    });
    await Promise.all([
      emailService.sendEmail({ to: ADMIN_NOTIFICATION_EMAIL, subject, html, event: 'documents_uploaded_admin' }),
      waAdmin(
        wa.documentsUploadedAdmin({
          service: booking.serviceType,
          bookingId: booking.id,
          contact: booking.contactName,
        }),
        'documents_uploaded_admin',
      ),
    ]);
  },

  // ============================================================
  // Phase 5 — Payment notifications (best-effort)
  // ============================================================

  // Payment confirmed — Pattern B: user + admin (notification matrix).
  async sendPaymentConfirmed(
    recipient: Recipient,
    booking: {
      id: string;
      serviceType: string;
      contactName: string;
      contactEmail: string;
      organizationName?: string | null;
      amountPaise: number;
      razorpayPaymentId: string;
      razorpayOrderId: string;
      paidAt: Date;
    },
  ): Promise<void> {
    const draftUrl = `${env.CLIENT_URL}/dashboard/bookings/${encodeURIComponent(booking.id)}/draft`;

    const userMail = templates.paymentConfirmedUser({
      name: recipient.name,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      organizationName: booking.organizationName,
      amountPaise: booking.amountPaise,
      draftUrl,
      razorpayPaymentId: booking.razorpayPaymentId,
      razorpayOrderId: booking.razorpayOrderId,
      paidAt: booking.paidAt,
    });
    const adminMail = templates.paymentConfirmedAdmin({
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
      amountPaise: booking.amountPaise,
      razorpayPaymentId: booking.razorpayPaymentId,
      razorpayOrderId: booking.razorpayOrderId,
      paidAt: booking.paidAt,
    });

    const amount = formatRupees(booking.amountPaise);
    await Promise.all([
      emailService.sendEmail({ to: recipient.email, ...userMail, event: 'payment_confirmed_user' }),
      emailService.sendEmail({ to: ADMIN_NOTIFICATION_EMAIL, ...adminMail, event: 'payment_confirmed_admin' }),
      waUser(
        recipient.phone,
        wa.paymentConfirmedUser({
          name: recipient.name,
          amount,
          service: booking.serviceType,
          bookingId: booking.id,
          paymentId: booking.razorpayPaymentId,
        }),
        'payment_confirmed_user',
      ),
      waAdmin(
        wa.paymentConfirmedAdmin({
          service: booking.serviceType,
          bookingId: booking.id,
          amount,
          contact: booking.contactName,
        }),
        'payment_confirmed_admin',
      ),
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
    await Promise.all([
      emailService.sendEmail({ to: ADMIN_NOTIFICATION_EMAIL, ...adminMail, event: 'payment_failed_admin' }),
      waAdmin(
        wa.paymentFailedAdmin({
          service: booking.serviceType,
          bookingId: booking.id,
          contact: booking.contactName,
          phone: booking.contactPhone,
        }),
        'payment_failed_admin',
      ),
    ]);
  },

  // ============================================================
  // Phase 6 — Admin case-management notifications (user only)
  // ============================================================

  async sendStatusInReview(
    recipient: Recipient,
    booking: { id: string; serviceType: string; contactName: string; organizationName?: string | null },
  ): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/dashboard/bookings/${encodeURIComponent(booking.id)}`;
    const { subject, html } = templates.statusInReviewUser({
      name: recipient.name,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      organizationName: booking.organizationName,
      dashboardUrl,
    });
    await Promise.all([
      emailService.sendEmail({ to: recipient.email, subject, html, event: 'status_in_review_user' }),
      waUser(
        recipient.phone,
        wa.statusInReviewUser({ name: recipient.name, service: booking.serviceType, bookingId: booking.id }),
        'status_in_review_user',
      ),
    ]);
  },

  // Draft Ready — mandatory pre-deposit disclosure touchpoint (KB2 §7). The email
  // template renders the disclosure inline; the WhatsApp builder selects the approved
  // pre-deposit template variant for commissioner_appeal / gstat_appeal.
  async sendDraftReady(
    recipient: Recipient,
    booking: { id: string; serviceType: string; contactName: string; organizationName?: string | null },
  ): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/dashboard/bookings/${encodeURIComponent(booking.id)}`;
    const { subject, html } = templates.draftReadyUser({
      name: recipient.name,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      organizationName: booking.organizationName,
      dashboardUrl,
    });
    await Promise.all([
      emailService.sendEmail({ to: recipient.email, subject, html, event: 'draft_ready_user' }),
      waUser(
        recipient.phone,
        wa.draftReadyUser({ name: recipient.name, service: booking.serviceType, bookingId: booking.id }),
        'draft_ready_user',
      ),
    ]);
  },

  async sendDraftUpdated(
    recipient: Recipient,
    booking: { id: string; serviceType: string; contactName: string; organizationName?: string | null },
  ): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/dashboard/bookings/${encodeURIComponent(booking.id)}`;
    const { subject, html } = templates.draftUpdatedUser({
      name: recipient.name,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      organizationName: booking.organizationName,
      dashboardUrl,
    });
    await Promise.all([
      emailService.sendEmail({ to: recipient.email, subject, html, event: 'draft_updated_user' }),
      waUser(
        recipient.phone,
        wa.draftUpdatedUser({ name: recipient.name, service: booking.serviceType, bookingId: booking.id }),
        'draft_updated_user',
      ),
    ]);
  },

  // Final (post-payment) draft — user only. Uploaded while the booking is in
  // filing/complete; delivered via the Draft Viewer's variant toggle.
  async sendFinalDraftReady(
    recipient: Recipient,
    booking: { id: string; serviceType: string; contactName: string; organizationName?: string | null },
  ): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/dashboard/bookings/${encodeURIComponent(booking.id)}/draft`;
    const { subject, html } = templates.finalDraftReadyUser({
      name: recipient.name,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      organizationName: booking.organizationName,
      dashboardUrl,
    });
    await Promise.all([
      emailService.sendEmail({ to: recipient.email, subject, html, event: 'final_draft_ready_user' }),
      waUser(
        recipient.phone,
        wa.finalDraftReadyUser({ name: recipient.name, service: booking.serviceType, bookingId: booking.id }),
        'final_draft_ready_user',
      ),
    ]);
  },

  async sendFinalDraftUpdated(
    recipient: Recipient,
    booking: { id: string; serviceType: string; contactName: string; organizationName?: string | null },
  ): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/dashboard/bookings/${encodeURIComponent(booking.id)}/draft`;
    const { subject, html } = templates.finalDraftUpdatedUser({
      name: recipient.name,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      organizationName: booking.organizationName,
      dashboardUrl,
    });
    await Promise.all([
      emailService.sendEmail({ to: recipient.email, subject, html, event: 'final_draft_updated_user' }),
      waUser(
        recipient.phone,
        wa.finalDraftUpdatedUser({ name: recipient.name, service: booking.serviceType, bookingId: booking.id }),
        'final_draft_updated_user',
      ),
    ]);
  },

  // Status: Complete — Pattern B: user + admin.
  async sendStatusComplete(
    recipient: Recipient,
    booking: {
      id: string;
      serviceType: string;
      contactName: string;
      contactEmail: string;
      organizationName?: string | null;
    },
  ): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/dashboard/bookings/${encodeURIComponent(booking.id)}`;
    const userMail = templates.statusCompleteUser({
      name: recipient.name,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      organizationName: booking.organizationName,
      dashboardUrl,
    });
    const adminMail = templates.statusCompleteAdmin({
      bookingId: booking.id,
      serviceType: booking.serviceType,
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
    });
    await Promise.all([
      emailService.sendEmail({ to: recipient.email, ...userMail, event: 'status_complete_user' }),
      emailService.sendEmail({ to: ADMIN_NOTIFICATION_EMAIL, ...adminMail, event: 'status_complete_admin' }),
      waUser(
        recipient.phone,
        wa.statusCompleteUser({ name: recipient.name, service: booking.serviceType, bookingId: booking.id }),
        'status_complete_user',
      ),
      waAdmin(
        wa.statusCompleteAdmin({
          service: booking.serviceType,
          bookingId: booking.id,
          contact: booking.contactName,
        }),
        'status_complete_admin',
      ),
    ]);
  },

  // ============================================================
  // Account lifecycle — welcome (post-verification) and deletion
  // ============================================================

  // Welcome EMAIL fires at OTP verification (auth.service.verifyOtp) — the account has
  // no phone yet at that point, so the WhatsApp welcome is a separate send fired from
  // complete-profile (see sendWelcomeWhatsApp), the moment a phone first exists.
  async sendWelcome(user: { name: string; email: string }): Promise<void> {
    const dashboardUrl = `${env.CLIENT_URL}/dashboard`;
    const { subject, html } = templates.welcomeUser({ name: user.name, dashboardUrl });
    await emailService.sendEmail({ to: user.email, subject, html, event: 'welcome_user' });
  },

  // WhatsApp welcome — fired from complete-profile once the account holder adds a phone.
  async sendWelcomeWhatsApp(user: { name: string; phone: string | null }): Promise<void> {
    await waUser(user.phone, wa.welcomeUser({ name: user.name }), 'welcome_user');
  },

  // Account deleted — Pattern B: user + admin (HLD §12.2).
  async sendAccountDeleted(user: {
    name: string;
    email: string;
    phone: string | null;
    userId: string;
  }): Promise<void> {
    const userMail = templates.accountDeletedUser({ name: user.name });
    const adminMail = templates.accountDeletedAdmin({ userEmail: user.email, userId: user.userId });
    await Promise.all([
      emailService.sendEmail({ to: user.email, ...userMail, event: 'account_deleted_user' }),
      emailService.sendEmail({ to: ADMIN_NOTIFICATION_EMAIL, ...adminMail, event: 'account_deleted_admin' }),
      waUser(user.phone, wa.accountDeletedUser({ name: user.name }), 'account_deleted_user'),
      waAdmin(wa.accountDeletedAdmin({ email: user.email }), 'account_deleted_admin'),
    ]);
  },
};
