# gstnoticesupport.in — Low-Level Design (LLD)

> **Status:** Locked for implementation
> **Phase:** 2 (Full Platform)
> **Depends on:** `gstnoticesupport_HLD.md`, `gstnoticesupport_project_knowledge_base_1.md`, `gstnoticesupport_project_knowledge_base_2.md`, `design.md`, `platform_interaction_flows.md`
> **Note:** Detailed Prisma schema and per-endpoint API contracts will be finalized in a follow-up session. This document locks the structural decisions.

---

## 1. Project Summary

A two-zone GST litigation services platform: public marketing site + authenticated platform for booking ASMT-10 replies, SCN replies, Commissioner Appeals, and GSTAT Appeals. The platform manages the document/draft workflow; actual government portal filing happens off-platform.

**Primary objective (Phase 2):** Implement user authentication, booking workflow, document upload, admin draft delivery, draft-gated single payment, and case status tracking.

---

## 2. Core Requirements

### Functional

- Email + password signup with OTP email verification.
- Multiple-service interest capture at signup (informational only).
- Single-service bookings; users may have any number of active or repeat bookings.
- Intake form per booking: contact details, organization name, filing-for-self/others, GSTN, two consent flags.
- User document upload (PDF only, ≤5 MB, ≤8 files per booking).
- Admin manual workflow: download user documents, draft offline, upload draft PDF + optional admin note.
- Draft-gated single payment via Razorpay; user pays after seeing locked draft.
- Three-layer payment reliability: webhook + verification page + admin override.
- Booking lifecycle state machine with email notifications at major transitions.
- Account deletion gated on active bookings.
- Login security alerts with token invalidation link.

### Non-Functional

- One administrator role only at launch.
- Multiple concurrent user sessions allowed.
- Login attempts and sensitive actions are rate-limited.
- All draft PDFs and user documents served via short-lived pre-signed S3 URLs; no public S3 URLs.
- No SMS, no WhatsApp API automation, no in-platform messaging.
- No refunds (now or in future).
- English-only at launch.

---

## 3. Key Decisions

| Area | Decision | Reason |
|---|---|---|
| User roles | `user`, `admin` only | No staff/sub-admin in scope |
| Password complexity | Enforced via Zod (FE+BE) only, DB stores `VARCHAR(255)` | DB-level check adds no value; validation is application concern |
| Consent flags on user | `terms_accepted`, `allow_promotions` separate | Legal compliance requires explicit terms acceptance |
| Email verification | `email_verified` boolean on user | OTP-based auth requires verified emails to access platform |
| Interested services | Stored on `users` as multi-value enum, captured at signup, non-editable | Informational/lead qualification only; does not gate behavior |
| Intake data storage | Flat columns on `bookings` | Type safety, indexability, validation; fields are fixed |
| Service per booking | One service per booking | Each booking is independent unit |
| Multi-booking by user | Unlimited concurrent + repeat bookings allowed | Real users have multiple notices over time |
| Admin notes | Single editable `admin_note` text column on `bookings` | Single admin, no audit trail needed |
| Document storage | Separate `booking_documents` table; `user_id` not stored there | Avoid denormalization drift; join cost negligible at scale |
| Document metadata | `file_name`, `uploaded_at`, `uploaded_by` (`user`/`admin`) | Minimum required for display and access tracking |
| Payment model | Single full payment after draft upload | Confirmed via client questionnaire; no EMI, no partial |
| Payment records | Multiple rows per booking (one per attempt); no unique constraint on `booking_id` | Preserves failure history for admin visibility |
| Razorpay IDs stored | Both `order_id` (NOT NULL UNIQUE) and `payment_id` (NULL until paid, UNIQUE) | Order ID for linkage; payment ID for idempotency |
| Payment amount unit | Paise (integer) | Razorpay native format; avoids float rounding |
| Refund handling | Not implemented, ever | Client policy |
| `payment_status` enum on bookings | `pending`, `paid`, `failed` | Minimal user-facing payment states |
| `status` enum on payment_records | `created`, `authorized`, `captured`, `failed` (no `refunded`) | Mirrors Razorpay states the platform actually encounters |
| Booking status enum | `document_upload`, `in_review`, `draft_ready`, `filing`, `complete`, `cancelled` | Locked in HLD |
| OTP | 6-digit numeric, 10 min validity, max 3 requests/hour, hashed before storage | Standard for India market |
| JWT access token | 15 min expiry | Industry standard for trust-sensitive platform |
| JWT refresh token | 7 days, stored server-side in DB | Required for revocation |
| JWT payload | `sub` (user.id), `role`, `email`, `iat`, `exp` | Minimum needed for auth + authorization |
| Sessions | Multiple concurrent sessions allowed | Simplifies model; no device confirmation |
| Token blacklist | Used only for logout + "This wasn't me" link from login alert; auto-cleaned within 24h | Minimal blacklist surface |
| Login alerts | Pattern A — security alert on every login (user + admin) with invalidation link | Reinforces trust-first positioning |
| New device confirmation | Dropped | Replaced by login alert + invalidation link |
| File naming | `userId-yyyyMMdd-sanitizedFileName-<4RandomChars>.pdf` | Sanitized to avoid S3-key issues from user input |
| File constraints | PDF only, 5 MB max, 8 files max per booking | Enforced both FE and BE |
| Pre-signed upload URL | 5 min expiry, scoped S3 key, content-length range constraint | From HLD §14.4 |
| Pre-signed download URL | 15 min expiry, generated fresh per page load | From HLD §9.4 |
| Razorpay flow | Orders flow, not Payment Links | Clean booking↔payment linkage (HLD D45) |
| Payment reliability | 3-layer: webhook (HMAC-SHA256 signature verified) → verify page → admin override | HLD §10 / KB2 §5 |
| Payment verify screen states | Loading, Inconclusive, Tampered | Success/Failed redirect to service detail page |

