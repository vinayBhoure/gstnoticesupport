import 'dotenv/config';
import { env } from './lib/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { requestLogger } from './middleware/requestLogger';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter, healthRouter } from './routes';
import { webhookController } from './controllers/webhook.controller';

const app = express();

// Hostinger's reverse proxy is the single trusted hop in front of this app, so req.ip
// must be derived from X-Forwarded-For — otherwise express-rate-limit buckets every
// user under the proxy IP and the D65 login-alert email logs the wrong IP. NOT `true`
// (that trusts a client-supplied header and is spoofable). Raise to 2 / a Cloudflare IP
// list if Cloudflare is ever placed in front (see D95).
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS — explicit origin required; wildcard breaks HttpOnly cookie auth
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

// gzip responses at the origin — there is no CDN in front to do it (D95), so this is
// the only place API payloads get compressed on the way to the browser.
app.use(compression());

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

// JSON body parsing for all other routes
app.use(express.json());

// Health check — root level, not under /api/v1
app.use('/health', healthRouter);

// Versioned API routes
app.use('/api/v1', apiRouter);

// 404 handler — must be after all routes
app.use(notFound);

// Error handler — must be last
app.use(errorHandler);

app.listen(env.PORT, () => {
  // Using process.stdout instead of console.log to avoid lint warnings on committed code
  process.stdout.write(`Server running on http://localhost:${env.PORT}\n`);
});
