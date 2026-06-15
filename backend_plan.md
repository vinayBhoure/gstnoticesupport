The 8 Phases at a Glance

┌───────┬───────────────────────────────────────────────────────────┬────────────────────────────────────┐
│ Phase │                           Focus                           │        External Dependency         │
├───────┼───────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 0     │ Foundation — middleware chain, security, directory layout │ None                               │
├───────┼───────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 1     │ Data Layer — Prisma + NeonDB, migrations, seed            │ NeonDB connection string           │
├───────┼───────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 2     │ Auth + Identity — JWT, OTP, email service abstraction     │ Resend API key + verified domain   │
├───────┼───────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 3     │ Booking Lifecycle — creation, state machine, cancellation │ Depends on 0–2                     │
├───────┼───────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 4     │ Document Handling — pre-signed S3 PUT/GET                 │ AWS credentials + bucket           │
├───────┼───────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 5     │ Payments — Razorpay 3-layer reliability                   │ Razorpay keys + webhook secret     │
├───────┼───────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 6     │ Admin Surface — case management, mark-paid override       │ Depends on 0–5                     │
├───────┼───────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 7     │ Notification Matrix Audit — email templates QA            │ Resend domain fully verified       │
├───────┼───────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 8     │ Hardening + Deploy — Nginx, PM2, CI/CD, Sentry            │ DNS, Cloudflare, live Razorpay KYC │
└───────┴───────────────────────────────────────────────────────────┴────────────────────────────────────┘

# gstnoticesupport.in — Backend Development Roadmap

> **Audience:** Backend developer(s) planning and implementing the Phase 2 platform server.
> **Stack (locked):** Node.js + Express.js + TypeScript · PostgreSQL on NeonDB · Prisma · Zod · JWT (HTTP-only cookies, refresh rotation) · AWS S3 (pre-signed URLs) · Resend · Razorpay · express-rate-limit (in-memory).
> **Sources of truth:** `gstnoticesupport_HLD.md`, `gstnoticesupport_LLD.md`, `api_contract.md`, `schema.prisma`. Where this roadmap and a source file disagree, the source file wins.
> **Sequencing model:** Feature-sequential, not time-boxed. Each phase is self-contained, independently testable in Postman, and ordered so that every phase only depends on phases before it. No phase requires revisiting an earlier phase's code (rework-minimizing dependency order).

---

## How to read this document

Each phase lists: **Objective · Modules · Dependencies/Prerequisites · Database changes · APIs · Third-party integrations · Deliverables · Acceptance criteria.**

Two cross-cutting conventions apply to *every* phase and are not repeated:

1. **Layering:** `route → Zod validator (middleware) → auth/role middleware → controller (asyncHandler-wrapped) → service (business logic) → repository (Prisma)`. Controllers never import Prisma; services never touch `req`/`res`.
2. **Response envelope + error catalogue:** every response (success or failure) uses the existing `envelope.ts` shape; every thrown error is an `ApiError` with a code/status drawn from `api_contract.md`. No ad-hoc error shapes.

**Notifications are woven in, not deferred.** Each feature phase wires its own emails *at the transition point where they fire* (e.g. the "new booking" email is written when booking creation is built in Phase 3, not retrofitted later). Phase 7 only verifies completeness and polishes templates — it is not the first time emails are sent.

---

## Phase 0 — Foundation Hardening

**Objective**
Turn the current bare scaffold (Express + TS + health check + `errorHandler.ts` + `ApiError`/`asyncHandler`/`envelope` utils) into a production-shaped app skeleton that every later phase plugs into without restructuring.

**Modules to build**
- Typed environment loader (validate required env vars at boot; fail fast with a clear message if missing).
- Security middleware chain: Helmet, CORS (credentials enabled, origin from env, per-environment), `cookie-parser`, JSON body parser (with the Razorpay webhook route deliberately excluded — see Phase 5).
- `express-rate-limit` factory utility (per-endpoint limiter builder; not yet attached to routes).
- Directory layout: `routes/ controllers/ services/ repositories/ validators/ middleware/ lib/` and a central `routes/index.ts` router registry.
- Structured request logging + a global 404 handler ahead of the existing error handler.

