# gstnoticesupport.in — API Documentation

Generated from the actual backend implementation (`server/src`, plus three Next.js route handlers in `client/src/app/api`).

## Base URL & Authentication

- **Express API base URL:** `/api/v1` (mounted in `server/src/index.ts`). Health check is unversioned at `/health`.
- **Auth mechanism:** JWT in HTTP-only cookies — `access_token` (12h TTL, path `/`) and `refresh_token` (7 day TTL, path `/api/v1/auth/refresh` only). No `Authorization` header / bearer token support.
- **Response envelope (Express API):**
  - Success: `{ "success": true, "data": <T>, "message"?: string }`
  - Paginated success: `{ "success": true, "data": <T[]>, "meta": { "page", "limit", "total" } }`
  - Error: `{ "success": false, "error": { "code": string, "message": string, "details"?: [{field, message}], "meta"?: object } }`
- **Roles:** `user`, `admin` (Prisma `UserRole` enum). Admin routes require `authenticate` → `requireRole('admin')`.
- The three Next.js route handlers (`/api/contact`, `/api/callback`, `/api/support`) use a different envelope: `{ success, data, error, statusCode }`. Noted separately in §8.

---

## 1. Auth (`/api/v1/auth`)

### POST `/auth/signup`
**Description:** Creates an unverified account and emails a 6‑digit OTP.
**Auth:** None.
**Input (body):**
| Field | Type | Required | Rules |
|---|---|---|---|
| name | string | yes | 2–100 chars |
| email | string | yes | valid email, lowercased |
| password | string | yes | ≥8 chars, upper+lower+digit+special |
| termsAccepted | boolean | yes | must be `true` |
| allowPromotions | boolean | no | default `false` |
**Output:** `201` → `{ userId, maskedEmail }`. Errors: `409 EMAIL_TAKEN` (verified account exists), `409 ACCOUNT_UNVERIFIED` (unverified account exists — re-login instead of re-signup).
**Restrictions:** Rate limit 5 / hour / IP.
**Important behavior:** Sends signup OTP email to the user and an "account created" alert to admin.

### POST `/auth/verify-otp`
**Description:** Verifies the signup OTP and logs the user in.
**Auth:** None.
**Input (body):** `userId` (uuid), `otp` (6 digits).
**Output:** `200` → `{ user }`, sets `access_token`/`refresh_token` cookies. Errors: `404 NOT_FOUND`, `409 ALREADY_VERIFIED`, `400 OTP_INVALID` (with `meta.attemptsLeft`), `400 OTP_EXPIRED`, `400 OTP_MAX_ATTEMPTS`.
**Restrictions:** Rate limit 5 / 10 min / IP.
**Important behavior:** OTP expires in 10 min, max 5 attempts, single-use. Fires a best-effort welcome email after verification.

### POST `/auth/resend-otp`
**Description:** Re-issues an OTP for signup verification or password reset.
**Auth:** None.
**Input (body):** `userId` (uuid), `purpose` (`email_verification` | `password_reset`, default `email_verification`).
**Output:** `200` → `null`. Errors: `404 NOT_FOUND`, `409 ALREADY_VERIFIED` (verification purpose on an already-verified account), `429 OTP_COOLDOWN`.
**Restrictions:** Rate limit 3 / hour / IP. Per-account cooldown of 60s between OTP issues (same purpose), enforced in the DB.

### POST `/auth/complete-profile`
**Description:** One-time completion of name + phone after signup.
**Auth:** Required (any role).
**Input (body):** `name` (2–100 chars), `phone` (Indian mobile, `^[6-9]\d{9}$`).
**Output:** `200` → `{ user }`. Errors: `404 NOT_FOUND`, `409 CONFLICT` (profile already completed — phone already set), `409 PHONE_TAKEN`.
**Important behavior:** Fires a best-effort WhatsApp welcome message once the phone is on file.

### POST `/auth/check-phone`
**Description:** Checks whether a mobile number is available (used by live validation during profile completion).
**Auth:** Required.
**Input (body):** `phone` (Indian mobile).
**Output:** `200` → `{ available: boolean }`.
**Restrictions:** Rate limit 30 / 15 min / IP.

