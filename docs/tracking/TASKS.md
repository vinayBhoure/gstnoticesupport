# Task Board — gstnoticesupport.in

> Updated after every completed task. Format: `[status] Phase · Layer · Priority — Description`
> Status: `✅ done` · `🔄 in progress` · `⬚ pending` · `⛔ blocked`
> Priority: P1 = must ship · P2 = should ship · P3 = nice to have

---

## Phase 1 — Marketing Site (Launch: 15–16 June 2026)

### EP1 — Project Scaffold, Tooling & Design System
| Status | Task | Notes |
|---|---|---|
| ✅ | Monorepo scaffold — `client/` (Next.js 16) + `server/` (Express + TS) | Independent packages, no shared node_modules |
| ✅ | Tailwind v4 wired to `tokens.css` via `@theme inline` | `client/src/styles/tokens.css` copied from resources |
| ✅ | Inter + JetBrains Mono fonts via `next/font/google` | CSS variables `--font-inter`, `--font-jetbrains-mono` |
| ✅ | UI primitives: `Button`, `Input`, `Card`, `Badge` | `client/src/components/ui/` — tokens.css CSS classes, no hex |
| ✅ | Primitives showcase page (`/`) — SSG verified | EP1 DoD page at `localhost:3000` |
| ✅ | Express server: Helmet, CORS, cookie-parser, `/health` endpoint | Middleware chain per HLD §6.2 |
| ✅ | Server utilities: `ApiError`, `asyncHandler`, `envelope`, `errorHandler` | `server/src/utils/` + `server/src/middleware/` |
| ✅ | `server/.env.example` with `PORT` and `CLIENT_URL` | Phase 1 vars only |

### EP2 — Public Marketing Pages
| Status | Task | Notes |
|---|---|---|
| ✅ | Homepage — all 12 sections (SSG) | Commit `0c53553` |
| ✅ | Service page — GSTAT Appeal | Commit `bee764f` |
| ✅ | Service page — Commissioner Appeal | Commit `bee764f` |
| ✅ | Service page — SCN Reply | Commit `bee764f` |
| ✅ | Service page — ASMT-10 Reply | Commit `bee764f` |
| ✅ | Pricing page (with pre-deposit disclosure for GSTAT + Commissioner) | Commit `8f1060a` |
| ✅ | About page | Commit `2dc6471` |
| ✅ | FAQ page | Commit `6b22f12` — live search, accordion, FAQPage JSON-LD |
| ✅ | Contact page | Commit `8017d8a` — EP2 static (form deferred EP3) |
| ✅ | Shared Navbar component (sticky, services dropdown, mobile drawer) | Commit `0c53553` |
| ✅ | Shared Footer component (4-column, trust signals, legal identity) | Commit `0c53553` |
| ✅ | WhatsApp floating button (appears after first scroll, mobile) | Commit `0c53553` |
| ✅ | Sticky mobile bottom bar (Call + Book Service) | Commit `0c53553` |
| ✅ | Nav active states (`aria-current="page"` via `usePathname`) | Commit `7d64614` |
| ✅ | Custom 404 page (`not-found.tsx`) | Commit `7d64614` |

### EP3 — Lead Capture & Phase 1 Integrations
| Status | Task | Notes |
|---|---|---|
| ✅ | Contact form — RHF + zodResolver + Resend via `/api/contact` Route Handler | D61. React Email template; Reply-To = enquirer; verified via curl + Playwright |
| ✅ | react-hot-toast global Toaster in root layout | `position="bottom-center"`, 5s duration |
| ✅ | WhatsApp click-to-chat redirect | Verified: 4 links, correct number, contextual prefill |
| ✅ | Calendly popup widget integration | `RequestCallbackButton` component; all 14 CTAs across 13 pages/components replaced |
| ✅ | Rate limit on contact endpoint | 3/60min/IP in-memory (`lib/rate-limit.ts`) → `429`; verified via curl. Swap-ready for Upstash |

