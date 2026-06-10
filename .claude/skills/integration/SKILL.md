---
name: integrations
description: >
  Guides every external service integration in gstnoticesupport.in — Razorpay
  (Orders API, webhook with HMAC verification, idempotency, three-layer payment
  reliability, admin Mark-as-Paid override) and Resend (transactional email
  templates, sender setup, per-event email dispatch from the notification matrix).
  Use this for any payment work, webhook handling, email sending, template
  changes, or new external SDK integration. Triggers on "Razorpay", "payment",
  "webhook", "order", "signature", "HMAC", "Resend", "email", "OTP email",
  "notification", "template", "transactional", "Mark as Paid".
---

# External Integrations — Razorpay & Resend

## Purpose

The backend talks to two external services with locked integration patterns: Razorpay for payments and Resend for transactional email. Both follow the same architectural shape (SDK wrapper in `lib/` → service in `services/` → controller in `controllers/`), so this skill covers both.

**Source of truth:**
- HLD §10 (Payment Architecture)
- HLD §12 (Notification Architecture)
- HLD §13 (External Integrations)
- HLD §22.6 (Locked Payment Decisions)
- KB2 §5 (Payment Reliability), §8.2 (Mark as Paid)
- LLD (Payment Service, Notification Service)

---

## Razorpay Integration

### Locked decisions

| Decision | Value |
|---|---|
| Flow | Razorpay **Orders** API (not Standard Checkout direct) |
| Payment timing | Full upfront at Draft Ready stage (no partial, no EMI) |
| Refund policy | No refunds |
| Webhook signature | HMAC-SHA256 over raw body |
| Idempotency | `razorpay_payment_id` unique constraint |
| Reliability layers | 3 (webhook → verify page → admin override) |

### Three-Layer Reliability Architecture

Critical pattern from KB2 §5. All three layers exist to guarantee a paid user is never stuck at `Draft Ready`.

**Layer 1 — Webhook (primary)**
- Route: `/api/v1/webhooks/razorpay`
- Middleware: `express.raw({ type: 'application/json' })` (NOT `express.json()`)
- Steps:
  1. Read raw body buffer.
  2. Compute HMAC-SHA256 with `RAZORPAY_WEBHOOK_SECRET`.
  3. Compare against `x-razorpay-signature` header (timing-safe compare).
  4. Parse JSON body.
  5. Check idempotency: lookup `payment_records` by `razorpay_payment_id`. If row exists with `status=captured`, return 200 immediately (no double-processing).
  6. Within a Prisma transaction: update payment record, transition booking to `Filing`, set `payment_status=paid`.
  7. Send emails per notification matrix (user + admin).
  8. Return 200.
- Excluded from rate limiting and CORS — webhook traffic comes from Razorpay's IPs only.

**Layer 2 — Verify page (fallback)**
- Page: `/payment/verify` on the frontend (Server Component).
- Razorpay redirects the user here after the payment modal completes.
- The page receives `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature` as query params (or POST body — confirm with Razorpay docs).
- Server Component calls `POST /api/v1/user/payments/verify` with those values.
- Backend:
  1. Verify the signature locally (same HMAC pattern).
  2. Look up the payment record by `razorpay_order_id`.
  3. If webhook already processed → return success (page renders success state).
  4. If not yet processed → call Razorpay Fetch Payment API to confirm `status=captured`. If captured, run the same transaction as the webhook (idempotency on `razorpay_payment_id` prevents double-processing if webhook fires later).
- Four possible outcomes shown on the page (KB2): **success**, **failed**, **inconclusive** (Razorpay says still processing), **tampered** (signature mismatch).

**Layer 3 — Admin Mark-as-Paid (manual override)**
- Visible on admin booking detail page only when: `status=Draft Ready` AND payment record is `pending` or `failed`.
- Admin enters `razorpay_payment_id` manually.
- Backend calls Razorpay Fetch Payment API to confirm. Refuses to mark paid if Razorpay does not confirm `status=captured`.
- Same idempotent transaction as webhook.
- This is **never** a blind override — Razorpay confirmation is mandatory.

### Order creation flow

When the user clicks "Pay to Unlock" at Draft Ready:

1. Frontend calls `POST /api/v1/user/bookings/:bookingId/create-order`.
2. Backend service:
   - Verifies user owns booking and status is `Draft Ready`.
   - Calls Razorpay Orders API: `orders.create({ amount, currency: 'INR', receipt: bookingId, notes: { bookingId, userId } })`.
   - Inserts `payment_records` row with `status=created`, `razorpay_order_id`, `amount`.
3. Returns `{ orderId, amount, razorpayKeyId }` to frontend.
4. Frontend opens Razorpay Checkout modal with those values.

### Webhook security checklist

- Use raw body middleware only on this route.
- Timing-safe signature comparison (`crypto.timingSafeEqual` or equivalent).
- Cloudflare WAF allowlist for Razorpay IP ranges (post-launch, HLD §22.1).
- Webhook secret rotated separately from API keys.
- Webhook excluded from rate limiting.

### Idempotency

`payment_records.razorpay_payment_id` is a unique column. On webhook arrival:

```
If row with this razorpay_payment_id exists AND status=captured → no-op, return 200
Else → process atomically inside transaction
```

This makes the webhook safe to retry. Razorpay retries failed deliveries; idempotency prevents double-billing and double-emails regardless of how many times it fires.

### Payment Record schema (KB2 O7)