### POST `/auth/login`
**Description:** Authenticates by email OR phone + password.
**Auth:** None.
**Input (body):** exactly one of `email` / `phone`, plus `password`.
**Output:** `200` → `{ user }`, sets auth cookies. Errors: `401 INVALID_CREDENTIALS` (identical message for unknown identifier or wrong password — no account-existence leak), `403 EMAIL_NOT_VERIFIED` (re-issues a signup OTP; `meta` includes `userId`/`maskedEmail`).
**Restrictions:** Rate limit 5 / 15 min / IP.
**Important behavior:** Sends "new login" alert email(s) to the user containing the invalidate link (see `/auth/invalidate`).

### POST `/auth/refresh`
**Description:** Issues a new access token from the refresh-token cookie.
**Auth:** Refresh cookie required (not the standard `authenticate` middleware).
**Input:** None (reads `refresh_token` cookie).
**Output:** `200` → `null`, sets new `access_token` cookie. Errors: `401 UNAUTHORIZED` (missing/invalid/expired refresh token, or its DB record is gone/expired).
**Restrictions:** Rate limit 60 / hour, keyed by a hash of the refresh-token cookie (falls back to IP if no cookie present).

### POST `/auth/logout`
**Description:** Revokes the current session.
**Auth:** Required.
**Output:** `200` → `null`, clears both auth cookies.
**Important behavior:** Blacklists the current access-token `jti` and revokes the refresh token (if present).

### POST `/auth/forgot-password`
**Description:** Sends a password-reset OTP.
**Auth:** None.
**Input (body):** `email`.
**Output:** `200` → `null`. Errors: `404 NOT_FOUND` (deliberately discloses unknown email — a documented UX trade-off).
**Restrictions:** Rate limit 5 / hour / IP.

### POST `/auth/reset-password`
**Description:** Resets password using an OTP, and logs the user in if their account is verified.
**Auth:** None.
**Input (body):** `userId`, `otp`, `newPassword` (same strength rules as signup), `confirmPassword` (must match).
**Output:** `200` → `{ emailVerified, user }`; sets auth cookies only when `emailVerified` is `true`. Errors: `404 NOT_FOUND`, plus OTP errors (`OTP_INVALID`/`OTP_EXPIRED`/`OTP_MAX_ATTEMPTS`).
**Restrictions:** Rate limit 5 / 10 min / IP.
**Important behavior:** Revokes all existing refresh tokens and stamps a session cut-off, invalidating every access token issued before this moment on any device.

### POST `/auth/change-password`
**Description:** Changes password for a signed-in user.
**Auth:** Required.
**Input (body):** `currentPassword`, `newPassword`.
**Output:** `200` → `null`, re-issues fresh auth cookies for the calling device. Errors: `404 NOT_FOUND`, `401 INVALID_CREDENTIALS` (wrong current password).
**Restrictions:** Rate limit 5 / 10 min / IP (shares the reset-password limiter).
**Important behavior:** Revokes all sessions (all devices) then immediately re-issues a session for the caller only.

