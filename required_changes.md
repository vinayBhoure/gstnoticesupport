# Required Changes — Security Audit Pass 4 (Rate Limiting & Abuse Protection)

> Status: **Sections 1–3 IMPLEMENTED 2026-07-15** (typecheck + build green); sections 4–5
> remain deferred (need infra/accounts or a scaling decision). Also implemented: Pass 6
> Finding B (magic-byte upload verification). See decisions.md **D96**.
> Context: backend deployment has moved from Hostinger (single Node process, blue-green)
> to **Railway + GitHub deploys**. Decision: **no Redis** — exact caps on expensive actions
> are enforced as DB-backed business rules (service layer); in-memory limiters remain only
> as coarse brute-force/DDoS deterrents where approximate counting is acceptable.

> IMPLEMENTED (sections 1, 2, 3 below):
> - OTP resend cooldown (otp.service + forgotPassword enumeration-safe swallow)
> - Booking daily cap (booking.repository.countByUserIdSince + booking.service)
> - One active order per booking (payment.repository.findActiveByBookingId + payment.service)
> - Signup per-IP limiter; refresh limiter (cookie-hash keyed); global /api/v1 backstop
> - trust proxy comment corrected for Railway (value kept at 1, verify live)
> - Pass 6 Finding B: objectStartsWithPdfMagic used at all 3 confirm sites; presigned-GET
>   ResponseContentType pinned (Finding A, already applied)
>
> STILL DEFERRED: section 4 (jtiCache — revisit before replicas) and section 5
> (CAPTCHA, Cloudflare edge limits, 429 monitoring). Per-email signup limiter dropped
> as unnecessary (existing findByEmail 409 caps a victim address to one email).

---

## 1. DB-backed business-rule caps (exact, survive deploys/replicas — no migration needed)

### 1.1 OTP resend cooldown (per account)
- `server/src/repositories/otp.repository.ts` — add:
  ```ts
  async findLatestByUserId(userId: string) {
    return prisma.otpStore.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
  ```
- `server/src/services/otp.service.ts` — inside `issue()`, before creating a new code:
  ```ts
  const RESEND_COOLDOWN_MS = 60_000; // one code per minute per account
  const last = await otpRepository.findLatestByUserId(userId);
  if (last && Date.now() - last.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new ApiError(429, 'OTP_COOLDOWN', 'Please wait a moment before requesting another code.');
  }
  ```
- Uses existing indexed `OtpStore.userId` + `createdAt` — no schema change.
- Note: OTP verify-failure lockout ALREADY EXISTS (`otp.service.ts` MAX_ATTEMPTS=5) — no action.

### 1.2 Booking creation daily cap (per user)
- `server/src/repositories/booking.repository.ts` — add:
  ```ts
  async countByUserIdSince(userId: string, since: Date) {
    return prisma.booking.count({ where: { userId, createdAt: { gte: since } } });
  }
  ```
- `server/src/services/booking.service.ts` — inside `create()`, before the insert:
  ```ts
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (await bookingRepository.countByUserIdSince(userId, dayAgo) >= 30) {
    throw new ApiError(429, 'BOOKING_LIMIT', 'Daily booking limit reached. Please try again tomorrow.');
  }
  ```
- Uses existing `@@index([userId])` + `@@index([createdAt])` on Booking — no schema change.

### 1.3 One active Razorpay order per booking
- `server/src/repositories/payment.repository.ts` — add:
  ```ts
  async findActiveByBookingId(bookingId: string): Promise<PaymentRecord | null> {
    return prisma.paymentRecord.findFirst({
      where: { bookingId, status: PaymentRecordStatus.created },
      orderBy: { createdAt: 'desc' },
    });
  }
  ```
- `server/src/services/payment.service.ts` — in `initiate()`, after `getBookingAmountPaise`:
  reuse the existing pending order (return its `orderId`/`amountPaise` in the same
  InitiateOrderDTO shape) instead of minting a duplicate Razorpay order + payment_records row.
