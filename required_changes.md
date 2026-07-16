# Required Changes — Security Audit Pass 4 (Rate Limiting & Abuse Protection)

> Status: **Sections 1–3 IMPLEMENTED 2026-07-15**, then **live-Newman-verified** against a
> real local server + Neon dev DB. Sections 4–5 remain deferred (need infra/accounts or a
> scaling decision). See decisions.md **D96** for the full narrative.
> Context: backend deployment has moved from Hostinger (single Node process, blue-green)
> to **Railway + GitHub deploys**. Decision: **no Redis** — exact caps on expensive actions
> are enforced as DB-backed business rules (service layer); in-memory limiters remain only
> as coarse brute-force/DDoS deterrents where approximate counting is acceptable.

> IMPLEMENTED & VERIFIED (sections 1, 2, 3 below):
> - OTP resend cooldown (otp.service + forgotPassword enumeration-safe swallow)
> - Booking daily cap (booking.repository.countByUserIdSince + booking.service)
> - One active order per booking (payment.repository.findActiveByBookingId + payment.service)
>   — reuse path verified by code review only (no Newman coverage; live-testing it would
>   require a successful first order, which the sandbox's invalid Razorpay credentials block)
> - Signup per-IP limiter; refresh limiter (cookie-hash keyed, IPv6-safe fallback via
>   express-rate-limit's `ipKeyGenerator()` — an unsafe raw-`req.ip` fallback was caught
>   and fixed during the Newman pass); global /api/v1 backstop
> - trust proxy comment corrected for Railway (value kept at 1, verify live)
> - Pass 6 Finding A: presigned-GET `ResponseContentType` pinned to `application/pdf` — kept
>
> **REVERTED — Pass 6 Finding B (magic-byte upload verification):** implemented, then pulled
> after a live Newman re-run broke document/draft-confirm across 3 previously-green suites
> (500s). Root cause: it made the confirm handlers read S3 object bytes directly via
> `GetObjectCommand`, which (a) contradicts this project's own invariant that files never
> pass through the app — only presigned PUT/GET URLs are issued (HLD §9.2) — and (b) threw
> unhandled on the dev sandbox's placeholder AWS credentials instead of failing gracefully.
> If revisited, it needs to run as background/async verification off the request path, not
> a synchronous read blocking confirm.
>
> STILL DEFERRED: section 4 (jtiCache — revisit before replicas), section 5 (CAPTCHA,
> Cloudflare edge limits, 429 monitoring), and the magic-byte check above (needs redesign).
> Per-email signup limiter dropped as unnecessary (existing findByEmail 409 caps a victim
> address to one email).

## Newman verification (2026-07-15, live local server + real Neon dev DB)

Every suite was run in isolation on a freshly-started server (cleared in-memory rate-limit
counters) to get unambiguous signal:

| Suite | Assertions | Result |
|---|---|---|
| Core booking (`run-newman.sh`) | 68 / 68 | ✅ clean |
| Admin (`run-admin-newman.sh`) | 109 / 109 | ✅ clean |
| Final draft (`run-finaldraft-newman.sh`) | 53 / 53 | ✅ clean |
| Representation (`run-representation-newman.sh`) | 30 / 33 | 3 failures |
| Payments (`run-payments-newman.sh`) | 29 / 45 | 16 failures |

**Every one of the 19 failures (representation + payments) traces to a single, pre-existing,
environmental cause**, confirmed independently of this diff: the `RAZORPAY_KEY_ID` /
`RAZORPAY_KEY_SECRET` pair in this sandbox's `server/.env` fails Razorpay's own
authentication (`BAD_REQUEST_ERROR: Authentication failed`) — reproduced with a raw
`razorpay` SDK call made outside the application entirely, so it cannot be caused by
anything in this branch. All non-Razorpay-dependent assertions in both suites (auth checks,
ownership 404s, state-gate 409s, webhook signature verification, idempotent webhook replay,
quote-required/rejected validation, stats/list filtering) passed.

### Follow-up (2026-07-16): Razorpay credentials fixed, verification closed with high confidence

The user supplied a working `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` pair. Re-verified
independently with a raw SDK order-creation call outside the app (`ORDER CREATED OK:
order_TEBwthOEgMxJQz`) — the credential root cause above is resolved.

Re-running the full suite that day surfaced a **second, unrelated, expected** effect: the
admin test account had made 42 `POST /bookings` calls within 24h across the day's repeated
Newman runs, tripping the new `BOOKING_LIMIT` cap (§1.2) — the cap working as designed, not
a bug. This in turn blocked further live confirmation of the Razorpay-dependent assertions
in `run-representation-newman.sh` and `run-payments-newman.sh` for the rest of that day
(cap resets on a rolling 24h window per booking). The pre-existing `paymentInitiateRateLimiter`
(5/hr, unrelated to this branch) was separately exhausted the same way.

**Decision (user-approved, 2026-07-16):** accept the independent Razorpay SDK verification
plus the fully-clean earlier isolated run (all non-Razorpay assertions passing in both
suites) as sufficient evidence, rather than wait ~5h for the booking cap to clear or
authorize deleting the test-only booking rows to force an immediate clean run. **Full
green Newman confirmation of `run-payments-newman.sh` and `run-representation-newman.sh`
end-to-end has not been captured in one single run** — re-run both once convenient (the
cap self-clears; no code action needed) for a belt-and-suspenders confirmation before a
production deploy that touches payment or booking-creation code paths.

**Operational note for future test runs:** `run-representation-newman.sh` and
`run-payments-newman.sh` both create bookings via the real `POST /bookings` API (unlike
the admin/final-draft suites, which seed bookings via direct Prisma in
`scripts/setup-*.mjs`, bypassing the cap entirely). Repeated same-day runs against a shared
admin/test account can trip the 30/24h `BOOKING_LIMIT` cap purely from test volume — this
is expected, not a regression, and is worth knowing before debugging a sudden 429 in these
two suites specifically.

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