### GET `/auth/invalidate`
**Description:** "This wasn't me" link from login-alert emails — blacklists a specific access-token session.
**Auth:** None (token identifies the session via `ref`).
**Input (query):** `ref` (uuid — the access token's `jti`).
**Output:** `200` → `null`. Errors: `404 NOT_FOUND` (already invalidated / unknown ref).

### GET `/auth/me`
**Description:** Returns the current authenticated user.
**Auth:** Required.
**Output:** `200` → `{ user }`. Errors: `401 UNAUTHORIZED`.

---

## 2. User Account (`/api/v1/user`)

All routes require authentication.

### GET `/user/payment-history`
**Description:** Lists the user's captured payments only.
**Input (query):** `page` (default 1), `limit` (default 20, max 100).
**Output:** `200` → paginated `PaymentHistoryItemDTO[]` (`id, bookingId, serviceType, bookingStatus, razorpayOrderId, razorpayPaymentId, amountPaise, currency, status, createdAt`).
**Important behavior:** Offset pagination; only `captured`/successful payment records are returned.

### PATCH `/user/profile`
**Description:** Updates name, phone, and/or promotions preference.
**Input (body):** `name`, `phone`, `allowPromotions` — all optional but at least one required. Email and `interestedServices` are never editable here.
**Output:** `200` → `{ user }`. Errors: `404 NOT_FOUND`, `409 PHONE_TAKEN`.

### DELETE `/user`
**Description:** Self-service account closure.
**Input (body):** `confirmEmail` (must match the account's email, case-insensitive).
**Output:** `200` → `null`, clears auth cookies. Errors: `404 NOT_FOUND`, `400 EMAIL_MISMATCH`, `409 ACTIVE_BOOKINGS` (any non-terminal booking blocks deletion).
**Important behavior:** Soft-delete only (`deletedAt` stamped) — bookings and payment records are retained for 6–8 years. All sessions (all devices) are revoked. Associated S3 documents are hard-deleted 7 days later by a scheduled job.

---

## 3. Bookings (`/api/v1/bookings`)

All routes require authentication and enforce booking ownership (cross-user access returns `404`, not `403`, to avoid existence leaks).

### POST `/bookings`
**Description:** Creates a new booking.
**Input (body):**
| Field | Type | Required | Rules |
|---|---|---|---|
| serviceType | enum | yes | `asmt_10`\|`scn`\|`commissioner_appeal`\|`gstat_appeal`\|`representation` |
| contactName | string | yes | 2–100 chars |
| contactEmail | string | yes | valid email |
| contactPhone | string | yes | 7–20 chars, `^\+?[0-9]{7,15}$` |
| organizationName | string | no | ≤255 chars |
| filingFor | enum | yes | `self`\|`others` |
| gstn | string | no | 15 chars, canonical GSTIN format if provided |
| consentInformationAccurate | boolean | yes | must be `true` |
| consentContactAuthorized | boolean | yes | must be `true` |
**Output:** `201` → `{ booking }` (status starts at `document_upload`). Errors: `429 BOOKING_LIMIT`.
**Restrictions:** Daily cap of 30 bookings per user (DB-enforced).
**Important behavior:** Fires best-effort "booking created" emails to the account holder and admin.

### GET `/bookings`
**Description:** Lists all bookings owned by the current user (summary view).
**Output:** `200` → `BookingSummaryDTO[]` (no pagination).

### GET `/bookings/:id`
**Description:** Full booking detail including documents and latest payment record.
**Input (path):** `id` (uuid).
**Output:** `200` → `{ booking }`. Errors: `404 NOT_FOUND`.

### POST `/bookings/:id/cancel`
**Description:** Cancels a booking.
**Output:** `200` → `{ booking }` (status → `cancelled`). Errors: `404 NOT_FOUND`, `409 INVALID_TRANSITION`.
**Important behavior:** Only allowed when status is `draft_ready` AND payment is still `pending` — a captured payment can never be cancelled (no admin-side cancellation either, by product decision).

### POST `/bookings/:id/upload-url`
**Description:** Issues a pre-signed S3 PUT URL for a user document.
**Input (body):** `fileName` (≤255 chars), `fileSize` (positive int), `contentType`.
**Output:** `200` → `{ uploadUrl, s3Key, expiresAt }`. Errors: `404 NOT_FOUND`, `400 INVALID_FILE_TYPE` (non-PDF), `400 FILE_TOO_LARGE`, `409 INVALID_STATUS` (booking not in `document_upload`), `409 FILE_LIMIT_REACHED`.
**Restrictions:** Max file size 5 MB; max 8 documents per booking; rate limit 7 uploads / hour / user. Upload URL expires in 5 minutes.
**Important behavior:** Files never pass through Express — direct browser→S3 PUT.

### POST `/bookings/:id/confirm-upload`
**Description:** Confirms an S3 upload and records the document.
**Input (body):** `s3Key` (≤512 chars), `fileName` (≤255 chars).
**Output:** `201` → `{ document }`. Errors: `404 NOT_FOUND`, `400 VALIDATION_ERROR` (`s3Key` doesn't belong to this user/booking), `409 DUPLICATE_KEY`.
**Important behavior:** DB unique constraint on `s3Key` backstops a race between two confirms of the same key. First upload for a booking triggers a best-effort "documents uploaded" admin email.

### GET `/bookings/:id/documents`
**Description:** Lists documents attached to a booking.
**Output:** `200` → `{ documents: BookingDocumentDTO[] }`. Errors: `404 NOT_FOUND`. (`s3Key` is never exposed in the response.)

### DELETE `/bookings/:id/documents/:docId`
**Description:** Removes a user-uploaded document.
**Output:** `200` → `null`. Errors: `404 NOT_FOUND` (booking, or document not found / not user-uploaded), `409 INVALID_STATUS` (booking has moved past `document_upload`).
**Important behavior:** DB row is deleted first; the S3 object delete is best-effort (an orphaned object is swept by an S3 lifecycle policy).

### GET `/bookings/:id/draft-url`
**Description:** Issues a pre-signed download URL for the case draft.
**Input (query):** `variant` (`original`\|`final`, optional — defaults to `final` if one exists, else `original`).
**Output:** `200` → `{ draftUrl, expiresAt }`. Errors: `404 NOT_FOUND` (booking, or no draft uploaded for the requested variant), `403 DRAFT_NOT_ACCESSIBLE`.
**Restrictions:** Rate limit 15 / hour / user. URL expires in 15 minutes, generated fresh per request — never stored.
**Important behavior:** Accessible only once status is `filing` or `complete` (i.e., after payment) — the pre-payment draft is gated behind the payment flow at this endpoint.

---

## 4. Payments (`/api/v1/payments`)

All routes require authentication.

### POST `/payments/:bookingId/initiate`
**Description:** Creates (or reuses) a Razorpay Order for a booking.
**Input (path):** `bookingId` (uuid).
**Output:** `201` → `InitiateOrderDTO` (`orderId, amountPaise, currency, keyId, prefill{name,email,contact}, callbackUrl`). Errors: `404 NOT_FOUND`, `409 PAYMENT_ALREADY_CAPTURED`, `409 INVALID_STATUS` (booking not `draft_ready`), `409 QUOTE_REQUIRED` (representation booking with no admin-set quote), `502 RAZORPAY_ERROR`.
**Restrictions:** Rate limit 5 / hour / user.
**Important behavior:** Price is always derived server-side (fixed price map, or admin's per-booking quote for `representation`) — never trusts a client-supplied amount. Reuses an existing open order instead of creating a duplicate on retry/double-click (one active order per booking).

### GET `/payments/verify`
**Description:** Client-side fallback verification after the Razorpay checkout redirect (Layer 2 of the payment reliability design; the primary path is the webhook).
**Input (query):** `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`, `booking_id` (uuid) — all required.
**Output:** `200` → `{ outcome: "success"|"failed"|"inconclusive"|"tampered", bookingId? }`. Never redirects — the outcome drives client-side UI.
**Restrictions:** Rate limit 7 / hour / user.
**Important behavior:** Verifies the redirect's HMAC-SHA256 signature (`order_id|payment_id` over the Razorpay key secret) before trusting any field; confirms booking ownership; cross-checks the payment against Razorpay's Fetch Payment API before capturing. On `captured`, applies the same idempotent capture logic used by the webhook (booking → `filing`), so double-processing with the webhook is safe.

---

## 5. Admin — Bookings (`/api/v1/admin`)

All routes require `authenticate` + `requireRole('admin')`.

### GET `/admin/bookings`
**Description:** Lists/searches/filters all bookings.
**Input (query):** `page`, `limit` (max 100), `status`, `paymentStatus`, `serviceType`, `search` (matches owning user's name/email, case-insensitive), `sortBy` (`createdAt`\|`updatedAt`, default `createdAt`), `sortDir` (`asc`\|`desc`, default `desc`).
**Output:** `200` → paginated `AdminBookingListItemDTO[]` (includes owning user summary).

### GET `/admin/bookings/:id`
**Description:** Full admin booking detail, including all documents, full payment record history, and `hasDraft` flag.
**Output:** `200` → `{ booking }`. Errors: `404 NOT_FOUND`.

### PATCH `/admin/bookings/:id/status`
**Description:** Manually transitions a booking's status.
**Input (body):** `status` — only `in_review` or `complete` (the two admin-driven transitions; other transitions are system/user-driven).
**Output:** `200` → `{ booking }`. Errors: `404 NOT_FOUND`, `409 INVALID_TRANSITION` (illegal for the current status per the state machine).
**Important behavior:** Sends a status-change email (`in_review` or `complete`) to the account holder.

### POST `/admin/bookings/:id/draft-upload-url`
**Description:** Issues a pre-signed S3 PUT URL for the pre-payment draft.
**Input (body):** `fileName`, `fileSize`, `contentType`.
**Output:** `200` → `{ uploadUrl, s3Key, expiresAt }`. Errors: `404 NOT_FOUND`, `400 INVALID_FILE_TYPE`, `400 FILE_TOO_LARGE`, `409 DRAFT_LOCKED` (booking not `in_review`/`draft_ready`).
**Restrictions:** Max draft size 20 MB; rate limit 15 / hour.

### POST `/admin/bookings/:id/draft-confirm`
**Description:** Confirms the draft upload and transitions the booking to `draft_ready`.
**Input (body):** `s3Key` (must be prefixed `drafts/{bookingId}-`), `fileName`, `quotedAmountPaise` (required for `representation` bookings only, ₹500–₹1,00,000; rejected for other service types).
**Output:** `200` → `{ booking }`. Errors: `404 NOT_FOUND`, `400 VALIDATION_ERROR` (key mismatch, or quote provided/missing incorrectly), `409 DRAFT_LOCKED`, `400 QUOTE_REQUIRED`.
**Important behavior:** First draft for the booking emails "draft ready" to the user; a re-upload while still `draft_ready` emails "draft updated" instead. No `booking_documents` row is created for the draft — delivered solely via the draft pointer.

### POST `/admin/bookings/:id/final-draft-upload-url`
**Description:** Issues a pre-signed S3 PUT URL for the post-payment final draft.
**Input/Output/Restrictions:** Same shape and limits as the pre-payment draft-upload-url. Errors additionally include `409 DRAFT_LOCKED` when the booking has not reached `filing`/`complete`.

### POST `/admin/bookings/:id/final-draft-confirm`
**Description:** Confirms the final draft upload.
**Input (body):** `s3Key` (must be prefixed `final-drafts/{bookingId}-`), `fileName`.
**Output:** `200` → `{ booking }`. Errors: `404 NOT_FOUND`, `400 VALIDATION_ERROR`, `409 DRAFT_LOCKED`.
**Important behavior:** Does not change booking status. First upload emails "final draft ready"; a replacement emails "final draft updated". The original pre-payment draft is left intact.

### PATCH `/admin/bookings/:id/note`
**Description:** Sets or clears the internal admin note on a booking.
**Input (body):** `note` (≤5000 chars; empty string clears it).
**Output:** `200` → `{ booking }`. Errors: `404 NOT_FOUND`.

### POST `/admin/bookings/:id/mark-paid`
**Description:** Manual payment override (Layer 3 of the payment reliability design) when the webhook and verify-page paths both failed to reconcile.
**Input (body):** `razorpayPaymentId`.
**Output:** `200` → `{ booking }` (→ `filing`). Errors: `404 NOT_FOUND`, `409 INVALID_STATUS` / `409 PAYMENT_ALREADY_CAPTURED` (via `assertPayable`), `502 RAZORPAY_ERROR`, `422 PAYMENT_NOT_CAPTURED` (Razorpay does not report `captured`, or the payment's order does not belong to this booking).
**Important behavior:** Always calls Razorpay's Fetch Payment API first — never blindly trusts the admin's input. Applies the same idempotent capture core used by the webhook/verify flows.

### GET `/admin/bookings/:id/documents/:documentId/download-url`
**Description:** Pre-signed download URL for a user-uploaded document (admin-only access).
**Output:** `200` → `{ downloadUrl, fileName, expiresAt }`. Errors: `404 NOT_FOUND` (booking or document).
**Important behavior:** URL forces `Content-Disposition: attachment` with the original filename; expires in 15 minutes.

### GET `/admin/stats`
**Description:** Dashboard aggregate counts and revenue.
**Output:** `200` → `{ totalBookings, byStatus, byServiceType, totalRevenuePaise }` (all status/service-type keys always present, zero-filled).
**Important behavior:** Cached in-process for 30 seconds — the three aggregate queries are recomputed together so the cached snapshot stays internally consistent.

---

## 6. Admin — Users (`/api/v1/admin`)

### GET `/admin/users`
**Description:** Lists/searches platform users.
**Input (query):** `page`, `limit` (max 100), `search` (name/email, case-insensitive).
**Output:** `200` → paginated `AdminUserListItemDTO[]`.

### GET `/admin/users/:id`
**Description:** User detail including their count of active (non-terminal) bookings.
**Output:** `200` → `{ user }`. Errors: `404 NOT_FOUND` (also 404s if the target is an admin, not a `user`-role account).

### DELETE `/admin/users/:id`
**Description:** Soft-deletes a user account.
**Output:** `200` → `null`. Errors: `404 NOT_FOUND`, `409 USER_HAS_ACTIVE_BOOKINGS`.
**Important behavior:** Soft-delete only; bookings/payment records are retained.

---

## 7. Webhooks (mounted directly in `server/src/index.ts`, outside `/api/v1` router; not for frontend consumption)

### POST `/api/v1/webhooks/razorpay`
**Description:** Razorpay's server-to-server payment event notification (Layer 1 — primary payment reliability path).
**Auth:** HMAC-SHA256 signature via `X-Razorpay-Signature` header, verified over the **raw** request body.
**Input:** Razorpay event JSON (`payment.captured`, `payment.failed` are handled; others are silently ignored).
**Output:** `200 { success: true }` on any successfully-processed or no-op delivery (so Razorpay stops retrying); `400` (empty body) on missing/invalid signature or unparseable JSON.
**Restrictions:** Exempt from all rate limiters (registered before the global limiter) so Razorpay's retry mechanism is never throttled.
**Important behavior:** Registered with `express.raw()` before `express.json()` — the signature must be computed over the untouched buffer. Idempotent: a duplicate `razorpay_payment_id` is a no-op. Never logs the payload.

### GET `/api/v1/webhooks/whatsapp`
**Description:** Meta WhatsApp Cloud API verification handshake.
**Auth:** `hub.verify_token` query param must match `WHATSAPP_VERIFY_TOKEN`.
**Output:** `200` with the raw `hub.challenge` string (plain text, not JSON) on success; `403` otherwise.

### POST `/api/v1/webhooks/whatsapp`
**Description:** WhatsApp Cloud API event delivery (status/message log-only stub).
**Auth:** HMAC-SHA256 via `X-Hub-Signature-256`, verified over the raw body.
**Output:** `200` immediately after signature check (ack-first, fire-and-forget logging after); `401` on invalid/missing signature.
**Important behavior:** No DB writes or message processing — logs only event type + message id (never phone numbers, content, or tokens), and only when `WHATSAPP_ENABLED` is true.

---

## 8. Next.js Route Handlers (`client/src/app/api/*`) — separate app, separate envelope

These run inside the Next.js app (not the Express API) and respond with `{ success, data, error, statusCode }`.

### POST `/api/contact`
**Description:** Sends the public Contact page enquiry to the admin inbox via Resend.
**Auth:** None.
**Input (body):** `name` (≥2 chars), `mobile` (Indian mobile), `email` (valid email), `query` (≥20 chars).
**Output:** `200` → `{ sent: true }`. Errors: `400` (bad JSON or validation failure), `500` (email service not configured), `502` (Resend send failed).
**Restrictions:** In-memory rate limit: 3 requests / 60 min, keyed by client IP (`X-Forwarded-For`). Best-effort only — resets on serverless cold start.

### POST `/api/callback`
**Description:** Internal admin alert fired when a Calendly callback is scheduled.
**Auth:** None.
**Input (body):** `eventUri` (valid URL), `inviteeUri` (valid URL) — Calendly's `onEventScheduled` payload shape.
**Output:** `200` → `{ sent: true }`. Errors: same classes as `/api/contact`.
**Restrictions:** Same 3/60min per-IP limiter.
**Important behavior:** This is an internal notification only — the user-facing confirmation is Calendly's own email.

### POST `/api/support`
**Description:** Authenticated Help & Support form submission.
**Auth:** Required — session read via `getCurrentUser()` (same auth cookie as the Express API).
**Input (body):** `title` (3–120 chars), `message` (20–4000 chars). Identity (`name`/`email`/`phone`) comes from the session, never the request body.
**Output:** `200` → `{ sent: true }`. Errors: `401` (no session), `400`, `429`, `500`, `502`.
**Restrictions:** Rate limit 3 / 60 min, keyed by user id.
**Important behavior:** Sends the support request to the admin inbox, then a best-effort confirmation email to the user (its failure does not fail the request).

---

## 9. Health

### GET `/health`
**Description:** Liveness/readiness probe for the deploy pipeline.
**Auth:** None.
**Output:** `200` → `{ status: "ok" }` when the database is reachable; `503 DATABASE_UNAVAILABLE` otherwise.
**Important behavior:** Used as the blue-green deploy promotion gate — a container that boots but can't reach the database must fail this check.
