import { asyncHandler } from '../utils/asyncHandler';
import { paymentService } from '../services/payment.service';
import { verifyWebhookSignature } from '../lib/razorpay';
import { verifyWebhookSignature as verifyWhatsAppSignature } from '../lib/whatsapp';
import { env } from '../lib/env';
import { logger } from '../lib/logger';

// Narrow the untyped WhatsApp webhook JSON to only what we log (RULES.md §1.2 — no
// `any`). Never extracts phone numbers, names, or message content — see
// docs/integrations/whatsapp-templates.md "Webhook setup" for the full payload shape.
function extractWhatsAppEventMeta(payload: unknown): { entryType: string; messageId: string | null } | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const root = payload as Record<string, unknown>;
  const entries = root.entry;
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const changes = (entries[0] as Record<string, unknown> | undefined)?.changes;
  if (!Array.isArray(changes) || changes.length === 0) return null;
  const change = changes[0] as Record<string, unknown>;
  const entryType = typeof change.field === 'string' ? change.field : 'unknown';

  const value = change.value as Record<string, unknown> | undefined;
  const messages = value?.messages;
  const statuses = value?.statuses;
  const firstMessage = Array.isArray(messages) ? (messages[0] as Record<string, unknown> | undefined) : undefined;
  const firstStatus = Array.isArray(statuses) ? (statuses[0] as Record<string, unknown> | undefined) : undefined;
  const messageId =
    (typeof firstMessage?.id === 'string' && firstMessage.id) ||
    (typeof firstStatus?.id === 'string' && firstStatus.id) ||
    null;

  return { entryType, messageId };
}

export const webhookController = {
  // Razorpay webhook (Layer 1). Mounted directly in index.ts with express.raw() BEFORE
  // express.json(), so req.body is the raw Buffer the HMAC signature is computed over.
  handle: asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    if (typeof signature !== 'string') {
      res.status(400).end();
      return;
    }

    const rawBody = req.body as unknown;
    if (!Buffer.isBuffer(rawBody) || !verifyWebhookSignature(rawBody, signature)) {
      // Invalid signature — reject immediately, never log the payload (RULES.md §4.1).
      res.status(400).end();
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch {
      res.status(400).end();
      return;
    }

    await paymentService.handleWebhookEvent(payload);

    // Always 200 — even on duplicate deliveries / no-ops — so Razorpay stops retrying.
    res.status(200).json({ success: true });
  }),

  // WhatsApp Cloud API verification handshake (Meta calls this once when the Callback
  // URL is saved in the dashboard, and may re-call it on re-verification). Works
  // whenever WHATSAPP_VERIFY_TOKEN is configured, independent of WHATSAPP_ENABLED, so
  // the owner can complete Meta's dashboard setup before outbound sends go live.
  // Response body must be the RAW challenge string, not JSON — a deliberate envelope
  // exception, same class as this controller's Razorpay `res.end()` responses.
  handleWhatsAppVerify: asyncHandler(async (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (
      !env.WHATSAPP_VERIFY_TOKEN ||
      mode !== 'subscribe' ||
      typeof token !== 'string' ||
      token !== env.WHATSAPP_VERIFY_TOKEN ||
      typeof challenge !== 'string'
    ) {
      res.status(403).end();
      return;
    }

    res.type('text/plain').status(200).send(challenge);
  }),

  // WhatsApp Cloud API event delivery. Mounted with express.raw() BEFORE express.json()
  // so req.body is the raw Buffer the HMAC signature is computed over — same invariant
  // as the Razorpay webhook above. Returns 200 immediately after signature validation;
  // no DB writes, no message processing — a log-only stub (event type + message id
  // only, never phone numbers/content/tokens — RULES.md §4.1). Delivery-status
  // persistence is explicitly deferred (D101).
  handleWhatsAppEvent: asyncHandler(async (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const rawBody = req.body as unknown;

    if (
      typeof signature !== 'string' ||
      !Buffer.isBuffer(rawBody) ||
      !verifyWhatsAppSignature(rawBody, signature)
    ) {
      // Invalid or unverifiable signature — reject, never log the payload.
      res.status(401).end();
      return;
    }

    res.status(200).end();

    // Fire-and-forget, after the response — a slow/failing log must never delay the
    // ACK Meta is waiting for. Skipped entirely while WhatsApp is disabled.
    if (!env.WHATSAPP_ENABLED) return;
    try {
      const payload = JSON.parse(rawBody.toString('utf8')) as unknown;
      const meta = extractWhatsAppEventMeta(payload);
      if (meta) {
        logger.info({ event: 'whatsapp_webhook', ...meta }, 'WhatsApp webhook event received');
      }
    } catch {
      // Malformed JSON after a valid signature — nothing to log, already ACKed.
    }
  }),
};