### EP4 — SEO, Performance & Legal Pages
| Status | Task | Notes |
|---|---|---|
| ✅ | Metadata API — unique title + description per page | `metadataBase` from `NEXT_PUBLIC_SITE_URL`; homepage unique title + canonical; 12 pages have per-page metadata |
| ✅ | OG + Twitter card tags on all public pages | Sitewide `openGraph`/`twitter` defaults in root layout; inherited by all routes |
| ✅ | Generated OG share image | Code-generated 1200×630 via `next/og` (`app/opengraph-image.tsx`); inline SVG check, no font fetch |
| ✅ | Schema.org JSON-LD: `Service`, `Organization`, `FAQPage` | Organization sitewide via public layout; Service ×4 service pages; FAQPage pre-existing. `JsonLd` component + `lib/structured-data.ts` |
| ✅ | `sitemap.xml` — all public routes | `app/sitemap.ts`, 12 routes with priority/changefreq |
| ✅ | `robots.txt` | `app/robots.ts` — Disallow: /dashboard, /admin, /payment, /api; links sitemap |
| ✅ | `<Image>` optimization audit — all `<img>` → `next/image` with `priority` on hero | No raw `<img>` tags in production code; logo uses `priority` |
| 🔄 | Privacy Policy page | Page built; legal identity now via `ORG` env (dummy). Blocked: real legal content |
| 🔄 | Terms & Conditions page | Page built. Blocked: real legal content |
| 🔄 | Refund Policy page | Page built (Razorpay requirement). Blocked: real refund terms |
| ⬚ | Google Analytics GA4 integration | Blocked: Measurement ID pending |
| ⬚ | Google Search Console setup | Blocked: access pending |

### EP4-Addendum — Content Data Layer Refactor
| Status | Task | Notes |
|---|---|---|
| ✅ | Extract all static copy into `client/src/data/` (14 files, 24 types) | All pages/components now render-only; verified pixel-identical against pre-refactor build |

### EP4-Addendum 2 — 5th Service + UI Polish (2026-06-15)
| Status | Task | Notes |
|---|---|---|
| ✅ | Add "Representation Before Authority" as full 5th service across all surfaces | New page, data file, nav/footer, home cards, pricing card, sitemap, reciprocal related links, schema (no offers for consultation) |
| ✅ | Remove "Most Popular" badge and green highlight from SCN Reply | `home.tsx`, `pricing.tsx`, `page.tsx`, `pricing/page.tsx` |
| ✅ | Add "Pre-deposit required by law" amber badge to Commissioner Appeal cards | Home notice card + home pricing tier — matches existing GSTAT badge |
| ✅ | Change rotating headline text colour to accent-green (`--accent-green`) | `RotatingHeadline.module.css` — WCAG AA (~5.9:1 on white) |
| ✅ | Apply serif typeface to navbar brand name | `globals.css` `.brand .bn` → `Georgia,'Times New Roman',serif` |

### EP5 — Phase 1 Hardening & Launch
| Status | Task | Notes |
|---|---|---|
| ⬚ | Hostinger hPanel env vars set for frontend (staging) | Replace: Vercel/Railway tasks no longer applicable |
| ⬚ | Hostinger hPanel env vars set for backend (staging) | Entry point: `dist/index.js` |
| ⬚ | Cloudflare DNS + SSL "Full (strict)" | Blocked: Cloudflare account pending |
| ⬚ | Trust signals (legal name, CIN, GSTIN, address, grievance officer) | Blocked: content pending via env |
| ~~⛔~~ | ~~Production phone number visible in header~~ | Removed — phone eliminated site-wide per 2026-06-10 changelist |
| ⬚ | `/deploy staging` pre + post smoke tests | |
| ⬚ | `staging → main` PR + production deploy | |

---

## Phase 2 — Platform (Launch: 5–6 July 2026)

> Dependency order: EP7 → EP6 → EP8 → EP9 → EP10 → EP11 → EP12 → EP13 → EP14 → EP15
> Maps to `backend_plan.md` phases: EP7=Ph0, EP6=Ph1, EP8=Ph2, EP9=Ph3+4, EP12=Ph5, EP13=Ph6, EP14=Ph7, EP15=Ph8