**Dependencies / prerequisites**
- Existing scaffold (present). No external accounts required.

**Database changes**
- None.

**APIs**
- None beyond the existing health check. Confirm `GET /health` returns the standard envelope.

**Third-party integrations**
- None.

**Deliverables**
- App boots with full middleware chain; `.env.example` lists every variable the loader requires.
- Router registry in place so a new domain = one route file + one registry line.

**Acceptance criteria**
- Server refuses to start when a required env var is missing.
- `GET /health` returns `200` in envelope shape via Postman.
- A deliberately thrown `ApiError` and an unexpected error both return the correct envelope and status.
- CORS pre-flight from the configured frontend origin succeeds; an unlisted origin is rejected.

---

## Phase 1 — Data Layer (Prisma + NeonDB)

**Objective**
Stand up the database and a type-safe data-access foundation. The schema is already locked in `schema.prisma`, so this phase is *apply and wire*, not *design*.

**Modules to build**
- Prisma initialization in `server/` pointing at the locked `schema.prisma`.
- Prisma client singleton in `lib/` (single instance, reused across the app).
- First migration creating all 7 tables and 7 enums.
- Seed script that creates exactly one `admin` user via direct insert (role assigned only here — no promotion endpoint exists anywhere).
- Repository-layer base pattern (one repository file per domain, introduced as each domain lands).

**Dependencies / prerequisites**
- Phase 0.
- **NeonDB connection string** for the dev branch (you will supply `DATABASE_URL` in chat).
- Decision confirmed: rate-limit state is in-memory (`express-rate-limit`), so **no** `rate_limit_counters` table — matches the schema's deliberate omission.

**Database changes**
- Initial migration: `users`, `bookings`, `booking_documents`, `payment_records`, `otp_store`, `refresh_tokens`, `token_blacklist`. All enums, indexes, `onDelete` rules (`Restrict` on booking→user, `Cascade` on documents/payments/otp/refresh) exactly as in `schema.prisma`.

**APIs**
- None.

**Third-party integrations**
- NeonDB (provisioning + connection only).

**Deliverables**
- `prisma migrate` runs clean against the NeonDB dev branch.
- Generated Prisma client available; seed creates the single admin.

**Acceptance criteria**
- `prisma migrate status` shows the migration applied; tables visible in Neon console.
- Seeded admin exists with `role = admin`, `email_verified = true`.
- A throwaway repository query returns typed results.
- Re-running the migration on a fresh Neon branch reproduces the schema identically (validates the staging-branch workflow early).

---

## Phase 2 — Authentication & Identity

**Objective**
Implement the complete account lifecycle and the auth primitives every later authenticated/admin endpoint depends on. This is a critical-path phase — allocate the strongest model and the most review here.

**Modules to build**
- Password hashing (bcrypt, cost 12).
- JWT issue/verify: 15-min access token (carries `id`, `role`, `email`, `jti`), 7-day refresh token; both as `HttpOnly; Secure; SameSite=Lax` cookies. Refresh tokens stored **hashed** in `refresh_tokens`; refresh rotates the stored token.
- OTP service: 6-digit numeric, hashed in `otp_store`, 10-min expiry, attempt-capped, single-use (deleted on success).
- `AuthMiddleware` (verify signature + not-blacklisted) and `RoleMiddleware` (admin gate).
- Token blacklist service (logout + "This wasn't me" only — scope is locked, do not extend) with 24h auto-cleanup tied to access-token expiry.
- **Email service abstraction** + Resend client (used here for OTP, password-reset OTP, login security alert, account-created→admin, account-deleted). This abstraction is what later phases call.
- Ownership-check helper used by the repository layer (`WHERE userId = currentUser.id` unless admin).

