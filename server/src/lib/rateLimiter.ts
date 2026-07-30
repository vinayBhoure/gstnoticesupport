import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { hashToken } from './jwt';

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

// Signup sends two emails (user OTP + admin alert) and inserts an unverified user per call.
// Strict per-IP cap stops one host email-bombing many victim addresses (audit Pass 4).
export const signupRateLimiter = createRateLimiter({
  windowMs: HOUR,
  max: 5,
  message: 'Too many sign-up attempts. Please try again in an hour.',
});

// Refresh keyed by the refresh-cookie hash (≈ per session/user), not IP — so it stays correct
// even if trust-proxy is misconfigured on Railway. hashToken() is sha256, so the raw token
// never enters the limiter's key store (audit Pass 4).
export const refreshRateLimiter = rateLimit({
  windowMs: HOUR,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const token = req.cookies?.refresh_token;
    // IPv6-safe fallback via express-rate-limit's helper (masks to a subnet) when no cookie.
    return token ? hashToken(String(token)) : ipKeyGenerator(req.ip ?? 'unknown');
  },
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many refresh attempts. Please try again later.' },
  },
});

export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * MIN,
  max: 5,
  message: 'Too many login attempts. Please try again in a few minutes.',
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

// Debounced client-side checks retry a few times per keystroke burst; 30/15min
// absorbs that while still blunting bulk phone-number enumeration.
export const phoneCheckRateLimiter = createRateLimiter({
  windowMs: 15 * MIN,
  max: 30,
  message: 'Too many checks. Please try again later.',
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

// Payment rate limiters (api_contract.md §5). The webhook route is exempt.
export const paymentInitiateRateLimiter = createRateLimiter({
  windowMs: HOUR,
  max: 5,
  message: 'Too many payment attempts. Please try again in an hour.',
});

export const paymentVerifyRateLimiter = createRateLimiter({
  windowMs: HOUR,
  max: 7,
  message: 'Too many verification attempts. Please try again in an hour.',
});

// Admin rate limiters (api_contract.md §6). Only the draft upload URL is limited.
export const adminDraftUploadRateLimiter = createRateLimiter({
  windowMs: HOUR,
  max: 15,
  message: 'Too many draft uploads. Please try again in an hour.',
});