### EP7 — Backend Core Infrastructure (backend_plan Phase 0)
| Status | Task | Notes |
|---|---|---|
| ✅ | Typed env loader — validate required vars at boot, fail fast with clear message | `server/src/lib/env.ts` |
| ✅ | Rate-limit factory utility (`createRateLimiter`) — not yet attached to routes | `server/src/lib/rateLimiter.ts` |
| ✅ | Full directory layout: `routes/ controllers/ services/ repositories/ middleware/ lib/` | Per `backend_plan.md §Ph0` |
| ✅ | Central `routes/index.ts` router registry — one route file + one line to register | |
| ✅ | Structured request logging middleware (pino-http) | Suppresses `/health`; no PII |
| ✅ | Global 404 handler (before existing `errorHandler`) | `server/src/middleware/notFound.ts` |
| ✅ | Confirm `GET /health` returns standard envelope shape | `{ success: true, data: { status: 'ok' }, ... }` |
| ✅ | Update `.env.example` with all Phase 2 vars | DB, JWT, S3, Razorpay, Resend keys |

### EP6 — Database Schema & Repository Layer (backend_plan Phase 1)
| Status | Task | Notes |
|---|---|---|
| ✅ | Prisma 6.x installed in `server/` | Pinned to 6.x — Prisma 7 requires Node 20.19+; project runs 20.12.2 |
| ✅ | Prisma client singleton in `server/src/lib/prisma.ts` | Single instance; soft-delete middleware wired |
| ✅ | `schema.prisma` — 7 tables, 8 enums, all indexes, `onDelete` rules | users, bookings, booking_documents, payment_records, otp_store, refresh_tokens, token_blacklist |
| ✅ | `payment_records` includes `source` enum + `performed_by_admin_id` nullable FK | D66 applied before migration |
| ✅ | NeonDB connection wired via `DATABASE_URL` in `server/.env` | Credentials in .env (not committed) |
| ✅ | First migration — `20260616142630_initial_schema` applied to NeonDB | `prisma migrate status` clean |
| ✅ | Admin seed script — `role=admin`, `email_verified=true`, bcrypt cost 12 | `prisma/seed.ts`; runs via `npx prisma db seed` |
| ✅ | Prisma middleware in `lib/prisma.ts` for soft-delete global filter on User | Auto-excludes `deletedAt IS NOT NULL` |
| ✅ | `user.repository.ts` — first domain repository: find, create, update, softDelete | Type-safe; no Prisma in services |
| ⬚ | Verify: re-run migration on a fresh Neon branch reproduces schema identically | Staging-branch workflow validation (deferred to staging setup) |

### EP8 — Auth Backend (backend_plan Phase 2)
| Status | Task | Notes |
|---|---|---|
| ✅ | bcrypt password hashing service (cost 12) | Used inline in `auth.service.ts` / `otp.service.ts` (no separate lib file) |
| ✅ | JWT service: issue + verify access token (15 min, carries `id/role/email/jti`) | `lib/jwt.ts`; HTTP-only, Secure(prod), SameSite=Lax cookie |
| ✅ | JWT service: issue + verify refresh token (7 days) — stored **hashed** in `refresh_tokens` | **No rotation** — refresh mints access token only (api_contract §1.6) |
| ✅ | OTP service: 6-digit numeric, hashed in `otp_store`, 10-min expiry, attempt-capped (5), single-use | `otp.service.ts`; deleted on successful verify |
| ✅ | `authenticate` middleware — reads JWT from cookie, attaches `req.user` | `server/src/middleware/authenticate.ts` (checks blacklist) |
| ✅ | `requireRole` middleware — admin gate, always after `authenticate` | `server/src/middleware/requireRole.ts` |
| ✅ | Token blacklist service — logout + "This wasn't me" only | `token.service.ts`; opportunistic cleanup (scheduled job → Ph8) |
| ✅ | Email service abstraction + Resend client | `server/src/lib/email.ts` + `notification.service.ts` + `emails/templates.ts` |
| ⬚ | Ownership-check helper — `WHERE userId = currentUser.id` unless admin | Deferred to EP9 — no user-owned resources exist in auth phase |
| ✅ | `POST /auth/signup` | Creates user, sends OTP + account-created→admin |
| ✅ | `POST /auth/verify-otp` | Flips `email_verified`, sets both cookies |
| ✅ | `POST /auth/resend-otp` | Rate: 3/hr |
| ✅ | `POST /auth/complete-profile` | One-time: name + phone (D67); added `User.phone` column |
| ✅ | `POST /auth/login` | Rate: 5/15min; sends security alert email (IP + UA, D65) |
| ✅ | `POST /auth/refresh` | Mints new access token only (no rotation) |
| ✅ | `POST /auth/logout` | Blacklists access token JTI + revokes refresh row |
| ✅ | `POST /auth/forgot-password` | Rate: 5/hr; neutral response whether email exists |
| ✅ | `POST /auth/reset-password` | OTP-based, single-use; revokes all refresh tokens |
| ✅ | `GET /auth/invalidate` | "This wasn't me" link handler |
| ✅ | `GET /auth/me` | Returns `UserDTO`; `401` without valid cookie |
| ✅ | Apply per-route rate limiters (use factory from EP7) | login/otp-verify/resend/forgot/reset per matrix |
| ⬚ | External: Resend API key + verified `support@gstnoticesupport.in` domain | Key set in `.env`; domain verification → confirm before prod (Ph7/8) |

