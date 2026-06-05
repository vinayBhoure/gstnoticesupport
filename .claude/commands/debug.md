---
name: debug
description: >
  Diagnoses broken behaviour in the gstnoticesupport.in platform across three
  domains — payment (Razorpay three-layer reliability), webhook (HMAC,
  middleware, Cloudflare), and auth (JWT, cookies, CORS). Takes the domain
  and an optional identifier (bookingId, userId, error message) and walks
  through every possible failure point in a structured checklist, explaining
  what to look for and why each step matters.
  Usage: /debug <domain> [identifier]
  Domains: payment | webhook | auth
  Examples:
    /debug payment booking_abc123
    /debug webhook
    /debug auth "cookie not sent"
---

# /debug

Structured diagnostic for the three most complex failure domains in
gstnoticesupport.in. Each domain has a fixed sequence of checks ordered from
most likely to least likely cause.

---

## Domain: `payment`

**When to use:** A user paid but their booking is still at `Draft Ready`.
The verify page showed an unexpected outcome. Mark-as-Paid is being
considered. A booking's `payment_status` and `status` are out of sync.

Reference: `integrations` skill (Three-Layer Reliability), `status-machine` skill.

---

### Step 1 — Check the payment_records row

Query `payment_records WHERE bookingId = '<id>'`:

```sql
SELECT id, razorpay_order_id, razorpay_payment_id,
       amount, status, created_at, processed_at
FROM payment_records
WHERE booking_id = '<bookingId>';
```

| What you see | What it means |
|---|---|
| No row | `create-order` was never called — user never opened the payment modal |
| `status = created` | Order exists but payment was never completed or webhook never fired |
| `status = captured`, `processed_at` set | Payment processed correctly — check `bookings.status` separately |
| `status = failed` | Payment failed at Razorpay — user needs to retry |
| `status = inconclusive` | Verify page could not confirm — check Razorpay dashboard directly |

---

### Step 2 — Check the booking status

```sql
SELECT id, status, payment_status, updated_at
FROM bookings
WHERE id = '<bookingId>';
```

| `status` | `payment_status` | Interpretation |
|---|---|---|
| `draft_ready` | `pending` | Payment not yet processed — webhook may have failed or not arrived yet |
| `draft_ready` | `paid` | **Mismatch** — payment record shows captured but status never transitioned — transaction failure |
| `filing` | `paid` | Correct state post-payment |
| `filing` | `pending` | Webhook processed but payment_status field not updated — partial transaction |

---

### Step 3 — Check Layer 1 (Webhook)

**Did the webhook arrive?** Check Render/Railway request logs for
`POST /api/v1/webhooks/razorpay` around the payment time.

If the route appears in logs:
- Check the response code. `200` = processed. `400` = signature failed. `500` = processing error.
- If `400`: the raw body middleware is likely wrong (see `/debug webhook`).
- If `500`: check the error log for the exception. Most common: Prisma unique constraint
  violation on `razorpay_payment_id` (means idempotency is working but the first attempt
  failed partway through the transaction).

If the route does not appear in logs:
- Razorpay did not reach the server. Possible causes: Cloudflare WAF blocked the IP
  (Razorpay IPs not in the allow rule), rate limiter fired on the webhook route
  (webhook must be excluded), wrong webhook URL registered in Razorpay dashboard.
- Check Razorpay dashboard → Webhooks → recent deliveries for this payment to see
  what response Razorpay received.

---

### Step 4 — Check Layer 2 (Verify Page)

Ask the developer or check frontend logs:
- Did the user land on `/payment/verify`?
- What outcome did the page show? (success / failed / inconclusive / tampered)

If **tampered**: `razorpay_signature` in the redirect params did not match.
Possible cause: query params were modified (rare) or the verify endpoint is
computing the signature over the wrong data — check the field order used in
the HMAC computation matches Razorpay's documentation exactly.

If **inconclusive**: The verify page called Razorpay Fetch Payment API and the
payment was not yet `captured` at that moment. This is a timing issue — the
payment may have captured seconds later. Check Razorpay dashboard for final
payment status. If captured, Layer 3 (Mark-as-Paid) is the resolution path.

---

### Step 5 — Layer 3 (Mark-as-Paid) eligibility

Mark-as-Paid is available on the admin booking detail page only when:
- `bookings.status = 'draft_ready'` AND
- `payment_records.status` is `pending`, `failed`, or `inconclusive`

If both conditions are true:
1. Admin enters the `razorpay_payment_id` from the Razorpay dashboard.
2. Backend calls Razorpay Fetch Payment API to confirm `status = captured`.
3. If confirmed: runs the same idempotent transaction as the webhook.

**Never** use Mark-as-Paid if you cannot confirm capture in Razorpay dashboard.
The backend will reject it regardless — the API call is mandatory.

---

### Step 6 — Idempotency trap

If the booking is at `filing` but the developer is seeing a duplicate payment
error or double-email: check `payment_records` for two rows with the same
`razorpay_payment_id`. This should be blocked by the unique constraint — if
it happened, the constraint is missing from the migration.

```sql
SELECT COUNT(*) FROM payment_records
WHERE razorpay_payment_id = '<payment_id>';
```

