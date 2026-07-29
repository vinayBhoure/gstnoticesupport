import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().min(1, 'CLIENT_URL is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Auth / JWT (Phase 2)
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),

  // Cookie scoping — unset in dev so cookies work on localhost (HLD §4.4)
  COOKIE_DOMAIN: z.string().optional(),

  // Public API base URL — used to build the login "This wasn't me" link (D65)
  API_URL: z.string().min(1, 'API_URL is required'),

  // Email (Phase 2 — Resend)
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  RESEND_FROM_EMAIL: z.string().min(1, 'RESEND_FROM_EMAIL is required'),

  // Admin account identity — used by the seed to create the admin login AND looked up
  // by admin-only tooling/fixtures. Keep this a branded, stable address.
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email'),

  // Where admin NOTIFICATION emails are delivered. Decoupled from ADMIN_EMAIL so the
  // recipient can be an external inbox (reliable delivery) without changing the admin's
  // login identity. Optional — falls back to ADMIN_EMAIL when unset.
  ADMIN_NOTIFICATION_EMAIL: z.string().email('ADMIN_NOTIFICATION_EMAIL must be a valid email').optional(),

  // AWS S3 (Phase 4 — private document bucket, Mumbai)
  AWS_REGION: z.string().min(1, 'AWS_REGION is required').default('ap-south-1'),
  AWS_S3_BUCKET_NAME: z.string().min(1, 'AWS_S3_BUCKET_NAME is required'),
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),

  // Razorpay (Phase 5 — payments). Test keys (rzp_test_) in dev; rzp_live_ in prod only.
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'RAZORPAY_WEBHOOK_SECRET is required'),

  // WhatsApp Cloud API (Meta Graph API) — WhatsApp notifications alongside email.
  // Every var is optional so the server boots with nothing configured; sends are a
  // no-op until WHATSAPP_ENABLED='true' AND the phone-number-id + access-token are set.
  // Overrides the KB1 §16 "no WhatsApp automation" constraint by explicit decision (D101).
  // NOTE: z.coerce.boolean() would treat the string 'false' as true — use an explicit enum.
  WHATSAPP_ENABLED: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
  WHATSAPP_API_VERSION: z.string().default('v23.0'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_TEMPLATE_LANG: z.string().default('en'),
  // Where admin WhatsApp notifications are delivered (E.164, e.g. +9198XXXXXXXX).
  // No fallback — admin WhatsApp sends are skipped when this is unset.
  WHATSAPP_ADMIN_NUMBER: z.string().optional(),

  // WhatsApp Cloud API inbound webhook (Meta → this server). Distinct credentials from
  // the outbound send path above: the Meta App Secret (not the System User access
  // token) signs webhook payloads, and the verify token is an owner-chosen string
  // pasted into both here and the Meta dashboard's Callback URL config. Both optional —
  // the GET verification handshake 403s and POST signature checks fail closed (401)
  // when unset, so the webhook is inert until deliberately configured.
  WHATSAPP_APP_SECRET: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Missing or invalid environment variables:');
  result.error.issues.forEach((e) => {
    console.error(`  ${e.path.join('.')}: ${e.message}`);
  });
  process.exit(1);
  // Unreachable at runtime (process.exit terminates the process). The throw is here
  // so TypeScript narrows `result` to the success branch below without relying on
  // @types/node's `process.exit` being typed as `never` in every build environment.
  throw new Error('unreachable');
}

export const env = result.data;

// Resolved recipient for all admin notification emails: the dedicated notification
// inbox if configured, otherwise the admin account identity.
export const ADMIN_NOTIFICATION_EMAIL = env.ADMIN_NOTIFICATION_EMAIL ?? env.ADMIN_EMAIL;
