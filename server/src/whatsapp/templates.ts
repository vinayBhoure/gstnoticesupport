import { env } from '../lib/env';
import type { WhatsAppComponent } from '../lib/whatsapp';

// WhatsApp Cloud API template builders — one per notification event, mirroring
// server/src/emails/templates.ts. Unlike email, the message BODY is not authored
// here: it is a pre-approved template hosted in WhatsApp Manager, referenced by
// `templateName`. This module only supplies the runtime parameter values.
//
// The approved templates use POSITIONAL variables ({{1}}, {{2}}, ...) — WhatsApp
// Manager's dashboard composer only allows numbered variables, not named ones.
// Parameters are matched to placeholders purely by array order, so the key order of
// every object literal passed to tpl() below IS the {{1}}..{{n}} mapping and must
// stay in the exact order documented in docs/integrations/whatsapp-templates.md.
// Reordering keys in a builder would silently swap values inside the delivered
// message — never reorder without re-checking the approved template body.

export type WhatsAppTemplate = {
  templateName: string;
  languageCode: string;
  components?: WhatsAppComponent[];
};

// Build a single `body` component with POSITIONAL parameters: values are emitted in
// object-key insertion order, matching {{1}}, {{2}}, ... in the approved template.
// The descriptive keys exist only for call-site readability — they are never sent.
function body(params: Record<string, string>): WhatsAppComponent {
  return {
    type: 'body',
    parameters: Object.values(params).map((text) => ({
      type: 'text',
      text,
    })),
  };
}

function tpl(templateName: string, params: Record<string, string>): WhatsAppTemplate {
  return {
    templateName,
    languageCode: env.WHATSAPP_TEMPLATE_LANG,
    components: [body(params)],
  };
}

// Pre-deposit disclosure (KB2 §7) applies only to the two appeal services. A WhatsApp
// template body is fixed at approval time, so the disclosure cannot be a conditional
// block inside one template as it is in email — it needs a distinct approved template.
const PRE_DEPOSIT_SERVICE_TYPES: ReadonlySet<string> = new Set([
  'commissioner_appeal',
  'gstat_appeal',
]);

// ============================================================
// User-facing templates (sent to the account holder's phone)
// ============================================================

export function welcomeUser(d: { name: string }): WhatsAppTemplate {
  return tpl('welcome_user', { name: d.name });
}

export function loginAlertUser(d: { name: string }): WhatsAppTemplate {
  return tpl('login_alert_user', { name: d.name });
}

export function bookingCreatedUser(d: {
  name: string;
  service: string;
  bookingId: string;
  filedFor: string;
}): WhatsAppTemplate {
  return tpl('booking_created_user', {
    name: d.name,
    service: d.service,
    booking_id: d.bookingId,
    filed_for: d.filedFor,
  });
}

export function bookingCancelledUser(d: {
  name: string;
  service: string;
  bookingId: string;
}): WhatsAppTemplate {
  return tpl('booking_cancelled_user', {
    name: d.name,
    service: d.service,
    booking_id: d.bookingId,
  });
}

export function paymentConfirmedUser(d: {
  name: string;
  amount: string;
  service: string;
  bookingId: string;
  paymentId: string;
}): WhatsAppTemplate {
  return tpl('payment_confirmed_user', {
    name: d.name,
    amount: d.amount,
    service: d.service,
    booking_id: d.bookingId,
    payment_id: d.paymentId,
  });
}

export function statusInReviewUser(d: {
  name: string;
  service: string;
  bookingId: string;
}): WhatsAppTemplate {
  return tpl('status_in_review_user', {
    name: d.name,
    service: d.service,
    booking_id: d.bookingId,
  });
}

// draft ready / updated pick the pre-deposit template variant for appeal services.
export function draftReadyUser(d: {
  name: string;
  service: string;
  bookingId: string;
}): WhatsAppTemplate {
  const name = PRE_DEPOSIT_SERVICE_TYPES.has(d.service)
    ? 'draft_ready_predeposit_user'
    : 'draft_ready_user';
  return tpl(name, { name: d.name, service: d.service, booking_id: d.bookingId });
}

export function draftUpdatedUser(d: {
  name: string;
  service: string;
  bookingId: string;
}): WhatsAppTemplate {
  const name = PRE_DEPOSIT_SERVICE_TYPES.has(d.service)
    ? 'draft_updated_predeposit_user'
    : 'draft_updated_user';
  return tpl(name, { name: d.name, service: d.service, booking_id: d.bookingId });
}

export function finalDraftReadyUser(d: {
  name: string;
  service: string;
  bookingId: string;
}): WhatsAppTemplate {
  return tpl('final_draft_ready_user', {
    name: d.name,
    service: d.service,
    booking_id: d.bookingId,
  });
}

export function finalDraftUpdatedUser(d: {
  name: string;
  service: string;
  bookingId: string;
}): WhatsAppTemplate {
  return tpl('final_draft_updated_user', {
    name: d.name,
    service: d.service,
    booking_id: d.bookingId,
  });
}

export function statusCompleteUser(d: {
  name: string;
  service: string;
  bookingId: string;
}): WhatsAppTemplate {
  return tpl('status_complete_user', {
    name: d.name,
    service: d.service,
    booking_id: d.bookingId,
  });
}

export function accountDeletedUser(d: { name: string }): WhatsAppTemplate {
  return tpl('account_deleted_user', { name: d.name });
}

// ============================================================
// Admin-facing templates (sent to WHATSAPP_ADMIN_NUMBER)
// ============================================================

export function accountCreatedAdmin(d: { email: string }): WhatsAppTemplate {
  return tpl('account_created_admin', { email: d.email });
}

export function bookingCreatedAdmin(d: {
  service: string;
  bookingId: string;
  contact: string;
  gstn: string;
}): WhatsAppTemplate {
  return tpl('booking_created_admin', {
    service: d.service,
    booking_id: d.bookingId,
    contact: d.contact,
    gstn: d.gstn,
  });
}

export function bookingCancelledAdmin(d: {
  service: string;
  bookingId: string;
  contact: string;
}): WhatsAppTemplate {
  return tpl('booking_cancelled_admin', {
    service: d.service,
    booking_id: d.bookingId,
    contact: d.contact,
  });
}

export function documentsUploadedAdmin(d: {
  service: string;
  bookingId: string;
  contact: string;
}): WhatsAppTemplate {
  return tpl('documents_uploaded_admin', {
    service: d.service,
    booking_id: d.bookingId,
    contact: d.contact,
  });
}

export function paymentConfirmedAdmin(d: {
  service: string;
  bookingId: string;
  amount: string;
  contact: string;
}): WhatsAppTemplate {
  return tpl('payment_confirmed_admin', {
    service: d.service,
    booking_id: d.bookingId,
    amount: d.amount,
    contact: d.contact,
  });
}

export function paymentFailedAdmin(d: {
  service: string;
  bookingId: string;
  contact: string;
  phone: string;
}): WhatsAppTemplate {
  return tpl('payment_failed_admin', {
    service: d.service,
    booking_id: d.bookingId,
    contact: d.contact,
    phone: d.phone,
  });
}

export function statusCompleteAdmin(d: {
  service: string;
  bookingId: string;
  contact: string;
}): WhatsAppTemplate {
  return tpl('status_complete_admin', {
    service: d.service,
    booking_id: d.bookingId,
    contact: d.contact,
  });
}

export function accountDeletedAdmin(d: { email: string }): WhatsAppTemplate {
  return tpl('account_deleted_admin', { email: d.email });
}
