// Auth email templates. Brand: navy + green, trust-first, no urgency language.
// Phase 7 audits the full matrix and polishes these; this is the functional baseline.
// Emails require inline styles, so brand colours are inlined here (not CSS tokens).

const NAVY = '#0A2540';
const GREEN = '#16A34A';
const MUTED = '#5B6B7B';
const BORDER = '#E4E9EE';

export type EmailContent = { subject: string; html: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout(bodyHtml: string): string {
  return `
  <div style="background:#F4F6F8;padding:32px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
      <div style="background:${NAVY};padding:20px 28px;">
        <span style="color:#FFFFFF;font-size:18px;font-weight:bold;">GST Notice Support</span>
      </div>
      <div style="padding:28px;color:${NAVY};font-size:15px;line-height:1.6;">
        ${bodyHtml}
      </div>
      <div style="padding:18px 28px;border-top:1px solid ${BORDER};color:${MUTED};font-size:12px;line-height:1.5;">
        gstnoticesupport.in — GST litigation support for Indian businesses.<br/>
        This is an automated message. Please do not reply to this email.
      </div>
    </div>
  </div>`;
}

function otpBlock(otp: string): string {
  return `<div style="margin:24px 0;padding:16px;background:#F4F6F8;border:1px dashed ${BORDER};border-radius:8px;text-align:center;">
    <span style="font-size:30px;font-weight:bold;letter-spacing:8px;color:${NAVY};">${escapeHtml(otp)}</span>
  </div>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 22px;background:${GREEN};color:#FFFFFF;text-decoration:none;border-radius:6px;font-weight:bold;">${escapeHtml(label)}</a>`;
}

// Paise → ₹ formatted with Indian grouping, e.g. 299900 → "₹2,999".
function formatRupees(amountPaise: number): string {
  const rupees = Math.round(amountPaise / 100);
  return `₹${rupees.toLocaleString('en-IN')}`;
}

// IST date/time for the payment receipt, e.g. "17 Jul 2026, 3:42 pm IST".
function formatReceiptDate(date: Date): string {
  const formatted = date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${formatted} IST`;
}

// User-facing lifecycle emails go to the account holder, who may be booking on
// behalf of a client — these rows identify which booking the email is about
// (contactName/organizationName are the booking's own case details, informational
// only, never the recipient). GSTN is intentionally omitted here.
function clientInfoRows(contactName: string, organizationName?: string | null): string {
  const orgRow = organizationName
    ? `<li>Organization: ${escapeHtml(organizationName)}</li>`
    : '';
  return `<li>Filed for: ${escapeHtml(contactName)}</li>${orgRow}`;
}

export function signupOtp(data: { name: string; otp: string }): EmailContent {
  return {
    subject: 'Verify your email — GST Notice Support',
    html: layout(`
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>Use the verification code below to confirm your email address. It is valid for 10 minutes.</p>
      ${otpBlock(data.otp)}
      <p style="color:${MUTED};">If you did not create an account, you can safely ignore this email.</p>
    `),
  };
}

export function passwordResetOtp(data: { name: string; otp: string; resetUrl: string }): EmailContent {
  return {
    subject: 'Reset your password — GST Notice Support',
    html: layout(`
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>We received a request to reset your password. Use the code below — valid for 10 minutes — to set a new one.</p>
      ${otpBlock(data.otp)}
      <p style="margin:24px 0;">${button(data.resetUrl, 'Reset password')}</p>
      <p style="color:${MUTED};">If you did not request this, no action is needed — your password remains unchanged.</p>
    `),
  };
}

export function loginAlert(data: {
  name: string;
  ip: string;
  userAgent: string;
  invalidateUrl: string;
}): EmailContent {
  return {
    subject: 'New sign-in to your account — GST Notice Support',
    html: layout(`
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>A new sign-in to your account was just detected:</p>
      <ul style="color:${MUTED};">
        <li>IP address: ${escapeHtml(data.ip)}</li>
        <li>Device: ${escapeHtml(data.userAgent)}</li>
      </ul>
      <p>If this was you, no action is needed.</p>
      <p style="margin:24px 0;">${button(data.invalidateUrl, "This wasn't me")}</p>
      <p style="color:${MUTED};">The button above will sign that session out immediately.</p>
    `),
  };
}

export function accountCreatedAdmin(data: { userEmail: string; userId: string }): EmailContent {
  return {
    subject: 'New account created — GST Notice Support',
    html: layout(`
      <p>A new account was created:</p>
      <ul style="color:${MUTED};">
        <li>Email: ${escapeHtml(data.userEmail)}</li>
        <li>User ID: ${escapeHtml(data.userId)}</li>
      </ul>
    `),
  };
}

// ============================================================
// Phase 3 — Booking lifecycle templates
// ============================================================

export function bookingCreatedUser(data: {
  name: string;
  bookingId: string;
  serviceType: string;
  contactName: string;
  organizationName?: string | null;
  dashboardUrl: string;
}): EmailContent {
  return {
    subject: 'Booking confirmed — GST Notice Support',
    html: layout(`
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>Your booking has been received. Please upload your supporting documents so our team can start reviewing your case.</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        ${clientInfoRows(data.contactName, data.organizationName)}
      </ul>
      <p style="margin:24px 0;">${button(data.dashboardUrl, 'Upload documents')}</p>
      <p style="color:${MUTED};">You will receive a notification once our team has reviewed your submission.</p>
    `),
  };
}

export function bookingCreatedAdmin(data: {
  bookingId: string;
  serviceType: string;
  contactName: string;
  contactEmail: string;
  gstn: string;
  dashboardUrl: string;
}): EmailContent {
  return {
    subject: `New booking — ${escapeHtml(data.serviceType)} — GST Notice Support`,
    html: layout(`
      <p>A new booking has been submitted:</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        <li>Contact: ${escapeHtml(data.contactName)} (${escapeHtml(data.contactEmail)})</li>
        <li>GSTN: ${escapeHtml(data.gstn)}</li>
      </ul>
      <p style="margin:24px 0;">${button(data.dashboardUrl, 'View in admin panel')}</p>
    `),
  };
}

export function bookingCancelledUser(data: {
  name: string;
  bookingId: string;
  serviceType: string;
  contactName: string;
  organizationName?: string | null;
}): EmailContent {
  return {
    subject: 'Booking cancelled — GST Notice Support',
    html: layout(`
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>Your booking has been cancelled as requested.</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        ${clientInfoRows(data.contactName, data.organizationName)}
      </ul>
      <p>If you need further assistance, please contact us via WhatsApp or create a new booking.</p>
    `),
  };
}

export function bookingCancelledAdmin(data: {
  bookingId: string;
  serviceType: string;
  contactName: string;
  contactEmail: string;
}): EmailContent {
  return {
    subject: `Booking cancelled — ${escapeHtml(data.serviceType)} — GST Notice Support`,
    html: layout(`
      <p>A booking has been cancelled by the user:</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        <li>Contact: ${escapeHtml(data.contactName)} (${escapeHtml(data.contactEmail)})</li>
      </ul>
    `),
  };
}

// ============================================================
// Document upload notifications (admin only)
// ============================================================

// Fired once per booking, on the user's first confirmed document upload — not on
// every file — so the admin gets a single "ready to review" signal instead of up
// to 8 emails per booking.
export function documentsUploadedAdmin(data: {
  bookingId: string;
  serviceType: string;
  contactName: string;
  contactEmail: string;
  dashboardUrl: string;
}): EmailContent {
  return {
    subject: `Documents uploaded — ${escapeHtml(data.serviceType)} — GST Notice Support`,
    html: layout(`
      <p>A user has started uploading documents for their booking:</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        <li>Contact: ${escapeHtml(data.contactName)} (${escapeHtml(data.contactEmail)})</li>
      </ul>
      <p style="margin:24px 0;">${button(data.dashboardUrl, 'View in admin panel')}</p>
    `),
  };
}

// ============================================================
// Phase 5 — Payment notifications
// ============================================================

export function paymentConfirmedUser(data: {
  name: string;
  bookingId: string;
  serviceType: string;
  contactName: string;
  organizationName?: string | null;
  amountPaise: number;
  draftUrl: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  paidAt: Date;
}): EmailContent {
  return {
    subject: 'Payment confirmed — your draft is now available',
    html: layout(`
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>We have received your payment of <strong>${escapeHtml(formatRupees(data.amountPaise))}</strong>. Your draft is now unlocked and ready to view.</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        ${clientInfoRows(data.contactName, data.organizationName)}
      </ul>
      <p style="margin:20px 0 8px;font-weight:bold;">Payment receipt</p>
      <ul style="color:${MUTED};">
        <li>Payment ID: ${escapeHtml(data.razorpayPaymentId)}</li>
        <li>Order ID: ${escapeHtml(data.razorpayOrderId)}</li>
        <li>Amount: ${escapeHtml(formatRupees(data.amountPaise))}</li>
        <li>Date: ${escapeHtml(formatReceiptDate(data.paidAt))}</li>
      </ul>
      <p style="margin:24px 0;">${button(data.draftUrl, 'View your draft')}</p>
      <p style="color:${MUTED};">Our team will proceed with the filing stage and keep you updated.</p>
    `),
  };
}

export function paymentConfirmedAdmin(data: {
  bookingId: string;
  serviceType: string;
  contactName: string;
  contactEmail: string;
  amountPaise: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  paidAt: Date;
}): EmailContent {
  return {
    subject: `Payment received — ${escapeHtml(data.serviceType)} — GST Notice Support`,
    html: layout(`
      <p>A payment has been confirmed and the booking has moved to the filing stage:</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        <li>Amount: ${escapeHtml(formatRupees(data.amountPaise))}</li>
        <li>Contact: ${escapeHtml(data.contactName)} (${escapeHtml(data.contactEmail)})</li>
        <li>Payment ID: ${escapeHtml(data.razorpayPaymentId)}</li>
        <li>Order ID: ${escapeHtml(data.razorpayOrderId)}</li>
        <li>Date: ${escapeHtml(formatReceiptDate(data.paidAt))}</li>
      </ul>
    `),
  };
}

export function paymentFailedAdmin(data: {
  bookingId: string;
  serviceType: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}): EmailContent {
  return {
    subject: `Payment attempt failed — ${escapeHtml(data.serviceType)} — GST Notice Support`,
    html: layout(`
      <p>A payment attempt failed. The booking remains at draft stage and the user can retry.</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        <li>Contact: ${escapeHtml(data.contactName)} (${escapeHtml(data.contactEmail)})</li>
        <li>Phone: ${escapeHtml(data.contactPhone)}</li>
      </ul>
      <p style="color:${MUTED};">Consider following up via WhatsApp or email if the user needs assistance.</p>
    `),
  };
}

// ============================================================
// Phase 6 — Admin case-management notifications (user-facing)
// ============================================================

// Statutory pre-deposit disclosure — mandatory Draft Ready touchpoint (KB2 §7,
// frontend.md §8.3). Copy mirrors client PreDepositNotice.tsx exactly.
const PRE_DEPOSIT_SERVICE_TYPES: ReadonlySet<string> = new Set([
  'commissioner_appeal',
  'gstat_appeal',
]);

function preDepositBlock(serviceType: string): string {
  if (!PRE_DEPOSIT_SERVICE_TYPES.has(serviceType)) return '';
  return `<div style="margin:20px 0;padding:14px 16px;background:#FFFBEB;border-left:3px solid #D97706;border-radius:6px;">
    <p style="margin:0;color:${NAVY};font-size:14px;">A pre-deposit as per GST Act is required before this service is filed. Our team will advise the exact amount.</p>
  </div>`;
}

export function statusInReviewUser(data: {
  name: string;
  bookingId: string;
  serviceType: string;
  contactName: string;
  organizationName?: string | null;
  dashboardUrl: string;
}): EmailContent {
  return {
    subject: 'Your case is now under review — GST Notice Support',
    html: layout(`
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>Our team has started reviewing your case. We will prepare your draft and notify you the moment it is ready.</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        ${clientInfoRows(data.contactName, data.organizationName)}
      </ul>
      <p style="margin:24px 0;">${button(data.dashboardUrl, 'View booking')}</p>
    `),
  };
}

export function draftReadyUser(data: {
  name: string;
  bookingId: string;
  serviceType: string;
  contactName: string;
  organizationName?: string | null;
  dashboardUrl: string;
}): EmailContent {
  return {
    subject: 'Your draft is ready — GST Notice Support',
    html: layout(`
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>Your draft has been prepared and is ready. Complete the payment to unlock and view the full document.</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        ${clientInfoRows(data.contactName, data.organizationName)}
      </ul>
      ${preDepositBlock(data.serviceType)}
      <p style="margin:24px 0;">${button(data.dashboardUrl, 'Review & pay to unlock')}</p>
    `),
  };
}

export function draftUpdatedUser(data: {
  name: string;
  bookingId: string;
  serviceType: string;
  contactName: string;
  organizationName?: string | null;
  dashboardUrl: string;
}): EmailContent {
  return {
    subject: 'Your draft has been updated — GST Notice Support',
    html: layout(`
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>Our team has updated your draft. Complete the payment to unlock and view the latest version.</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        ${clientInfoRows(data.contactName, data.organizationName)}
      </ul>
      ${preDepositBlock(data.serviceType)}
      <p style="margin:24px 0;">${button(data.dashboardUrl, 'Review & pay to unlock')}</p>
    `),
  };
}

export function finalDraftReadyUser(data: {
  name: string;
  bookingId: string;
  serviceType: string;
  contactName: string;
  organizationName?: string | null;
  dashboardUrl: string;
}): EmailContent {
  return {
    subject: 'Your final draft is available — GST Notice Support',
    html: layout(`
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>Your final draft has been prepared and is now available in your dashboard. You can view and download it any time.</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        ${clientInfoRows(data.contactName, data.organizationName)}
      </ul>
      <p style="margin:24px 0;">${button(data.dashboardUrl, 'View final draft')}</p>
    `),
  };
}

export function finalDraftUpdatedUser(data: {
  name: string;
  bookingId: string;
  serviceType: string;
  contactName: string;
  organizationName?: string | null;
  dashboardUrl: string;
}): EmailContent {
  return {
    subject: 'Your final draft has been updated — GST Notice Support',
    html: layout(`
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>Our team has updated your final draft. You can view and download the latest version in your dashboard.</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        ${clientInfoRows(data.contactName, data.organizationName)}
      </ul>
      <p style="margin:24px 0;">${button(data.dashboardUrl, 'View final draft')}</p>
    `),
  };
}

export function statusCompleteUser(data: {
  name: string;
  bookingId: string;
  serviceType: string;
  contactName: string;
  organizationName?: string | null;
  dashboardUrl: string;
}): EmailContent {
  return {
    subject: 'Your filing is complete — GST Notice Support',
    html: layout(`
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>Your filing is now complete. Thank you for trusting GST Notice Support with your case.</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        ${clientInfoRows(data.contactName, data.organizationName)}
      </ul>
      <p style="margin:24px 0;">${button(data.dashboardUrl, 'View booking')}</p>
    `),
  };
}

export function statusCompleteAdmin(data: {
  bookingId: string;
  serviceType: string;
  contactName: string;
  contactEmail: string;
}): EmailContent {
  return {
    subject: `Filing complete — ${escapeHtml(data.serviceType)} — GST Notice Support`,
    html: layout(`
      <p>A booking has been marked complete:</p>
      <ul style="color:${MUTED};">
        <li>Booking ID: ${escapeHtml(data.bookingId)}</li>
        <li>Service: ${escapeHtml(data.serviceType)}</li>
        <li>Contact: ${escapeHtml(data.contactName)} (${escapeHtml(data.contactEmail)})</li>
      </ul>
    `),
  };
}

// ============================================================
// Account lifecycle — welcome (post-verification) and deletion
// ============================================================

export function welcomeUser(data: { name: string; dashboardUrl: string }): EmailContent {
  return {
    subject: 'Welcome to GST Notice Support',
    html: layout(`
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>Your email is verified and your account is ready. You can now book a service, upload documents, and track your case from your dashboard.</p>
      <p style="margin:24px 0;">${button(data.dashboardUrl, 'Go to dashboard')}</p>
    `),
  };
}

export function accountDeletedUser(data: { name: string }): EmailContent {
  return {
    subject: 'Your account has been closed — GST Notice Support',
    html: layout(`
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>Your account has been closed as requested. Your booking and payment records are retained as required by law, but your profile is no longer active.</p>
      <p style="color:${MUTED};">If this wasn't you, please contact us immediately via WhatsApp or email.</p>
    `),
  };
}

export function accountDeletedAdmin(data: { userEmail: string; userId: string }): EmailContent {
  return {
    subject: 'Account closed — GST Notice Support',
    html: layout(`
      <p>A user account was closed:</p>
      <ul style="color:${MUTED};">
        <li>Email: ${escapeHtml(data.userEmail)}</li>
        <li>User ID: ${escapeHtml(data.userId)}</li>
      </ul>
    `),
  };
}