### EP9 — Booking & Document Upload Backend (backend_plan Phases 3 + 4)
| Status | Task | Notes |
|---|---|---|
| ✅ | Booking Zod schema — service type, contact fields, GSTN format-only, both consents required | `server/src/schemas/booking.schema.ts` (D69) |
| ✅ | Server-side price derivation from `serviceType` — never from client | `lib/pricing.ts` — SERVICE_PRICING map in paise |
| ✅ | Booking state machine enforcement — legal transitions only | `services/booking-state-machine.ts` (D70) |
| ✅ | `POST /bookings` | Creates booking at `status=document_upload`, `payment_status=pending`; emails user + admin |
| ✅ | `GET /bookings` | Lists current user's bookings; ownership enforced, newest-first |
| ✅ | `GET /bookings/:id` | Detail + documents + latest payment; 404 for foreign bookings (D69) |
| ✅ | `POST /bookings/:id/cancel` | Allowed only at `draft_ready` + `payment_status=pending`; 409 INVALID_TRANSITION otherwise |
| ✅ | API test suite — Postman collection "GST Notice Support" + Newman runner (booking lifecycle + document handling) | `test/postman/`; 22 requests / 68 assertions green; admin-login auth, creds injected from `server/.env` at runtime |
| ✅ | S3 client — Mumbai `ap-south-1`, private bucket, SSE-S3 | `server/src/lib/s3.ts`; checksums off for presign, bucket-default SSE-S3 |
| ✅ | Pre-signed PUT URL generation — PDF only, ≤5 MB, ≤8 files/booking, 5-min expiry | Constraints validated server-side; `ContentType`+`ContentLength` signed |
| ✅ | S3 key format: `{userId}/{bookingId}/{yyyyMMdd}-{sanitizedName}-{4rand}.pdf` | `utils/sanitizeFilename.ts`; original `fileName` preserved for display |
| ✅ | `POST /bookings/:id/upload-url` | Rate: 7/hr (per api_contract §4, supersedes earlier 15/hr note) |
| ✅ | `POST /bookings/:id/confirm-upload` | Persists `booking_documents` row; `DUPLICATE_KEY` on duplicate `s3Key`; key-scope check |
| ✅ | `GET /bookings/:id/documents` | Metadata only; `s3Key` never exposed |
| ✅ | `GET /bookings/:id/draft-url` | 15-min pre-signed GET; gated to `status ∈ {filing, complete}`; rate 15/hr |
| ✅ | External: AWS credentials + bucket + IAM (`PutObject`/`GetObject`/`DeleteObject`) | Live PUT→GET round-trip verified; unsigned public read → 403. Browser CORS to confirm when frontend uploads |