- Residual same-millisecond race is acceptable: capture layer already guarantees a booking
  is marked paid exactly once (unique razorpay_payment_id + conditional captureAndTransition).
  A hard guarantee would need a partial unique index (migration) — explicitly deferred.

## 2. In-memory limiters (coarse deterrents — keep express-rate-limit, approximate is fine)

### 2.1 Signup per-IP limiter (Critical gap — endpoint currently UNLIMITED, sends 2 emails/call)
- `server/src/lib/rateLimiter.ts`:
  ```ts
  export const signupRateLimiter = createRateLimiter({
    windowMs: HOUR, max: 5,
    message: 'Too many sign-up attempts. Please try again in an hour.',
  });
  ```
- `server/src/routes/auth.routes.ts`:
  `router.post('/signup', signupRateLimiter, validateBody(signupSchema), authController.signup);`
- Per-email signup limiter DROPPED as unnecessary: existing `findByEmail` 409 already caps a
  victim address to a single email; multi-victim bombing is covered by the per-IP limiter.

### 2.2 Refresh limiter (keyed by refresh-cookie sha256 hash, falls back to IP)
- `server/src/lib/rateLimiter.ts` (import `hashToken` from './jwt'):
  ```ts
  export const refreshRateLimiter = rateLimit({
    windowMs: HOUR, max: 60, standardHeaders: true, legacyHeaders: false,
    keyGenerator: (req) => { const t = req.cookies?.refresh_token; return t ? hashToken(String(t)) : (req.ip ?? 'unknown'); },
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many refresh attempts. Please try again later.' } },
  });
  ```
- `server/src/routes/auth.routes.ts`:
  `router.post('/refresh', refreshRateLimiter, authController.refresh);`

### 2.3 Global API backstop (Medium)
- `server/src/index.ts`, registered AFTER the Razorpay webhook mount (webhook stays exempt),
  before `apiRouter`:
  ```ts
  app.use('/api/v1', createRateLimiter({ windowMs: 60 * 1000, max: 300, message: 'Too many requests. Please slow down.' }));
  ```
- ⚠️ Deviates from backend.md §4.3 ("per-route, not globally") by explicit user request —
  record via /log decision when implemented.

## 3. trust proxy fix for Railway (Critical correctness for all IP-keyed limiting)
- `server/src/index.ts:16-21` — comment and value assume Hostinger's proxy ("single trusted hop").
- On Railway: verify hop count by logging `req.ip` on a live request; keep `1` for Railway's
  edge alone, raise to `2` if Cloudflare is later put in front. Refresh the stale comment.
- Design note: because expensive actions are guarded by identity+DB (section 1), a wrong
  trust-proxy value can no longer bypass email/booking/order caps — it only degrades the
  coarse IP deterrents.

## 4. Revisit before enabling Railway replicas (no action while single-replica)
- `server/src/lib/jtiCache.ts` — negative "known clean" jti cache assumes a single process.
  With >1 replica, a revoked session can stay honored on other replicas until cache TTL expiry.
  No-new-tech fix at that time: shorten TTL or drop the cache (blacklist lookup is an indexed
  DB query). Track alongside replica decision.

## 5. Deferred (needs user-owned accounts/keys — separate follow-ups)
- CAPTCHA (Cloudflare Turnstile) on signup / forgot-password / contact / callback — needs
  sitekey+secret; client widget + server-side siteverify guard.
- Cloudflare in front of Railway for edge rate limiting / WAF (optional DNS change);
  Railway has no app-configurable edge limits.
- 429 monitoring/alerting: Railway log drain (or Sentry) + alert on RATE_LIMITED spikes.

## Already satisfied (verified during audit — no action)
- 429 + Retry-After on all limiters (express-rate-limit standardHeaders: true).
- OTP failure lockout (attemptCount >= 5).
- Duplicate PAYMENT prevention (unique razorpay_payment_id + idempotent captureAndTransition).
- Razorpay webhook exempt from all limiters.
