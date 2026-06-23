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
      error: {
        code: 'RATE_LIMITED',
        message: message ?? 'Too many requests. Please try again later.',
      },
    },
  });
}

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

// Auth rate limiters (api_contract.md §1)
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * MIN,
  max: 5,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

export const otpVerifyRateLimiter = createRateLimiter({
  windowMs: 10 * MIN,
  max: 5,
  message: 'Too many verification attempts. Please try again in 10 minutes.',
});

export const otpResendRateLimiter = createRateLimiter({
  windowMs: HOUR,
  max: 3,
  message: 'Too many code requests. Please try again in an hour.',
});

export const forgotPasswordRateLimiter = createRateLimiter({
  windowMs: HOUR,
  max: 5,
  message: 'Too many reset requests. Please try again in an hour.',
});

export const resetPasswordRateLimiter = createRateLimiter({
  windowMs: 10 * MIN,
  max: 5,
  message: 'Too many reset attempts. Please try again in 10 minutes.',
});

// Document rate limiters (api_contract.md §4)
export const documentUploadRateLimiter = createRateLimiter({
  windowMs: HOUR,
  max: 7,
  message: 'Too many uploads. Please try again in an hour.',
});

export const draftUrlRateLimiter = createRateLimiter({
  windowMs: HOUR,
  max: 15,
  message: 'Too many draft requests. Please try again in an hour.',
});
