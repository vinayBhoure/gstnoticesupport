import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().min(1, 'CLIENT_URL is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
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