---

## 4. System Design

### Components

| Component | Responsibility |
|---|---|
| Public Marketing Site (Next.js SSG) | Homepage, service pages, pricing, about, contact, FAQ, terms, privacy |
| Auth Service (nodejs (express js)) | Signup, OTP verify, login, forgot password, session/blacklist management |
| User Dashboard (Next.js SSR) | Bookings list, booking detail, booking flow, draft viewer, payment history |
| Admin Dashboard (Next.js SSR, desktop-first) | Bookings list, booking detail, draft upload, settings |
| Booking Service (nodejs (express js)) | Booking CRUD, state transitions, intake validation, status gates |
| Document Service (nodejs (express js)) | Pre-signed URL generation, metadata persistence, access control |
| Payment Service (nodejs (express js)) | Razorpay order creation, webhook handler, verification, admin override |
| Notification Service (nodejs (express js) + Resend) | Email dispatch per event matrix |
| Storage (AWS S3, Mumbai) | User docs + draft PDFs, private bucket, signed URL access only |
| Database (PostgreSQL) | Relational data, transactional consistency for payments |
| Rate Limiter (middleware) | Per-endpoint enforcement |

### Responsibilities (Zone Mapping)

- **Zone 1 — Public:** Static, lead capture only.
- **Zone 2 — Auth:** Signup → OTP → profile completion → login; shared layout.
- **Zone 3 — User Dashboard:** Authenticated; booking lifecycle UX.
- **Zone 4 — Payment Verification:** `/payment/verify`; dedicated chromeless page.
- **Zone 5 — Admin:** Desktop-first; minimal mobile fallback.

### Data Flow

**Booking creation → draft delivery → payment → completion**

1. User submits booking form (intake + service type + consents) → row in `bookings` (`status=document_upload`, `payment_status=pending`).
2. User uploads documents → pre-signed PUT to S3 → row(s) in `booking_documents` (`uploaded_by=user`).
3. Admin manually downloads docs (out of system), drafts offline.
4. Admin sets booking to `in_review` (manual transition).
5. Admin uploads draft PDF → `bookings.draft_s3_key` set, status auto → `draft_ready`. Email to user.
6. Admin (optionally) writes/edits `bookings.admin_note`.
7. User views locked draft placeholder + admin note. Two paths:
   - **Pay:** Backend creates Razorpay Order → row in `payment_records` (`status=created`). User completes payment in Razorpay modal → redirected to `/payment/verify`.
     - Webhook (Layer 1) verifies HMAC-SHA256, checks `razorpay_payment_id` uniqueness, transitions booking to `filing`, updates `payment_records.status=captured`, sets `payment_status=paid`. Sends emails.
     - Verify page (Layer 2) fallback: synchronous Razorpay Fetch Payment API.
     - Admin override (Layer 3) at `draft_ready` with pending/failed payment: requires Razorpay API verification.
   - **Cancel:** Status → `cancelled`. Emails to user + admin.
8. Admin completes off-platform filing → marks booking `complete`. User email sent.

**Login security alert flow**
1. User/Admin successful login → JWT issued.
2. Notification Service sends alert email with timestamp + device info + invalidation link containing token reference.
3. If user clicks "This wasn't me" → that specific token added to blacklist.

---

## 5. Data Model

Detailed schema (column types, constraints, indexes) will be finalized in a follow-up database design session. The locked structure:

### `users`
`id`, `name`, `email` (unique), `hashed_password`, `role` (`user`/`admin`), `email_verified`, `terms_accepted`, `allow_promotions`, `interested_services` (enum array), `created_at`, `updated_at`

