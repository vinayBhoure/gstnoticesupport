import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from './env';
import { logger } from './logger';

// WhatsApp Cloud API transport (Meta Graph API). Mirrors lib/email.ts: best-effort,
// never throws, and logs only the event name + returned message id — never the
// recipient number, template parameters, or payload (RULES.md §4.1 — no PII in logs).
//
// Only template messages are sent: every platform notification is business-initiated
// (outside any 24-hour customer service window), and Meta permits only pre-approved
// templates there. Template bodies live in WhatsApp Manager; we supply the name,
// language, and runtime parameter `components` here.

// Meta template `components` array (header/body/button parameter objects). Shapes are
// defined by the Cloud API; we pass them through as authored in whatsapp/templates.ts.
export type WhatsAppComponent = Record<string, unknown>;

export type SendTemplateInput = {
  // Normalized recipient (+<cc><number>) or null. A null recipient is skipped, not an
  // error — e.g. a user with no phone on file still gets the email.
  to: string | null;
  templateName: string;
  languageCode: string;
  components?: WhatsAppComponent[];
  // Stable event identifier for delivery observability (e.g. 'booking_created_user').
  event?: string;
};

export type SendWhatsAppResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: string };

function isConfigured(): boolean {
  return Boolean(env.WHATSAPP_PHONE_NUMBER_ID && env.WHATSAPP_ACCESS_TOKEN);
}

export const whatsappService = {
  async sendTemplate({
    to,
    templateName,
    languageCode,
    components,
    event,
  }: SendTemplateInput): Promise<SendWhatsAppResult> {
    // Dark until explicitly enabled — the feature ships deployed but inert.
    if (!env.WHATSAPP_ENABLED) return { ok: false, reason: 'disabled' };
    if (!isConfigured()) {
      logger.warn({ event }, 'WhatsApp enabled but not configured — skipping send');
      return { ok: false, reason: 'not_configured' };
    }
    if (!to) return { ok: false, reason: 'no_recipient' };

    const url = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(components && components.length > 0 ? { components } : {}),
      },
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        // Meta returns an error object; log only its code/message, never the payload.
        let reason = `http_${res.status}`;
        try {
          const errJson = (await res.json()) as { error?: { code?: number; message?: string } };
          if (errJson.error) {
            reason = `${errJson.error.code ?? res.status}:${errJson.error.message ?? 'unknown'}`;
          }
        } catch {
          // Non-JSON error body — keep the http_<status> reason.
        }
        logger.error({ event, templateName, reason }, 'WhatsApp send returned an error');
        return { ok: false, reason };
      }

      const data = (await res.json()) as { messages?: { id?: string }[] };
      const id = data.messages?.[0]?.id ?? null;
      logger.info({ event, waMessageId: id }, 'WhatsApp message sent');
      return { ok: true, id };
    } catch (err) {
      logger.error({ err, event, templateName }, 'WhatsApp transport threw');
      return { ok: false, reason: 'transport_error' };
    }
  },
};

// ============================================================
// Inbound webhook signature verification (Meta → this server)
// ============================================================
//
// HMAC-SHA256 over the RAW request body buffer with WHATSAPP_APP_SECRET — never parse
// the body before this check; JSON re-serialization would break the signature (same
// invariant as the Razorpay webhook in lib/razorpay.ts). Meta sends the header as
// `sha256=<hex>`; the prefix is stripped here before the timing-safe comparison.
export function verifyWebhookSignature(rawBody: Buffer, signatureHeader: string): boolean {
  if (!env.WHATSAPP_APP_SECRET) return false;

  const prefix = 'sha256=';
  if (!signatureHeader.startsWith(prefix)) return false;
  const signature = signatureHeader.slice(prefix.length);

  const expected = createHmac('sha256', env.WHATSAPP_APP_SECRET).update(rawBody).digest('hex');

  const expectedBuf = Buffer.from(expected, 'utf8');
  const actualBuf = Buffer.from(signature, 'utf8');
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