### EP10 — Auth Frontend & Route Protection (frontend, backend_plan Phase 2)
| Status | Task | Notes |
|---|---|---|
| ✅ | Typed API client (`lib/api/client.ts`) — envelope unwrap, `ApiRequestError`, 401→refresh→retry | Shared typed gateway; `credentials:include` for cross-origin cookies |
| ✅ | Auth API calls (`lib/api/auth.ts`) — typed payloads via shared Zod schemas | |
| ✅ | Shared Zod schema sync script (`client/scripts/sync-shared-schemas.mjs`) — copies `auth.schema.ts` + `document.schema.ts` from server on `predev`/`prebuild` | Solves Turbopack monorepo boundary; server is sole source of truth |
| ✅ | TanStack Query `Providers` (`app/providers.tsx`) — mounted in root layout | `staleTime:60s`, `retry:1`, `refetchOnWindowFocus:false` |
| ✅ | SSR session helpers (`lib/auth/session.ts`) — `getCurrentUser`, `requireUser`, `requireAdmin`, `redirectIfAuthenticated` | Cookie-forwarding `GET /auth/me`; no client-side token |
| ✅ | Extended `Input` component — password show/hide toggle, `+91` tel prefix, `aria-invalid`, `forwardRef` | |
| ✅ | New `Checkbox` component — `forwardRef`, `label: React.ReactNode`, error + a11y | |
| ✅ | New `OTPInput` component — 6-box, paste distribution, arrow/backspace nav, `inputMode="numeric"` | |
| ✅ | `AuthCardShell` layout component — 440px card, wordmark, trust strip, Privacy/Terms links | |
| ✅ | `(auth)/layout.tsx` passthrough — no Navbar/Footer | |
| ✅ | Login page (`/login`) — RHF + zodResolver + TanStack Query mutation | `EMAIL_NOT_VERIFIED` info banner; generic error (no cred disclosure) |
| ✅ | Signup page (`/signup`) — email + password | Three-generic `useForm` for `.default()` schemas |
| ✅ | OTP verification page (`/verify-otp`) — OTPInput + resend; `useWatch` pattern | |
| ✅ | Complete profile page (`/complete-profile`) — name + phone (D67); one-time gate | Redirects to `/dashboard` if `user.phone` already set |
| ✅ | Forgot password page (`/forgot-password`) — email → sent confirmation; neutral response | |
| ✅ | Reset password page (`/reset-password`) — OTPInput + new password | Reads `?uid` from searchParams |
| ✅ | Auth invalidate page (`/auth/invalidate`) — fully SSR; success/expired/invalid states | "This wasn't me" link; no JSON leak to client |
| ✅ | Dashboard skeleton (`/dashboard`) — SSR, `requireUser()` gate; `LogoutButton` client leaf | Placeholder pending EP11 App Shell |
| ✅ | `(dashboard)/layout.tsx` — `requireUser()` auth gate | Full AppShell deferred to EP11 |
| 🔄 | Live E2E validation — full auth flow against running server (signup → OTP → complete-profile → dashboard → logout → login → forgot/reset) | Pending: requires `server/.env` + Resend live |
| ⬚ | Backend fix: `notification.service.ts` invalidation link → `CLIENT_URL/auth/invalidate?ref=...` (currently points to API URL) | One-line server change; requires user approval |

### EP11 — User Dashboard & Booking Flow Frontend (frontend, backend_plan Phases 3 + 4)
| Status | Task | Notes |
|---|---|---|
| ⬚ | Dashboard home — booking list with status badges | SSR Server Component |
| ⬚ | Booking Step 1 — service selection + pre-deposit disclosure for GSTAT/Commissioner | KB2 §7 — must appear here |
| ⬚ | Booking Step 2 — personal info + GSTN + consents | RHF + zodResolver |
| ⬚ | Booking Step 3 — document upload (multi-file, PDF, ≤5 MB each) | Pre-signed PUT flow |
| ⬚ | Booking detail page — status timeline, documents, admin note, draft viewer | |
| ⬚ | Draft viewer — fetches pre-signed GET URL per load; gated to `filing/complete` | Never store pre-signed URL in state |
| ⬚ | Payment History page — offset pagination + Razorpay receipt links (D64) | |
| ⬚ | My Profile page — view + update name/phone (`PATCH /user/profile`) | |

### EP12 — Payment Integration (backend_plan Phase 5)
| Status | Task | Notes |
|---|---|---|
| ⬚ | `POST /payments/:bookingId/initiate` — create Razorpay Order, insert `payment_records` row at `status=created` | Gated: `status=draft_ready` + `payment_status=pending`; rate: 5/hr |
| ⬚ | `POST /webhooks/razorpay` — `express.raw()`, HMAC-SHA256 verify, idempotency, transition → `filing` | Layer 1; exempt from rate limiting; always returns 200 |
| ⬚ | `GET /payments/verify` — signature verify + Razorpay Fetch Payment API; returns outcome enum | Layer 2; rate: 7/hr; no redirect |
| ⬚ | Idempotency: `razorpay_payment_id` unique constraint — no double-transition | Validated via `payment_records` lookup before any state change |
| ⬚ | Payment confirmed emails — user + admin | Fire inside webhook + verify handlers |
| ⬚ | Failed payment email — admin only | |
| ⬚ | Pay-to-unlock screen frontend — Razorpay modal integration | Pre-deposit disclosure for GSTAT/Commissioner (KB2 §7) |
| ⬚ | `/payment/verify` page frontend — reads outcome enum; shows status + WhatsApp link on Inconclusive | SSR; reads Razorpay query params |
| ⬚ | External: Razorpay test-mode keys (unblocks dev); live-mode KYC approval needed before prod | Start KYC early — longest external blocker |

