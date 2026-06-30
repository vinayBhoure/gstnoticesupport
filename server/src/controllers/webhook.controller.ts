import { asyncHandler } from '../utils/asyncHandler';
import { paymentService } from '../services/payment.service';
import { verifyWebhookSignature } from '../lib/razorpay';

// Razorpay webhook (Layer 1). Mounted directly in index.ts with express.raw() BEFORE
// express.json(), so req.body is the raw Buffer the HMAC signature is computed over.
export const webhookController = {
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
};
