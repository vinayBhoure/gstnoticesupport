import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './lib/env';
import { requestLogger } from './middleware/requestLogger';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter, healthRouter } from './routes';
import { webhookController } from './controllers/webhook.controller';

export function createApp(): express.Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — explicit origin required; wildcard breaks HttpOnly cookie auth
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

  // Cookie parsing (needed for JWT in HttpOnly cookies)
  app.use(cookieParser());

  // Structured request logging
  app.use(requestLogger);

  // Razorpay webhook must be registered BEFORE express.json() with express.raw()
  // so that HMAC-SHA256 signature verification is computed over the raw buffer.
  app.post(
    '/api/v1/webhooks/razorpay',
    express.raw({ type: 'application/json' }),
    webhookController.handle,
  );

  // JSON body parsing scoped to the versioned API router only. When this app
  // is mounted behind a unified server alongside Next.js (server.js at repo
  // root), Next's own routes (e.g. /api/contact) must parse their own bodies
  // untouched — a global express.json() here would consume them first.
  app.use('/api/v1', express.json());

  // Health check — root level, not under /api/v1
  app.use('/health', healthRouter);

  // Versioned API routes
  app.use('/api/v1', apiRouter);

  // 404 handler — must be after all routes
  app.use(notFound);

  // Error handler — must be last
  app.use(errorHandler);

  return app;
}
