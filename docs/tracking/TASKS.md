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

### EP4-Addendum 3 — Landing Page UI Refinement Pass (2026-07-04)
| Status | Task | Notes |
|---|---|---|
| ✅ | Remove "Request Callback" and "Sign Up" from nav (desktop, mobile drawer, mobile sticky bar) | `Navbar.tsx`, `NavAuthActions.tsx`, `ScrollShell.tsx`, `data/common.ts` |
| ✅ | Service-page "Book Service" CTAs route to `/dashboard/bookings/new` with guest login+return | New `BookServiceButton` + `sanitizeReturnTo`; extends D86, see D88 |
| ✅ | Center "Choose Your Service" card content; move pre-deposit badge above price | `(public)/page.tsx` + `page.module.css` |
| ✅ | Remove testimonials CA tab; default to Business Owners; show business name above quote | `data/testimonials.ts`, `data/types.ts`, `Testimonials.tsx` |
| ✅ | Unify homepage pricing tiers with `/pricing` page spacing/typography | `page.module.css` `.tiers` block — see D88 |

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
| ✅ | Live E2E validation — full auth flow against running server (signup → OTP → complete-profile → dashboard → logout → login → forgot/reset) | Done 2026-07-30 (D107) — `server/scripts/verify-auth-flow.ts`, 34/34 against a live server + real DB; seeds OTPs directly so no Resend delivery is needed. Browser pass on the abandoned-signup recovery |
| ✅ | Unverified-account recovery — login re-issues the code and routes to `/verify-otp`; signup distinguishes verified vs unverified duplicates | D107 |
| ✅ | OTP purpose separation (`email_verification` / `password_reset`) — a reset code can no longer verify an email | D107, migration `add_otp_purpose_and_sessions_valid_from` |
| ✅ | `sessions_valid_from` — password reset/change invalidates every other device immediately | D107 |
| ✅ | Reset-password Confirm Password field, live password checklist, strength meter | D107 |
| ✅ | OTP screens: 10:00 expiry countdown, 60s resend cooldown, 3-resend cap, autofocus, masked email | D107 — 60s (not the prototype's 30s) to match the server cooldown |
| ⬚ | Normalise legacy `User.phone` values, then add the `@unique` constraint | Still open from D101; unchanged by D107 |
| ✅ | Backend fix: `notification.service.ts` invalidation link → `CLIENT_URL/auth/invalidate?ref=...` (currently points to API URL) | Done EP11 — D75 |

### EP11 — User Dashboard & Booking Flow Frontend (frontend, backend_plan Phases 3 + 4)
| Status | Task | Notes |
|---|---|---|
| ✅ | Dashboard home — booking list with status badges | SSR Server Component; `bookingApi.list` cookie-forwarded |
| ✅ | Booking Step 1 — service selection + pre-deposit disclosure for GSTAT/Commissioner | KB2 §7 — `PreDepositNotice` |
| ✅ | Booking Step 2 — personal info + GSTN + consents | RHF + zodResolver (synced `booking.schema.ts`) |
| ✅ | Booking Step 3 — document upload (multi-file, PDF, ≤5 MB each) | `DocumentUpload`: pre-signed PUT → confirm |
| ✅ | Booking detail page — status info, documents, admin note, status-dependent action panel | Pay-to-unlock deferred (no payment backend); cancel wired |
| ✅ | Draft viewer — fetches pre-signed GET URL per load; gated to `filing/complete` | Never stores URL; 15-min countdown + regenerate |
| ✅ | `lib/api/booking.ts` + `lib/api/document.ts` typed surfaces; `loading.tsx`/`error.tsx`; `booking.schema` sync unblock; auth/invalidate email link fix | EP11 supporting work |
| ✅ | UI parity pass — dashboard App Shell (sidebar/topbar/drawer), Dashboard Home, booking wizard Steps 1–3 (focused flow shell), Service Detail action panels, Draft Viewer 4-state viewer | `feature/phase-2/ui-parity`; exact match to `resources/ui` prototypes (D80); restyle only, no API/behaviour change |
| ✅ | Payment History page — offset pagination (D64); captured payments only; receipt/view links → Service Detail (D83) | SSR Server Component; `userApi.paymentHistory`; reuses `Pagination`/`StatusBadge`; desktop table + mobile cards |
| ✅ | My Services page — full booking list with All/Active/Complete/Cancelled filter; desktop table + mobile `BookingCard` | SSR + `ServicesListView` client filter; rows → Service Detail; `/dashboard/services` |
| ✅ | Settings page — Account (name/mobile/marketing), Security (change password), Danger zone (close account); Phase-2 scope only (D84) | `PATCH /user/profile` + `POST /auth/change-password` + `DELETE /user`; 2FA/sessions/billing/export/language omitted per HLD §19 |
| ✅ | Mobile bottom tab bar added to `DashboardShell` (Dashboard/Services/Payments/Settings); sidebar + drawer links wired (D80h closed) | <lg only; all four target pages now exist |
| ✅ | My Profile page — read-only view (avatar/name/member-since, email/phone/services/promotions/terms) | Edit now available on Settings page (EP15) |
| ✅ | Help & Support page — `/dashboard/help` + `/admin/help`, shared `HelpSupportForm`; sidebar link no longer redirects to public Contact page | `POST /api/support` (Next.js Route Handler); reuses Contact's Resend flow; identity from session, not request body; sends support-inbox email + user confirmation email; `SUPPORT_TO_EMAIL` env var |

### EP12 — Payment Integration (backend_plan Phase 5)
| Status | Task | Notes |
|---|---|---|
| ✅ | `POST /payments/:bookingId/initiate` — create Razorpay Order, insert `payment_records` row at `status=created` | Gated via `assertPayable` (`draft_ready` + not paid); price server-derived; rate: 5/hr |
| ✅ | `POST /webhooks/razorpay` — `express.raw()`, HMAC-SHA256 verify, idempotency, transition → `filing` | Layer 1; mounted before `express.json()`; exempt from rate limiting; always returns 200 |
| ✅ | `GET /payments/verify` — signature verify + Razorpay Fetch Payment API; returns outcome enum | Layer 2; rate: 7/hr; no redirect; success/failed/inconclusive/tampered |
| ✅ | Idempotency: `razorpay_payment_id` unique constraint — no double-transition | Atomic conditional `captureAndTransition` (updateMany `status != captured`) + unique-constraint race catch |
| ✅ | Payment confirmed emails — user + admin | `notificationService.sendPaymentConfirmed`, fired once in shared `processCaptured` core |
| ✅ | Failed payment email — admin only | `notificationService.sendPaymentFailed` |
| ✅ | Pay-to-unlock screen frontend — Razorpay Checkout via `handler` callback | Pre-deposit disclosure for GSTAT/Commissioner (KB2 §7); D82 |
| ✅ | `/payment/verify` page frontend — reads outcome enum; shows status + WhatsApp link on Inconclusive | SSR shape-guard + client leaf; live-verified against server (D82) |
| ⬚ | Manual QA: a real captured Razorpay test payment through the actual Checkout UI (test card/UPI) | Deferred, same constraint as D77 |
| 🔄 | External: Razorpay test-mode keys (unblocks dev); live-mode KYC approval needed before prod | Test keys supplied + wired; KYC still required before prod |

### EP13 — Admin Dashboard (backend_plan Phase 6)
| Status | Task | Notes |
|---|---|---|
| ✅ | `GET /admin/bookings` — list all bookings; filter by status/paymentStatus/serviceType; offset pagination | Auth: admin only; `paginated()` envelope |
| ✅ | `GET /admin/bookings/:id` — detail including user info, all documents, all payment attempts | `findByIdForAdmin`; `hasDraft` flag; `draftS3Key` never exposed |
| ✅ | `PATCH /admin/bookings/:id/status` — transitions `→ in_review` and `→ complete` only | Illegal transitions → `INVALID_TRANSITION` (state machine); emails in_review/complete |
| ✅ | `POST /admin/bookings/:id/draft-upload-url` — two-step pre-signed PUT, PDF only, ≤20 MB | Blocked at `document_upload/filing/complete/cancelled` → `DRAFT_LOCKED`; rate 15/hr; `drafts/{id}-…` key |
| ✅ | `POST /admin/bookings/:id/draft-confirm` (api_contract §6.5) | Sets `draft_s3_key` + auto-transitions to `draft_ready`; emails user draft-ready (first) / draft-updated (re-upload); no doc row (draftS3Key only) |
| ✅ | `PATCH /admin/bookings/:id/note` — admin note ≤5000 chars | Visible to user; empty string clears |
| ✅ | `POST /admin/bookings/:id/mark-paid` — Layer 3 override; calls Razorpay Fetch Payment API first | Reuses Phase 5 `processCaptured` core; `source=admin_override` + `performed_by_admin_id` (D66/D78); cross-booking guard; `PAYMENT_NOT_CAPTURED`/`RAZORPAY_ERROR` |
| ✅ | `GET /admin/stats` — total bookings by status + service type + captured revenue | Zero-filled enum keys |
| ✅ | Newman test suite — 50 requests / 109 assertions, all green | `test/postman/Admin.postman_collection.json` + `run-admin-newman.sh`; see D79, ADMIN_TEST_PLAN.md |
| ⬚ | Manual verification: mark-paid 200 success + cross-booking guard + idempotency (needs real captured Razorpay test payment) | Deferred, same as EP12/D77 |
| ✅ | Admin frontend — all six prototype screens: Overview, Bookings (search/filters/sort/pagination), Booking Detail (draft upload, status actions, mark-paid, note editor, doc downloads), Users, User Detail (gated delete), Settings (change password + business info) | `(admin)` route group + AdminShell; D81 |
| ✅ | Role-based routing — admin → `/admin` at login and on any `/dashboard` visit; `requireAdmin()` gates the admin group | D81 |
| ✅ | Backend additions: `GET/DELETE /admin/users(/:id)`, `POST /auth/change-password`, bookings `search`/`sortBy`/`sortDir`, admin document download-url | User-approved scope extension; smoke-tested live (D81) |
| ⬚ | Manual QA: actual delete-user (soft-delete + redirect), real change-password, admin draft upload against S3, document download | Destructive/S3 paths not exercised by the smoke test |

### EP14 — Email Notifications (backend_plan Phase 7)
| Status | Task | Notes |
|---|---|---|
| ⬚ | React Email templates for all 14 HLD §12.2 events — navy + green branding, typed props | `server/src/emails/` still hand-built HTML strings, not React Email |
| 🔄 | Matrix completeness audit — every event mapped to trigger, recipients, and template | Post-launch audit (2026-07-04) closed 4 gaps: Account Deleted (User+Admin), welcome email (User), Service Completed (+Admin), Request Callback admin alert — see D85. Remaining known gaps: none open from that audit; full HLD §12.2 re-audit still not run |
| ⬚ | Verify Resend sending domain passes SPF/DKIM/DMARC | External: domain DNS config |
| ⬚ | Confirm contact-form email (admin only) and Calendly (handled by Calendly directly) | |

### EP15 — Phase 2 Hardening & Launch (backend_plan Phase 8)
| Status | Task | Notes |
|---|---|---|
| ⬚ | Rate-limit audit — every endpoint has its limiter attached and tested | Per LLD §6 matrix |
| 🔄 | Account deletion — `DELETE /user`: soft-delete + block when booking active (`ACTIVE_BOOKINGS`) + type-email confirmation (D24, `EMAIL_MISMATCH`) + revoke sessions + clear cookies. **Remaining:** scheduled S3 hard-delete after 7 days | Endpoint + Settings danger-zone UI built (EP15 pull-forward); S3 cleanup job still pending |
| ✅ | `PATCH /user/profile` (name/phone/allowPromotions; email + interestedServices not editable) + `GET /user/payment-history` (offset pagination, captured only, D64) | Routes under `/api/v1/user`; consumed by Settings + Payment History pages |
| ⬚ | Sentry integration with PII scrubbing + source maps | |
| ⬚ | Security pass — Helmet config, CORS per env, cookie flags (`Domain=.gstnoticesupport.in`, Secure, HttpOnly, SameSite=Lax) | |
| ⬚ | GitHub Actions CI/CD for `server/` — build + deploy on push to `staging`/`main` | |
| ⬚ | NeonDB staging branch — mirror production schema; validate staging deploy | |
| ⬚ | Cross-subdomain auth validation — authenticated request from frontend domain reaches API subdomain with cookie | |
| ⬚ | Live Razorpay smoke test — real ₹ payment transitions booking to `filing` end-to-end | Requires live-mode KYC approval |
| ⬚ | Production Razorpay key starts with `rzp_live_` — deploying with test key is a critical error | |

### Post-Launch — Client Performance Audit (2026-07-11, `fix/client-performance-audit`)
| Status | Task | Notes |
|---|---|---|
| ✅ | Cache `/public` assets immutably + enable AVIF + longer image-optimizer TTL | `next.config.ts headers()`; was `max-age=0` on video/logo vs. 1yr-immutable on `/_next/static` |
| ✅ | Hero video compressed 11.18 MB → 1.65 MB (1080p → 720p) + poster frame | replaces unposterred autoplay (blank box on load) |
| ✅ | Logo source shrunk 908 KB → 51 KB (1254px → 256px) | delivered bytes were already optimizer-correct; this was a source-weight/decode-CPU/repo-size fix |
| ✅ | react-calendly code-split out of the root layout, scoped to `(public)` routes only | was shipping ~16 KB gzip on 100% of routes incl. admin/dashboard/404 |
| ✅ | Dashboard bookings fetch now starts concurrently with the auth check | was serial; only needs the cookie header, not the resolved user |
| ✅ | Shared IntersectionObservers in `useInView` (was 1 observer per animated element) | ~28 on homepage alone; public API unchanged, zero call-site changes |
| ✅ | Build-time bundle-size guardrail (`postbuild`) — fails the build on oversized `/public` assets or JS chunks | client-only substitute for the "GitHub Actions CI/CD" line above — this repo has no `.github/workflows` at all; runs on every `next build` including the Hostinger deploy path |
| ✅ | Resolved 11 pre-existing lint errors surfaced during the audit (unescaped entities, unsafe ref reads during render, setState-in-effect) | none introduced by the audit work; fixed since the branch already touched 2 of the 5 files |
| ⬚ | Logged-in dashboard render path QA (bookings-fetch parallelization) | needs a live `server/` API; `server/.env` not present in the dev sandbox this was built in |
| ⬚ | Manual scroll-through QA of reveal animations (shared-observer refactor) | `/`, `/pricing`, one service page — no browser automation available in the dev sandbox |
| ⬚ | Cloudflare edge cache review — confirm `Accept` header forwarding for AVIF negotiation + edge respects the new origin `Cache-Control` | ops/config, not code |
| ⬚ | Move large static media (hero video) off the Hostinger Node origin to a CDN-fronted object store | long-term, needs an infra decision |

### Post-Launch — Server Performance Optimization (2026-07-11, `fix/server-performance`)
| Status | Task | Notes |
|---|---|---|
| ✅ | `trust proxy = 1` so `req.ip` is the real client behind Hostinger's proxy | fixes express-rate-limit bucketing all users under the proxy IP + D65 login-alert IP (D95) |
| ✅ | `compression()` middleware — gzip responses at the origin | no CDN in front to compress (D95) |
| ✅ | Short-TTL (5s) negative cache for jti blacklist lookups in `authenticate` | removes ~1 NeonDB round-trip per authed request; logout invalidates same-process immediately (`lib/jtiCache.ts`) |
| ✅ | Cache admin dashboard stats aggregates for 30s (`adminService.getStats`) | snapshots stay internally consistent; D79 Newman suite unaffected |
| ✅ | Document Neon pooled endpoint + `connection_limit`/`pool_timeout` in `.env.example` | local `.env` updated; verified host already on `-pooler` (D95) |
| ⬚ | Apply `connection_limit=5&pool_timeout=10` to the Hostinger backend env + restart | ops/config — mirror the local `.env` change on the deployed app |
| ⬚ | Verify Hostinger's proxy actually forwards `X-Forwarded-For` (confirm `req.ip` ≠ internal IP) | if empty, needs a Hostinger-side proxy config before `trust proxy` helps |
| ⬚ | Stand up Cloudflare (free tier) in front of both domains, then revisit `trust proxy` (→ 2 / CF IP list) | biggest remaining infra lever; recorded in D95 |

### Security Audit Follow-ups (D96 — deferred items from `required_changes.md`)
| Status | Phase·Layer·Priority | Task | Notes |
|---|---|---|---|
| 🔄 | P2·server·P2 | Re-run `run-representation-newman.sh` + `run-payments-newman.sh` end-to-end for a full clean confirmation | 3/5 suites already 100% clean (D97); these two hit the new `BOOKING_LIMIT` cap from same-day test volume, not a bug — re-run once the 24h window clears, before any prod deploy touching payment/booking-creation |
| ⬚ | P2·server·P1 | Verify `trust proxy` hop count on Railway (log `req.ip` once live) | raise to 2 if Cloudflare is fronted; identity-keyed caps are unaffected either way |
| ⬚ | P2·both·P2 | CAPTCHA (Cloudflare Turnstile) on signup / forgot-password / contact / callback | needs sitekey+secret; client widget + server `siteverify` guard |
| ⬚ | P2·infra·P2 | Cloudflare-in-front of Railway for edge rate limiting / WAF | Railway has no configurable edge limits |
| ⬚ | P2·infra·P3 | 429 monitoring/alerting via Railway log drain (or Sentry) | alert on `RATE_LIMITED` spikes |
| ⬚ | P2·server·P3 | Revisit `jtiCache` before enabling Railway replicas | revoked session can stay honored ≤ cache TTL on other replicas; shorten TTL or drop cache |
| ⬚ | P2·server·P3 | Pass 6 Finding B extras: attachment-disposition on admin doc downloads; frontend CSP | CSP needs nonce plumbing (breakage-prone) |

### Post-Launch — UI/Functional Fixes Batch (2026-07-26, `fix/phase-2/ui-functional-issues`)
| Status | Task | Notes |
|---|---|---|
| ✅ | Auth footer: GSTIN row (env-backed, supersedes D39), Refund Policy link, copyright | `AuthCardShell` — renders on all 6 auth pages; GSTIN row waits on real `ORG_GSTIN` value (see Blocked Items) |
| ✅ | Header/back-button spacing corrected against the prototype spec | `AuthCardShell` margin-bottom 32px→40px; "Back to home" link gained padding/radius/focus-visible |
| ✅ | `DELETE /bookings/:id/documents/:docId` + Add/Delete document UI | Gated on `document_upload` status; confirmation dialog before delete (D102) |
| ✅ | Mobile number fields restricted to digits at the keystroke level | New `client/src/lib/digit-input.ts`; every phone input site covered |
| ✅ | Booking Step 2 layout normalized (field labels, checkbox grouping, spacing) | Widened `Input` label fix to match `components.md`'s documented spec app-wide |
| ✅ | Continue button on booking Step 2 gated on both consent checkboxes | Was previously always enabled |
| ✅ | Shared `Breadcrumb` component, added to previously breadcrumb-less pages | My Services, Payment History, all 6 admin pages |
| ✅ | Single password visibility toggle everywhere, keyboard-reachable | Suppressed native `::-ms-reveal`; new `PasswordInput` for Settings' change-password fields |
| ✅ | Single Add Document entry point on booking detail page, no duplicate list | Removed `BookingActionPanel`'s embedded uploader; `BookingDocumentsPanel` rebuilt with no drag-and-drop (D103) |
| ✅ | Access token TTL raised 15 min → 12 hours | `ACCESS_TOKEN_TTL_SEC` in `server/src/lib/jwt.ts`; logout still revokes instantly (D104) |
| ✅ | GSTIN optional at booking time | Migration `make_booking_gstn_optional`; schema/DTO/UI updated end-to-end (D104) |
| ✅ | Auth page outer padding + `.auth-card` shadow/breakpoint corrected | Two more measured deviations from `resources/ui/Signup.html` beyond D102's header fix (D104) |
| ✅ | `/terms`, `/privacy`, `/refund` rebuilt with prototype layout (TOC, scroll-spy, article typography) | Real drafted legal content kept; shared `legal.module.css` (D104) |
| ✅ | Auth page header now uses the app's shared `.container` class | Was a narrower bespoke width with different padding than the rest of the site (D105) |
| ✅ | Navbar logo enlarged and sharpened (new dedicated crop, `logo-mark.png`) | Navbar-only; other shells' logo untouched (D106) |

---

## Blocked Items (waiting on external input)

| Blocker | Required For | Owner |
|---|---|---|
| Resend API key + verified sender domain | EP3 contact email | Client |
| Calendly account + event URL | EP3 popup | Client |
| Trust signals: legal name, CIN, address, grievance officer, phone (already supplied) — **GSTIN value only** (`ORG_GSTIN` env var; plumbing done 2026-07-26, D102) | EP2 Footer, EP5, auth trust strip | Client |
| Cloudflare account access | EP5 DNS/SSL | Client |
| GA4 Measurement ID | EP4 analytics | Client |
| Google Search Console access | EP4 | Client |