### `bookings`
`id`, `user_id` (FK), `service_type` (enum), `status` (enum), `payment_status` (enum), `contact_name`, `contact_email`, `contact_phone`, `organization_name` (nullable), `filing_for` (enum: `self`/`others`), `gstn`, `consent_information_accurate`, `consent_contact_authorized`, `draft_s3_key` (nullable), `admin_note` (nullable), `created_at`, `updated_at`

### `booking_documents`
`id`, `booking_id` (FK), `uploaded_by` (enum: `user`/`admin`), `file_name`, `s3_key` (unique), `uploaded_at`

### `payment_records`
`id`, `booking_id` (FK, **not unique**), `razorpay_order_id` (unique), `razorpay_payment_id` (nullable, unique), `amount` (paise, integer), `currency` (default `INR`), `status` (enum), `created_at`, `updated_at`

### Auxiliary tables (to be designed in next session)
- OTP store (hashed OTP, expiry, attempt count)
- Refresh token store (server-side JWT refresh tokens)
- Token blacklist (logout + invalidation; auto-expire ≤24h)
- Rate limit counters (or use external store, e.g. Redis — **decision pending**)

---

## 6. Rate Limit Matrix

| Endpoint | Limit | Window |
|---|---|---|
| Login | 5 attempts | 15 min |
| OTP generation | 3 requests | 1 hour |
| OTP verification | 5 attempts | 10 min |
| Forgot password | 5 requests | 1 hour |
| Contact form | 3 submissions | 1 hour |
| Signed URL generation | 15 requests | 1 hour |
| User file upload | 7 uploads | 1 hour |
| Admin file upload | 15 uploads | 1 hour |
| Payment initiation | 5 attempts | 1 hour |
| Payment verification | 7 requests | 1 hour |
| Public API (general) | 50 requests | 1 hour |

Razorpay webhook is exempt from rate limiting (per HLD §6.6).

---

## 7. Constraints

### Technical

- Frontend: Next.js + TypeScript + shadcn (Hostinger Business plan, Node.js app at `gstnoticesupport.in`).
- Backend: Node.js + Express.js (Hostinger Business plan, Node.js app at `api.gstnoticesupport.in`, entry point `dist/index.js`).
- DB: PostgreSQL (Supabase under consideration for consolidation).
- Storage: AWS S3 Mumbai (or Supabase Storage).
- Payments: Razorpay Orders flow only.
- Email: Resend or Postmark.
- Zod schemas shared between FE and BE for validation parity.
- GSTN validated by format only (no external API).
- No PII in URL query parameters.
- All HTTPS; Helmet hardening; explicit CORS origins with credentials.
- Console logging during dev/test; Sentry (or equivalent) before production.

### Business

- Single admin account only.
- No refunds.
- No in-platform messaging; communications via WhatsApp/email outside system.
- Government portal filing is off-platform.
- Draft is final at point of payment — no re-upload after `filing`.
- Cancellation allowed only at `draft_ready`.
- Account deletion blocked when any booking is in active state.

---

## 8. Risks & Edge Cases

### Payment

- **Webhook missed/delayed:** Covered by Layer 2 (verify page) and Layer 3 (admin override).
- **Duplicate webhook delivery:** Prevented by `razorpay_payment_id` unique constraint.
- **Tampered redirect URL:** Detected by signature verification; verify screen shows Tampered state.
- **Inconclusive payment status from Razorpay API:** Verify screen shows Inconclusive state with pre-filled WhatsApp link including booking reference.
- **User retries after failed payment:** New `payment_records` row created with new `razorpay_order_id`; previous failed row retained.
- **Wrong draft paid for:** No platform-level recovery; handled via WhatsApp/email (off-platform).

### Documents

- **User filename contains special chars / Unicode:** Sanitized before S3 key construction; original `file_name` preserved in DB for display.
- **Pre-signed URL leaked:** 15 min expiry; 5 min for upload URLs.
- **Account soft-deleted with documents:** S3 objects hard-deleted after 7-day grace period (HLD §9.6).

### Authentication

- **"This wasn't me" clicked from alert email:** Specific token added to blacklist; other concurrent sessions remain valid (user can revoke each independently).
- **Token blacklist growing:** Auto-cleanup within 24h tied to access-token expiry.
- **OTP request flood:** Capped at 3/hour per user.

### State Machine

- **Admin re-uploads draft after `filing`:** Blocked at controller level.
- **User attempts cancel after `filing`:** Blocked; UI hides cancel control past `draft_ready`.
- **Concurrent booking submissions by same user:** Allowed; no constraint.

---

## 9. Open Questions

