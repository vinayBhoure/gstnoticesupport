import rateLimit from 'express-rate-limit';

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
}

export function createRateLimiter({ windowMs, max, message }: RateLimiterOptions) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      data: null,
      error: message ?? 'Too many requests. Please try again later.',
      statusCode: 429,
    },
  });
}