### EP13 — Admin Dashboard (backend_plan Phase 6)
| Status | Task | Notes |
|---|---|---|
| ⬚ | `GET /admin/bookings` — list all bookings; filter by status | Auth: admin only |
| ⬚ | `GET /admin/bookings/:id` — detail including user info, all documents, all payment attempts | |
| ⬚ | `PATCH /admin/bookings/:id/status` — transitions `→ in_review` and `→ complete` only | Illegal transitions → `INVALID_TRANSITION` |
| ⬚ | `POST /admin/bookings/:id/draft-upload-url` — two-step pre-signed PUT, PDF only | Blocked at `filing/complete/cancelled`; confirmed upload sets `draft_s3_key` + auto-transitions to `draft_ready` |
| ⬚ | `POST /admin/bookings/:id/confirm-draft-upload` | Emails user: draft ready |
| ⬚ | `PATCH /admin/bookings/:id/note` — admin note ≤5000 chars | Visible to user |
| ⬚ | `POST /admin/bookings/:id/mark-paid` — Layer 3 override; calls Razorpay Fetch Payment API first | Uses Phase 5 idempotency service; records `source=admin_override` + `performed_by_admin_id` (D66) |
| ⬚ | `GET /admin/stats` — total bookings by status + revenue | |
| ⬚ | Admin frontend — bookings table, detail view, status controls, draft upload, note editor, mark-paid | |

### EP14 — Email Notifications (backend_plan Phase 7)
| Status | Task | Notes |
|---|---|---|
| ⬚ | React Email templates for all 14 HLD §12.2 events — navy + green branding, typed props | `server/src/emails/` |
| ⬚ | Matrix completeness audit — every event mapped to trigger, recipients, and template | |
| ⬚ | Verify Resend sending domain passes SPF/DKIM/DMARC | External: domain DNS config |
| ⬚ | Confirm contact-form email (admin only) and Calendly (handled by Calendly directly) | |

### EP15 — Phase 2 Hardening & Launch (backend_plan Phase 8)
| Status | Task | Notes |
|---|---|---|
| ⬚ | Rate-limit audit — every endpoint has its limiter attached and tested | Per LLD §6 matrix |
| ⬚ | Account deletion — soft-delete, block when booking active, email confirmation; schedule S3 hard-delete after 7 days | `DELETE /user` |
| ⬚ | `PATCH /user/profile` + `GET /user/payment-history` confirmed (offset pagination, D64) | |
| ⬚ | Sentry integration with PII scrubbing + source maps | |
| ⬚ | Security pass — Helmet config, CORS per env, cookie flags (`Domain=.gstnoticesupport.in`, Secure, HttpOnly, SameSite=Lax) | |
| ⬚ | GitHub Actions CI/CD for `server/` — build + deploy on push to `staging`/`main` | |
| ⬚ | NeonDB staging branch — mirror production schema; validate staging deploy | |
| ⬚ | Cross-subdomain auth validation — authenticated request from frontend domain reaches API subdomain with cookie | |
| ⬚ | Live Razorpay smoke test — real ₹ payment transitions booking to `filing` end-to-end | Requires live-mode KYC approval |
| ⬚ | Production Razorpay key starts with `rzp_live_` — deploying with test key is a critical error | |

---

## Blocked Items (waiting on external input)

| Blocker | Required For | Owner |
|---|---|---|
| Resend API key + verified sender domain | EP3 contact email | Client |
| Calendly account + event URL | EP3 popup | Client |
| Trust signals: legal name, CIN, GSTIN, address, grievance officer, phone | EP2 Footer, EP5 | Client |
| Cloudflare account access | EP5 DNS/SSL | Client |
| GA4 Measurement ID | EP4 analytics | Client |
| Google Search Console access | EP4 | Client |