| # | Question |
|---|---|
| 1 | Rate limiter implementation: in-memory, Redis, or DB-backed? Affects deployment topology. |
| 2 | Auxiliary table schema details (OTP store, refresh token store, blacklist) — to be defined in next DB session. |
| 3 | Exact API contract payloads, status codes, and Zod schema definitions — separate session. |
| 4 | Login security alert email content: what device/location data is shown? IP geolocation source? |
| 5 | Admin override (Layer 3) UI: what fields are captured, what audit is recorded? |
| 6 | Email template structure and branding — pending client approval on copy. |
| 7 | Forgot-password flow specifics (OTP vs link, expiry, single-use) — **Unknown**. |
| 8 | Profile completion fields beyond signup — **Unknown**. |
| 9 | Settings screen content for both user and admin — **Unknown**. |
| 10 | Payment History screen data source: derived from `payment_records` joined with `bookings`? Pagination strategy? |
| 11 | Invoice generation: PDF in-app, emailed only, or both? Storage of invoices? — **Unknown**. |
| 12 | Whether `interested_services` is required at signup or optional. |
| 13 | What "Profile Completion" screen captures that signup doesn't. |

---

## 10. Future Work

Deferred from Phase 2:

- Multiple admin / staff roles.
- In-platform messaging (admin ↔ user).
- WhatsApp API automation (only redirect button at launch).
- Refunds (explicitly never).
- EMI / partial payments.
- Hindi / regional language support.
- Document re-upload mid-service.
- Final filed document delivery on platform.
- Testimonials, case studies, Google Business Profile embed.
- Device fingerprinting for smarter login alerts.

---

## 11. Context Handoff

### For Engineers

- Read HLD + KB1 + KB2 + this document before any work.
- Razorpay integration follows the locked 3-layer flow — do not collapse into a single layer.
- The draft-gated payment is the **core product mechanic**; do not bypass it in any code path.
- All sensitive endpoints are rate-limited; the table in §6 is authoritative.
- Filenames from users must be sanitized before S3 key construction. Originals preserved separately.
- `razorpay_payment_id` uniqueness is the single source of payment idempotency — do not weaken this.
- The blacklist table is **only** for logout and "This wasn't me" — do not expand its scope.
- Document uploads always go direct browser → S3 via pre-signed PUT; backend never proxies file bytes.

### For LLMs

**Assumptions:**
- Single admin role at launch; no multi-admin code paths anywhere.
- Sessions are stateless from the user's perspective (multiple concurrent allowed).
- No refunds, no partial payments, no EMI — anywhere in the system.
- Government portal filing is fully off-platform.
- All emails go through Resend or Postmark (provider TBD); no SMS, no WhatsApp API.

**Locked decisions — do not change without explicit review:**
- 4-table schema structure (users, bookings, booking_documents, payment_records).
- `payment_records` has no unique constraint on `booking_id`.
- `booking_documents` has no `user_id`.
- Booking state machine and transitions.
- Razorpay Orders flow + 3-layer reliability architecture.
- 15 min / 7 day JWT durations.
- Rate limit matrix in §6.
- File constraints: PDF / 5MB / 8 files.

**Areas open to refinement:**
- API contract payloads.
- Auxiliary table schemas.
- Rate limiter implementation choice.
- Email template content.

### Decision Timeline

1. Database scope set to 4 tables: users, bookings, booking_documents, payment_records.
2. Password complexity moved out of DB constraint into Zod.
3. Added `email_verified`, `terms_accepted` to users; kept `allow_promotions`.
4. Intake data on `bookings`: flat columns chosen over JSON.
5. `interested_services` placed on `users` (signup-time, non-editable, informational).
6. One service per booking; unlimited concurrent and repeat bookings per user.
7. `admin_notes` collapsed into single `admin_note` text column on `bookings`.
8. `user_id` removed from `booking_documents`; `booking_id` is sole FK.
9. Document metadata limited to `file_name`, `uploaded_at`, `uploaded_by`.
10. Payment model confirmed: single full payment after draft, no refunds ever.
11. Both Razorpay `order_id` and `payment_id` stored; `payment_id` is idempotency key.
12. Multiple payment records per booking allowed (Option A).
13. `payment_status` enum: pending/paid/failed.
14. `payment_records.status` enum: created/authorized/captured/failed (no `refunded`).
15. JWT stored server-side; refresh token in DB.
16. New device confirmation flow dropped; multiple concurrent sessions allowed.
17. Blacklist scoped to logout + "This wasn't me" link only.
18. Login security alert (Pattern A) retained for both user and admin.
19. Access token 15 min, refresh token 7 days.
20. Rate limit matrix locked (§6).
21. Filenames sanitized before S3 key construction.
22. HLD payment decisions inherited as-is; LLD fills gaps only.
23. Payment verify screen states: Loading, Inconclusive, Tampered (Success/Failed are redirects).

---

*End of LLD document.*