**Dependencies / prerequisites**
- Phases 0–1.
- **Resend API key** + a verified sending domain (`support@gstnoticesupport.in`) with SPF/DKIM/DMARC. (Domain verification can lag; OTP flows can be tested against Resend's sandbox first.)

**Database changes**
- None (tables already created in Phase 1). This phase *uses* `users`, `otp_store`, `refresh_tokens`, `token_blacklist`.

**APIs** (`api_contract.md §1`)
- `POST /auth/signup`, `POST /auth/verify-otp`, `POST /auth/resend-otp`, `POST /auth/complete-profile`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/invalidate`, `GET /auth/me`.
- Rate limits applied per route now: login 5/15min, OTP gen 3/hr, OTP verify 5/10min, forgot-password 5/hr.

**Third-party integrations**
- Resend (transactional email — established here).

**Deliverables**
- Full signup → OTP verify → complete-profile → login → refresh → logout cycle working end-to-end.
- Forgot/reset-password cycle working.
- Login security-alert email with a working "This wasn't me" invalidation link.

**Acceptance criteria (Postman)**
- Signup creates `email_verified = false`, sends OTP; verify flips it true and sets both cookies.
- `forgot-password` returns the same neutral message whether or not the email exists (no enumeration).
- Expired/wrong/over-attempt OTP each return the correct documented error code.
- `GET /auth/me` succeeds with a valid access cookie, `401` without.
- After `refresh`, a new access cookie is issued and the old one's behavior matches spec.
- After `logout`, the access token's JTI is blacklisted and reuse returns `401`.
- An `admin`-seeded account passes `RoleMiddleware`; a `user` account is rejected `403`.

---

## Phase 3 — Booking Lifecycle (user-facing core)

**Objective**
Implement booking creation, listing, detail, cancellation, and the booking state machine — the spine the whole product hangs off.

**Modules to build**
- Booking intake Zod schema (service type, contact fields, `filingFor`, GSTN **format-only** validation, both consent booleans required true).
- **Server-side price derivation** from `serviceType` (₹2,999 / ₹5,999 / ₹9,999 / ₹14,999) — price is never read from the client.
- Booking state machine enforcement: legal transitions only; cancel allowed **only** at `draft_ready` + `payment_status = pending`.
- Ownership enforcement on every read/write (via the Phase 2 helper).
- Inline emails: "new booking submitted" → user + admin; "user cancels" → user + admin.

**Dependencies / prerequisites**
- Phases 0–2 (needs auth + email service + ownership helper).

**Database changes**
- None (uses `bookings`). New booking rows are created at `status = document_upload`, `payment_status = pending`.

**APIs** (`api_contract.md §3`)
- `POST /bookings` (create), `GET /bookings` (list, current user), `GET /bookings/:id` (detail + documents + latest payment), `POST /bookings/:id/cancel`.

**Third-party integrations**
- Resend (booking + cancellation emails, via the Phase 2 abstraction).

**Deliverables**
- A user can create a booking and see it in their list and detail views.
- Cancellation works only within its allowed gate and emails both parties.

**Acceptance criteria (Postman)**
- Creating a booking with a client-supplied price field ignores it; stored amount is derived server-side.
- Invalid GSTN format and missing consents are rejected with `VALIDATION_ERROR`.
- `GET /bookings/:id` for another user's booking returns `403`.
- Cancel on a booking not in `draft_ready` (or already paid) returns `INVALID_TRANSITION`.
- New-booking emails arrive for both user and admin.

---

## Phase 4 — Document Handling (AWS S3)

**Objective**
Enable direct browser→S3 document upload via pre-signed URLs, persist metadata, and gate draft access. The backend never proxies file bytes.

**Modules to build**
- S3 client (Mumbai `ap-south-1`, private bucket, SSE-S3).
- Pre-signed `PUT` URL generation with server-side enforcement: PDF only, ≤5 MB, ≤8 files/booking, S3 key = `{userId}-{yyyyMMdd}-{sanitizedName}-{4rand}.pdf` (sanitize the user filename; preserve the original separately for display). 5-min expiry.
- Two-step upload: issue URL → client PUTs to S3 → confirm-upload persists the `booking_documents` row.
- Pre-signed `GET` URL for draft viewing, gated to `status ∈ {filing, complete}`, 15-min expiry.

**Dependencies / prerequisites**
- Phases 0–3 (uploads attach to a booking; ownership enforced).
- **AWS credentials + bucket name** (you will supply in chat), bucket CORS allowing `PUT` from the frontend origin only.

**Database changes**
- None (uses `booking_documents`).

**APIs** (`api_contract.md §4`)
- `POST /bookings/:id/upload-url`, `POST /bookings/:id/confirm-upload`, `GET /bookings/:id/documents`, `GET /bookings/:id/draft-url`.
- Rate limits: signed-URL generation 15/hr, user upload 7/hr.

**Third-party integrations**
- AWS S3.

**Deliverables**
- End-to-end user document upload working through pre-signed URLs.
- Draft-URL endpoint returns a working signed link only when the gate is open.

**Acceptance criteria (Postman + S3)**
- `upload-url` blocked when booking ≠ `document_upload`, file is non-PDF, >5 MB, or 8 files already present (each returns its documented code).
- A PUT to the returned URL succeeds; `confirm-upload` creates exactly one row; duplicate `s3Key` returns `DUPLICATE_KEY`.
- `draft-url` returns `DRAFT_NOT_ACCESSIBLE` while status is `draft_ready`, and a valid signed URL once `filing`/`complete`.
- The S3 key follows the locked naming pattern; the bucket rejects public reads.

---

## Phase 5 — Payments (Razorpay, 3-layer reliability)

**Objective**
Implement the draft-gated payment mechanic with the locked three-layer reliability architecture. Critical-path phase — strongest model, heaviest review, idempotency is non-negotiable.

**Modules to build**
- **Order creation** (`payments/:bookingId/initiate`): create a Razorpay Order, insert a `payment_records` row at `status = created`; gate to `status = draft_ready` + `payment_status = pending`; amount derived server-side.
- **Layer 1 — Webhook** (`POST /webhooks/razorpay`): a dedicated route mounted with **`express.raw()`** (HMAC-SHA256 over the *raw* body). Verify signature → reject if invalid. Idempotency via the unique `razorpay_payment_id`. On a new captured payment: transition booking → `filing`, set `payment_records.status = captured`, `payment_status = paid`, fire emails. **Always return 200** to Razorpay (even on duplicates/no-ops). Excluded from rate limiting.
- **Layer 2 — Verify** (`GET /payments/verify`): signature-verify query params, call Razorpay Fetch Payment API synchronously, apply the same idempotency check, return a JSON outcome enum (does **not** redirect directly).
- **Layer 3 — Admin override** lives in Phase 6 but shares this phase's idempotency/transition service.
- Inline emails: payment confirmed → user + admin; failed payment → admin only.

**Dependencies / prerequisites**
- Phases 0–4 (payment unlocks a draft that must already exist).
- **Razorpay key/secret + webhook secret** (live-mode KYC approval is the main external blocker — start it early; test-mode keys unblock all development).

**Database changes**
- None (uses `payment_records`; note the deliberate absence of a unique constraint on `booking_id` — multiple attempt rows are expected).

**APIs** (`api_contract.md §5`)
- `POST /payments/:bookingId/initiate`, `GET /payments/verify`, `POST /webhooks/razorpay`.
- Rate limits: initiate 5/hr, verify 7/hr; webhook exempt.

**Third-party integrations**
- Razorpay (Orders API, webhook, Fetch Payment API).

**Deliverables**
- A user can pay for a `draft_ready` booking; webhook transitions it to `filing` and unlocks the draft.
- Verify page fallback produces the correct outcome when the user returns before the webhook fires.

**Acceptance criteria**
- A webhook with a tampered/invalid signature is rejected and changes nothing.
- The same `payment_payment_id` delivered twice transitions the booking exactly once (idempotency holds); webhook still returns 200 both times.
- `initiate` on a non-`draft_ready` booking returns `INVALID_STATUS`; on an already-paid booking returns `PAYMENT_ALREADY_CAPTURED`.
- Verify returns the documented outcome enum for captured / failed / inconclusive without performing a redirect.
- Payment-confirmed emails reach user and admin; a failed attempt notifies admin only.

---

## Phase 6 — Admin Surface

**Objective**
Give the single admin everything needed to run a case: review bookings, transition status, upload drafts, add notes, manually override payment, and view overview stats.

**Modules to build**
- Admin booking list + detail (detail exposes user info, documents, and **all** payment attempts).
- Manual status transitions limited to `→ in_review` and `→ complete` (the others are system/user driven).
- Admin draft upload (two-step pre-signed `PUT`, PDF only, allowed at `in_review` or `draft_ready` re-upload, blocked at `filing`/`complete`/`cancelled`); confirming the upload sets `draft_s3_key` and auto-transitions to `draft_ready`.
- Admin note set/update (`admin_note`, ≤5000 chars, visible to user).
- **Layer 3 — `mark-paid`** override: admin supplies a `razorpayPaymentId`; backend calls Razorpay Fetch Payment API and only transitions if genuinely `captured` (admin cannot fabricate a payment). Reuses Phase 5's transition/idempotency service.
- Overview stats (total bookings, by status, revenue).
- Inline emails: draft-ready, draft-updated (re-upload), status→complete.

**Dependencies / prerequisites**
- Phases 0–5 (depends on auth/RBAC, bookings, documents, and the payment transition service).
- Admin upload rate limit: 15/hr.

**Database changes**
- None (uses `bookings`, `booking_documents`, `payment_records`).

**APIs** (`api_contract.md §6`)
- `GET /admin/bookings`, `GET /admin/bookings/:id`, `PATCH /admin/bookings/:id/status`, `POST /admin/bookings/:id/draft-upload-url`, draft-upload confirm, `PATCH /admin/bookings/:id/note`, `POST /admin/bookings/:id/mark-paid`, `GET /admin/stats`.

**Third-party integrations**
- AWS S3 (admin draft upload), Razorpay (Fetch Payment API for override), Resend (status emails).

**Deliverables**
- Full admin case-handling loop: review → in_review → draft upload → draft_ready → (payment or override) → filing → complete.

**Acceptance criteria (Postman)**
- All `/admin/*` routes reject non-admin tokens with `403`.
- `status` accepts only `in_review`/`complete`; illegal transitions return `INVALID_TRANSITION`.
- Draft upload is blocked once `filing`/`complete`/`cancelled`; a confirmed upload auto-sets `draft_ready` and emails the user.
- `mark-paid` with a `razorpayPaymentId` that Razorpay reports as not captured returns `PAYMENT_NOT_CAPTURED` and changes nothing.
- `GET /admin/stats` returns correct counts/revenue against seeded data.

---

## Phase 7 — Notification Matrix Completion & Email QA

**Objective**
Confirm the full 14-event email matrix fires correctly and bring templates to launch quality. (The *sending* was wired inline in Phases 2/3/5/6; this phase audits and polishes.)

**Modules to build**
- React Email (or equivalent JSX) templates for every event, brand-styled (navy + green), typed props.
- A matrix-completeness check mapping each HLD §12.2 event to its trigger and recipients.

**Dependencies / prerequisites**
- Phases 2–6 (all triggering transitions must exist).
- Resend sending domain fully verified (SPF/DKIM/DMARC) — close out before production.

**Database changes**
- None.

**APIs**
- None (no new endpoints).

**Third-party integrations**
- Resend.

**Deliverables**
- Every event in the notification matrix has a finished template and a verified trigger.

**Acceptance criteria**
- Each of the 14 matrix events sends to exactly the documented recipients (user / admin / both) and to no one else.
- Templates render correctly in major mail clients; sender domain passes SPF/DKIM/DMARC checks.
- Calendly demo + contact-form emails confirmed (contact form → admin only; Calendly handled by Calendly directly).

---

## Phase 8 — Hardening, Observability & Deployment

**Objective**
Make the server production-ready and cut it over to live, validating the two highest-risk integration points (cross-subdomain cookies, live Razorpay) before launch.

**Modules to build**
- Rate-limit audit: confirm every endpoint in the §6 matrix has its limiter attached and behaving.
- Account-deletion flow finalization: soft-delete user, block when any booking is active, email-string confirmation; schedule hard-delete of S3 documents 7 days later.
- Sentry integration with PII scrubbing and source maps.
- Security pass: Helmet config, CORS per environment, cookie flags (`Domain=.gstnoticesupport.in`, Secure, HttpOnly, SameSite=Lax), no PII in URLs.
- Deployment: Nginx reverse proxy + PM2 (cluster) + Certbot on the KVM 2 VPS; backend on `api.gstnoticesupport.in`; GitHub Actions CI/CD.
- NeonDB staging branch + a skeleton staging deploy used to validate cookies/CORS early.

**Dependencies / prerequisites**
- All prior phases.
- DNS records for the API subdomain; Razorpay webhook URL registered; Razorpay live-mode KYC approved.

**Database changes**
- None functional. Confirm the staging branch mirrors production schema via Neon branching.

**APIs**
- `DELETE /user` finalized; `PATCH /user/profile` and `GET /user/payment-history` confirmed (`api_contract.md §2`).

**Third-party integrations**
- Cloudflare (Full strict TLS, Razorpay IP allow-rule), Sentry, GitHub Actions, NeonDB (staging branch).

**Deliverables**
- Staging environment validating cross-subdomain auth; production cutover; live Razorpay smoke test passed.

**Acceptance criteria**
- An authenticated request from the staging frontend domain reaches the API subdomain with the cookie attached (cross-subdomain auth proven before production).
- Account deletion is blocked while a booking is active and succeeds otherwise; S3 docs are gone after the 7-day window.
- A real ₹-amount live Razorpay payment transitions a booking to `filing` end-to-end.
- Sentry captures a deliberately thrown error with PII scrubbed; every rate-limited endpoint enforces its documented limit.

---

## Dependency graph (at a glance)

```
Phase 0  Foundation
   └─ Phase 1  Data Layer
        └─ Phase 2  Auth + Email service
             ├─ Phase 3  Bookings
             │    ├─ Phase 4  Documents
             │    └─ Phase 5  Payments ──┐
             │                           │
             └────────── Phase 6  Admin ◄┘ (needs auth, bookings, documents, payment service)
                              └─ Phase 7  Notification completion (audits 2/3/5/6)
                                   └─ Phase 8  Hardening + Deploy
```

## Locked invariants the team must not break (carry through every phase)

- Draft-gated payment is the core mechanic — never bypass it in any code path.
- Price is always derived server-side from `serviceType`; never trusted from the client.
- `razorpay_payment_id` uniqueness is the sole payment idempotency source — do not weaken it.
- `payment_records` has no unique constraint on `booking_id` (retry history is intentional).
- `booking_documents` has no `user_id` (ownership inherited via booking).
- Razorpay webhook uses per-route `express.raw()` and always returns 200.
- JWT durations: 15-min access / 7-day refresh; refresh tokens stored hashed.
- Token blacklist is for logout + "This wasn't me" only — do not expand scope.
- Single admin role, assigned by DB seed only — no promotion endpoint.
- Documents go browser→S3 direct via pre-signed URLs; the backend never proxies bytes.
- Add endpoints only if they exist in `api_contract.md`; a new endpoint is a contract decision, not an implementation one.

## Open items — all resolved (2026-06-16)

- ~~Payment History pagination strategy and invoice source~~ → **D64**: offset-based (default 20, max 100) + Razorpay receipt URL; no in-house PDF.
- ~~Login security-alert email content~~ → **D65**: IP address + sanitized User-Agent (max 200 chars) only; no geolocation API.
- ~~Admin override audit fields~~ → **D66**: `source` enum (`webhook | verify | admin_override`) + `performed_by_admin_id` nullable FK added to `payment_records`; a new row with `source=admin_override` is inserted on `mark-paid`.
- ~~Profile-completion vs settings field scope~~ → **D67**: `complete-profile` collects `name` + `phone` only; `PATCH /user/profile` handles later updates.

> **Side note for the team:** the Claude Code skills currently under `skills/user/` (`auth-flow`, `zod-validation`, `api-endpoint`) describe a *different* project ("Stratum CMS" — `/api/v1` base, `masterAdmin`, PUT-not-PATCH, RTK Query). They do **not** match gstnoticesupport's locked conventions and should be replaced or removed before use, or they'll misguide implementation.