Minimum fields:
- `id` (UUID)
- `bookingId`
- `razorpayOrderId`
- `razorpayPaymentId` (nullable until captured, unique when set)
- `amount`
- `status` — `created` / `captured` / `failed` / `inconclusive`
- `createdAt`
- `processedAt` (set when webhook or verify page processes)

---

## Resend Integration

### Locked decisions

| Decision | Value |
|---|---|
| Provider | Resend |
| Channel | Email only — no SMS, no WhatsApp automation |
| Sending domain | `gstnoticesupport.in` (verified) |
| From address | `support@gstnoticesupport.in` |
| Template engine | React Email (or equivalent JSX-based templates) |
| Template location | `lib/email/templates/` in the backend repo |

SPF, DKIM, and DMARC records are configured at the domain registrar (HLD §12.4). Without these, deliverability is poor — confirm they exist before launch.

### Notification Matrix (HLD §12.2)

Every event in this table fires at most once per occurrence. Status-change emails fire from the service method that performs the transition, never from the controller.

| Event | User | Admin |
|---|---|---|
| Signup OTP | ✅ | — |
| Forgot password OTP | ✅ | — |
| New booking submitted | ✅ | ✅ |
| Status → In Review | ✅ | — |
| Status → Draft Ready (initial) | ✅ | — |
| Draft re-uploaded | ✅ | — |
| Payment confirmed (→ Filing) | ✅ | ✅ |
| Failed payment attempt | — | ✅ |
| User cancels service | ✅ | ✅ |
| Status → Complete | ✅ | — |
| User account created | — | ✅ |
| User account deleted | ✅ | ✅ |
| Contact Us form submitted | — | ✅ |
| Calendly demo booked | (handled by Calendly) | (handled by Calendly) |

Calendly handles its own email — do not double-send.

### Templates

Each template is a typed function: `<EventName>Email({ ...props }): JSX.Element`. Templates render to HTML at send time.

Conventions:
- One file per template in `lib/email/templates/`.
- Props are typed; never pass `any`.
- Brand palette: navy + green + neutral. No red, no neon (per Design Blueprint).
- Plain HTML acceptable for Phase 2 launch. Refinement is a code change, not a dashboard change.

### Special template: Draft Ready (Services 1 and 2)

Per KB2 O8, the Draft Ready email for **GSTAT Appeal** and **Commissioner Appeal** must include the pre-deposit disclosure paragraph. The other two services (SCN Reply, ASMT-10 Reply) get the same email without that paragraph. Implement as a single template with a conditional block keyed on service type, not as two separate templates.

The disclosure text references "as per GST Act" — never state a specific percentage (KB2).

### Sending pattern

```
notificationService.send<Event>({ ... })
```

The notification service:
1. Builds the typed props.
2. Renders the template to HTML.
3. Calls Resend SDK with `from`, `to`, `subject`, `html`.
4. Logs the result (success or failure) — does not throw on email failure if the surrounding operation must succeed (e.g. webhook should return 200 even if email fails; email failure goes to monitoring).

### OTP emails

The two OTP templates (`SignupOtpEmail`, `PasswordResetOtpEmail`) are the only synchronous-blocking emails — if sending fails, the auth endpoint should return an error to the user. All other emails are fire-and-forget within the surrounding transaction.

---

## Cross-integration concerns

### Order of operations on payment confirmation

Inside the webhook transaction:
1. Update `payment_records` (set captured + timestamp).
2. Update `booking` (status → Filing, payment_status → paid).
3. Send user email (payment confirmed).
4. Send admin email (payment confirmed).
5. Commit transaction.

Email failures must not roll back the transaction. Wrap email sends in their own try/catch within the transaction body — the booking transition is the authoritative success signal.

### Environment-specific config

Razorpay: separate `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` per env. Use Razorpay test mode keys for dev and staging.

Resend: typically a single API key works across envs but **sending domain is shared**. To avoid polluting production email reputation, dev and staging should use a separate verified sub-domain (e.g. `dev.gstnoticesupport.in`) or Resend's test endpoint.

---

## Anti-patterns

Do not:

### Razorpay
- Use `express.json()` on the webhook route. Signature verification will fail permanently.
- Compare signatures with `===`. Use timing-safe comparison.
- Process a webhook without idempotency check on `razorpay_payment_id`.
- Trust the redirect query params alone in the verify page. Always verify signature server-side and call Fetch Payment API if not already processed.
- Let Mark-as-Paid bypass Razorpay confirmation. Admin override still requires Razorpay API confirmation.
- Apply rate limiting to the webhook route.
- Refund users in code. There are no refunds.

### Resend
- Send emails synchronously from inside a hot path without timeout protection.
- Roll back a database transaction because email failed. Log and continue.
- Hardcode email copy in services. Templates live in `lib/email/templates/`.
- Send double notifications when both the webhook and verify page process the same payment. Idempotency prevents this — do not work around it.
- Send Draft Ready email without the pre-deposit block for GSTAT Appeal or Commissioner Appeal.
- Use a different `from` address than the verified domain.
- Automate WhatsApp messaging. WhatsApp is redirect-button only.

---

## Quick Reference

**Adding a new payment endpoint:** Check first if it duplicates the three-layer pattern. New flows are unlikely to be needed — most work is around the existing three layers.

**Adding a new email event:**
1. Add row to the Notification Matrix (HLD §12.2 — update the doc if expanding).
2. Create the template in `lib/email/templates/`.
3. Add `notificationService.send<Event>()` method.
4. Call it from the service method that fires the event (status transition, account action, etc.).
5. Decide: synchronous (auth flow) or fire-and-forget (everything else).
