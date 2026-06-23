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

  // Admin notification recipient (account-created, login alert, etc.)
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email'),

  // AWS S3 (Phase 4 — private document bucket, Mumbai)
  AWS_REGION: z.string().min(1, 'AWS_REGION is required').default('ap-south-1'),
  AWS_S3_BUCKET_NAME: z.string().min(1, 'AWS_S3_BUCKET_NAME is required'),
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Missing or invalid environment variables:');
  result.error.issues.forEach((e) => {
    console.error(`  ${e.path.join('.')}: ${e.message}`);
  });
  process.exit(1);
}

export const env = result.data;