If > 1: data integrity issue. The constraint is missing. Add it immediately.

---

## Domain: `webhook`

**When to use:** Razorpay webhook is not firing, returning errors, or
signature verification is failing.

Reference: `integrations` skill (Webhook security checklist), `backend-core` skill.

---

### Check 1 — Raw body middleware

The single most common cause of webhook failure in this stack.

Open `server/src/index.ts` (or wherever routers are mounted). Confirm:

```typescript
// CORRECT — webhook router mounted BEFORE express.json()
app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }), webhookRouter);
app.use(express.json()); // global JSON parser — AFTER the webhook route
```

If `express.json()` is applied globally before the webhook route is mounted,
the raw body is consumed and parsed — HMAC computation will always fail
because `req.body` is an object, not a Buffer.

---

### Check 2 — Signature computation

The signature is computed as:

```typescript
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
  .update(req.body) // req.body must be a Buffer here
  .digest('hex');

const isValid = crypto.timingSafeEqual(
  Buffer.from(expectedSignature),
  Buffer.from(req.headers['x-razorpay-signature'] as string)
);
```

Common mistakes:
- `req.body.toString()` used instead of `req.body` (the Buffer) — this can
  cause encoding issues.
- `===` used instead of `crypto.timingSafeEqual` — not a correctness issue
  but a timing-attack vulnerability.
- Wrong secret loaded — confirm `RAZORPAY_WEBHOOK_SECRET` matches what is
  registered in the Razorpay dashboard (not the API secret — these are different).

---

### Check 3 — Route not excluded from rate limiter

Open the rate limiter middleware configuration. Confirm the webhook route
is NOT in the list of rate-limited endpoints. The five rate-limited endpoints
are: send-otp, forgot-password, login, contact, draft-url. Webhook is not one of them.

---

### Check 4 — Cloudflare WAF (production only)

In the Cloudflare dashboard for `api.gstnoticesupport.in`:
- Go to Security → WAF → Custom Rules
- Confirm a rule exists that allows traffic from Razorpay's published IP ranges
  before any blocking rules run
- Razorpay's current IP list: https://razorpay.com/docs/webhooks/ip-addresses/

If no such rule exists, Cloudflare may be blocking Razorpay's POST requests.

---

### Check 5 — Webhook URL registration

In the Razorpay dashboard → Settings → Webhooks:
- Confirm the URL is `https://api.gstnoticesupport.in/api/v1/webhooks/razorpay`
- Confirm the `payment.captured` event is checked
- Check the recent delivery log for this webhook URL — Razorpay shows the
  response code and body it received

---

## Domain: `auth`

**When to use:** Users cannot log in. Cookies are not being sent. JWTs are
being rejected. CORS errors appear in the browser console. Auth works locally
but not in staging/production.

Reference: `auth-and-security` skill.

---

### Check 1 — Cookie flags by environment

| Flag | Development | Staging / Production |
|---|---|---|
| `httpOnly` | `true` | `true` |
| `secure` | `false` | `true` |
| `sameSite` | `'lax'` | `'lax'` |
| `domain` | **unset** | `.gstnoticesupport.in` (leading dot) |

Most common error in staging: `domain` is set to `gstnoticesupport.in` (no
leading dot) — the cookie will be sent to `gstnoticesupport.in` but NOT to
`api.gstnoticesupport.in`. The leading dot is required to cover subdomains.

Most common error in development: `secure: true` is set — cookie will not be
sent over HTTP localhost.

---

### Check 2 — CORS configuration

```typescript
// CORRECT
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN, // e.g. 'https://gstnoticesupport.in'
  credentials: true,                   // required for cookies
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
```

If `origin: '*'` is set, the browser will reject credentialed requests
(`credentials: true` is incompatible with wildcard origin). This shows as
a CORS error in the browser even though the server sent the header.

If `FRONTEND_ORIGIN` is not set (empty string or undefined), CORS will
block all requests silently.

---

### Check 3 — Frontend fetch configuration

Every authenticated fetch from the frontend must include credentials:

```typescript
// Server Component
fetch(url, {
  headers: { cookie: cookieStore.toString() },
  cache: 'no-store',
});

// Client Component (apiClient.ts)
fetch(url, {
  credentials: 'include', // sends cookies cross-origin
});
```

If `credentials: 'include'` is missing in the API client, the cookie is
never sent to the backend even if it exists in the browser.

---

### Check 4 — JWT secret mismatch

If JWTs are being rejected with signature errors in staging but not locally:
- The `JWT_SECRET` in the staging environment differs from what was used to
  sign the tokens, OR
- The secret contains invisible characters (copy-paste from a doc with smart
  quotes, trailing newline in the env file)

Resolution: re-issue the secret, redeploy, and ask affected users to log in again.

---

### Check 5 — OTP not arriving

1. Confirm `RESEND_API_KEY` is set in the environment.
2. Confirm the sending domain `gstnoticesupport.in` is verified in the Resend
   dashboard with SPF, DKIM, and DMARC records.
3. Check Resend dashboard → Logs for the specific email address — look for
   delivery failures, bounces, or spam classification.
4. In development: confirm the Resend API key is a test key or that Resend's
   test endpoint is being used (to avoid sending to real addresses during dev).
