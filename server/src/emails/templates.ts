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

export function loginAlertAdmin(data: {
  userEmail: string;
  ip: string;
  userAgent: string;
}): EmailContent {
  return {
    subject: 'Account sign-in notification — GST Notice Support',
    html: layout(`
      <p>A user signed in:</p>
      <ul style="color:${MUTED};">
        <li>User: ${escapeHtml(data.userEmail)}</li>
        <li>IP address: ${escapeHtml(data.ip)}</li>
        <li>Device: ${escapeHtml(data.userAgent)}</li>
      </ul>
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
