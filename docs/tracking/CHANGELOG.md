# Changelog — gstnoticesupport.in

> User-facing and developer-significant changes, newest first.
> Format: `## [date] — description`

---

## [2026-06-29] — feat(client): EP10 — Auth Frontend & Route Protection

**Complete auth UI wired to the Phase 2 backend (EP6–EP8). All six auth screens built; route guards active.**

**Infrastructure**
- `client/src/lib/api/client.ts` — Typed fetch gateway: envelope unwrap, `ApiRequestError` (carries `code`/`message`/`status`), automatic 401 → `POST /auth/refresh` → retry once. All requests use `credentials: 'include'` for HTTP-only cookie cross-origin auth.
- `client/src/lib/api/auth.ts` — Typed auth API surface; payloads match `z.infer<>` of server schemas.
- `client/src/lib/api/types.ts` — Wire-contract types: `ApiEnvelope`, `ApiErrorBody`, `UserObject`, `SignupResponseData`.
- `client/scripts/sync-shared-schemas.mjs` — Copies `auth.schema.ts` + `document.schema.ts` from `server/src/schemas/` into `client/src/lib/shared-schemas/` on every `predev`/`prebuild` run. Resolves the Turbopack monorepo-boundary constraint (can't reference files outside the Next.js project root). Server remains the sole source of truth; generated copies are auto-generated and not hand-edited. Guards against `@prisma/client` imports (booking schema not yet syncable).
- `client/src/app/providers.tsx` — TanStack Query `QueryClient` provider; `staleTime: 60s`, `retry: 1`, `refetchOnWindowFocus: false`. Mounted in root layout (marketing tree unaffected — no queries fired on public pages).
- `client/src/lib/auth/session.ts` — SSR session helpers: `getCurrentUser()` (cookie-forwarding `GET /auth/me`, returns `UserObject | null`), `requireUser()` (redirects to `/login`), `requireAdmin()` (redirects to `/dashboard`), `redirectIfAuthenticated()`. No client-side token handling — auth is always verified server-side.

**UI Primitives (extended / new)**
- `Input` — Added password show/hide toggle (Eye/EyeOff icons), `+91` tel-prefix slot, `aria-invalid` + `aria-describedby`, `forwardRef` (required for React Hook Form `register()`).
- `Checkbox` — New. `forwardRef`, `label: React.ReactNode`, error display with `aria-invalid`.
- `OTPInput` — New. 6-box OTP entry: paste distribution across boxes, arrow/backspace navigation, `inputMode="numeric"`, `autoComplete="one-time-code"` on first box, group `role="group"`, `.has-error` state.
- `AuthCardShell` — New layout component. Full-viewport neutral background, 440px card, wordmark, `title`/`subtitle`/`children`/`footer` slot, trust strip (ShieldCheck + Privacy/Terms links). No Navbar/Footer.

**Auth Screens (`(auth)/` route group — SSR, no Navbar/Footer)**
- `/login` — RHF + `zodResolver(loginSchema)`. Amber error banner for wrong credentials (never discloses which field); neutral info banner for `EMAIL_NOT_VERIFIED`.
- `/signup` — Three-generic `useForm<Input, Ctx, Output>` to handle `.default(false)` on `allowPromotions`. On success routes to `/verify-otp?userId=`.
- `/verify-otp` — `OTPInput` + resend button. Uses `useWatch` (not `watch()`) for React Compiler compatibility. Reads `?userId` from `searchParams`; redirects to `/signup` if absent.
- `/complete-profile` — Name + `+91` phone field. SSR gate: `requireUser()` + redirect to `/dashboard` if `user.phone` already set (enforces D67 one-time gate).
- `/forgot-password` — Two-state: email entry → sent confirmation. Neutral server response (never reveals whether email exists).
- `/reset-password` — `OTPInput` + new password. Reads `?uid` from `searchParams`; redirects to `/forgot-password` if absent. On success routes to `/dashboard`.
- `/auth/invalidate` — Fully SSR. Calls `authApi.invalidate(ref)` server-side; renders ShieldCheck (success) or ShieldAlert (error/invalid). No JSON leak to client. Used by the "This wasn't me" security email link.

**Dashboard Skeleton (`(dashboard)/` route group)**
- `(dashboard)/layout.tsx` — Calls `requireUser()` as auth gate. Full AppShell deferred to EP11.
- `/dashboard` — Minimal SSR placeholder showing `user.name`; `LogoutButton` client leaf.

**Build verified** — `tsc --noEmit` clean; `npm run build` (client) exits 0; prebuild sync hook runs automatically; marketing routes remain `○ (Static)`; auth/dashboard routes are `ƒ (Dynamic)`; dev server: all routes 200, guard routes 307, zero RSC client manifest errors.

---

## [2026-06-23] — feat(backend): Phase 4 — Document Handling (pre-signed S3)

**4 new endpoints under `/api/v1/bookings/:id`** — all `authenticate`-gated, ownership enforced (404-collapse). Files never pass through Express; the browser PUTs/GETs S3 directly via pre-signed URLs.

- `POST /bookings/:id/upload-url` — Validates server-side (PDF only, ≤5 MB, booking in `document_upload`, <8 files) then returns a 5-min pre-signed PUT URL. `ContentType`+`ContentLength` are signed so the declared size/type can't be exceeded. Errors: `INVALID_FILE_TYPE`, `FILE_TOO_LARGE`, `INVALID_STATUS`, `FILE_LIMIT_REACHED`. Rate: 7/hr/user.
- `POST /bookings/:id/confirm-upload` — Records the `booking_documents` row after the browser upload. Rejects an `s3Key` not scoped to `{userId}/{bookingId}/` and duplicate keys (`DUPLICATE_KEY`).
- `GET /bookings/:id/documents` — Lists document metadata; `s3Key` never exposed.
- `GET /bookings/:id/draft-url` — 15-min pre-signed GET for the draft PDF, gated to `status ∈ {filing, complete}` (`DRAFT_NOT_ACCESSIBLE` otherwise). Rate: 15/hr/user.

**New modules**
- `lib/s3.ts` — S3 client (`ap-south-1`), pre-signed PUT/GET helpers, `buildDocumentKey`. Request checksums disabled for presigning; encryption via bucket-default SSE-S3.
- `utils/sanitizeFilename.ts`, `schemas/document.schema.ts`, `repositories/document.repository.ts`, `services/document.service.ts`, `controllers/document.controller.ts`.
- New env: `AWS_REGION`, `AWS_S3_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.

**Verified** — Newman suite extended to 22 requests / 68 assertions (all green); live S3 PUT→GET byte round-trip confirmed; unsigned public reads return 403. Admin draft *upload* (Phase 6) and the S3 hard-delete job (Phase 8) remain out of scope.

---

## [2026-06-17] — test(api): Postman + Newman booking API test suite

**Automated API tests under `test/postman/`** — Postman collection **"GST Notice Support"** runnable headlessly via Newman.

- Scope: Phase 3 Booking Lifecycle (4 endpoints) + admin login. **11 requests / 38 assertions, all green.**
- Covers: auth gate (401), login cookie set (`access_token` + `refresh_token`), create success (201, `document_upload`/`pending`, client price stripped, no `draftS3Key`), list (newest-first, summary shape), detail (`documents[]` + `latestPayment`, no `draftS3Key`), invalid GSTN / false consent / invalid uuid → 400, non-existent → 404, cancel at `document_upload` → 409 `INVALID_TRANSITION`.
- **Auth:** logs in as the seeded admin; credentials read from `server/.env` at runtime by `run-newman.sh` and injected as Newman env-vars — never committed. Newman cookie jar carries the session.
- Files: collection JSON, environment (placeholders only), `run-newman.sh`, `package.json` (pins Newman), `README.md`. Run with `cd test/postman && npm install && npm test`.
- Out of scope until later phases: OTP success-path (bcrypt-hashed, no plaintext read) and cancel **success** path (needs `draft_ready` via admin draft upload, Phase 6).

---

## [2026-06-17] — feat(backend): Phase 3 — Booking Lifecycle

**4 new endpoints under `/api/v1/bookings`** — all `authenticate`-gated, no rate limiters.

- `POST /bookings` — Creates a booking at `status=document_upload`, `paymentStatus=pending`. Price derived server-side; any client-supplied price is stripped by Zod. Sends confirmation emails to user and admin (best-effort). Returns `BookingDetailDTO` (no `draftS3Key`).
- `GET /bookings` — Lists the authenticated user's bookings newest-first as `BookingSummaryDTO[]`.
- `GET /bookings/:id` — Returns `BookingDetailWithRelations` (detail + `documents[]` + `latestPayment`). Returns 404 for both non-existent and foreign-user bookings (no existence leak, D69).
- `POST /bookings/:id/cancel` — Allowed only when `status=draft_ready` AND `paymentStatus=pending`. Sends cancellation emails (best-effort). Returns updated `BookingDetailDTO`.

**New modules**
- `schemas/booking.schema.ts` — `createBookingSchema` (GSTN regex, consent refines, no price field) + `bookingIdParamSchema`.
- `lib/pricing.ts` — `SERVICE_PRICING` in paise; reused by Phase 5 payment flow.
- `services/booking-state-machine.ts` — Pure `ALLOWED_TRANSITIONS` map, `assertTransition`, `assertUserCancellable` (D70).
- `repositories/booking.repository.ts` — Ownership-baked queries; includes `documents`/`paymentRecords` on detail fetch.
- `dto/booking.dto.ts` — Explicit summary/detail/document/payment/detail-with-relations mappers; `draftS3Key` and `s3Key` never included.
- `services/booking.service.ts` — Business logic; emails are best-effort (never block transitions).

**Email templates** — `bookingCreatedUser/Admin`, `bookingCancelledUser/Admin` added to `emails/templates.ts`; `notification.service.ts` extended with `sendBookingCreated` + `sendBookingCancelled`.

---

## [2026-06-16] — feat(backend): Phase 2 — Authentication & Identity

**Response envelope aligned to `api_contract.md`**
- `ApiError(statusCode, code, message, details?)` now carries a named error code; errors serialise as `{ success:false, error:{ code, message, details? } }`.
- Success envelope is `{ success:true, message?, data }` (+ `paginated()` helper); `validate`, `rateLimiter`, `notFound`, and `errorHandler` all emit the contract shape. Unknown errors → `INTERNAL_ERROR` (500), logged via pino.

**Auth primitives**
- JWT: 15-min access token (`sub`, `role`, `email`, `jti`) + 7-day refresh token; secrets `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`. Refresh tokens stored **SHA-256-hashed** in `refresh_tokens`. Refresh issues a new access token only — **no rotation** (api_contract §1.6).
- OTP: 6-digit, bcrypt-hashed in `otp_store`, 10-min expiry, 5-attempt cap, single active OTP per user, single-use.
- Cookies (`utils/cookies.ts`): `access_token` (Path=/) + `refresh_token` (Path=/api/v1/auth/refresh); `HttpOnly; SameSite=Lax; Secure` in prod; `Domain` from `COOKIE_DOMAIN` (unset in dev).
- Token blacklist (`token_blacklist`) for logout + "This wasn't me" only; opportunistic expiry cleanup.

**Endpoints (`/api/v1/auth`)** — signup, verify-otp, resend-otp, complete-profile, login, refresh, logout, forgot-password, reset-password, invalidate, me. Per-route rate limits (login 5/15m, otp-verify 5/10m, resend 3/h, forgot 5/h, reset 5/10m). `authenticate` + `requireRole` middleware added.

**Email (Resend)** — `lib/email.ts` abstraction (best-effort, never logs PII/OTP) + `notification.service.ts` for signup OTP, password-reset OTP, login security alert (IP + sanitised UA + invalidation link, D65), and account-created→admin. Brand-styled templates in `emails/templates.ts`.

**Schema / data**
- Added `User.phone` (nullable) + migration `add_phone_to_users` — required by complete-profile (D67); the field was previously referenced by the repository but absent from the schema.
- Soft-delete guard in `lib/prisma.ts` reimplemented as a Prisma **client extension** (`$extends`) — Prisma 6 removed `$use` middleware.
- New repositories: `otp`, `refresh-token`, `token-blacklist`; `user.repository.updatePassword` added.
- DTO: `dto/user.dto.ts` (`toUserDTO`, includes `phone`).
- New env vars: `API_URL` (required), `COOKIE_DOMAIN` (optional); `ADMIN_EMAIL` now loaded at boot.

---

## [2026-06-16] — feat(backend): Phase 0 + Phase 1 — server foundation hardening and Prisma data layer

**Backend Phase 0 — Foundation Hardening**
- Zod-validated env loader at boot (`server/src/lib/env.ts`); process exits with descriptive message on any missing var.
- pino + pino-http request logging; auth headers and cookies auto-redacted; `/health` route suppressed from logs.
- `createRateLimiter` factory utility (`server/src/lib/rateLimiter.ts`); not yet attached to routes.
- Full directory scaffold: `routes/ controllers/ services/ repositories/ middleware/ lib/`.
- Central `routes/index.ts` router registry; `GET /health` returns standard envelope `{ success, data, error, statusCode }`.
- Zod validation middleware: `validateBody / validateQuery / validateParams` — attaches to `req.validated`, never mutates `req.body`.
- Global 404 handler + `notFound.ts` middleware.
- `.env.example` updated with all Phase 0–5 environment variable placeholders.

**Backend Phase 1 — Prisma Data Layer**
- Prisma 6.x pinned (`@prisma/client@6`, `prisma@6`) — Prisma 7 requires Node 20.19+; project runs 20.12.2.
- Full `server/prisma/schema.prisma`: 8 enums (incl. `PaymentSource` per D66), 7 tables with all indexes and `onDelete` rules.
- `PaymentRecord` now carries `source` (PaymentSource) + `performedByAdminId` nullable FK for admin audit trail (D66).
- `User.deletedAt` nullable — soft-delete enforced at repository and via Prisma middleware.
- `server/src/lib/prisma.ts` — Prisma singleton + `$use` middleware auto-excluding soft-deleted users from all find operations.
- Migration `20260616142630_initial_schema` applied to NeonDB; `prisma migrate status` clean.
- `server/prisma/seed.ts` — admin seeded via `ADMIN_EMAIL/NAME/PASSWORD` env vars; bcrypt cost 12; idempotent upsert.
- `server/src/repositories/user.repository.ts` — first domain repository: `findById`, `findByEmail`, `create`, `updateEmailVerified`, `updateProfile`, `softDelete`.

---

## [2026-06-15] — style: homepage UI polish — badge cleanup, pre-deposit enforcement, animated text colour, navbar serif font

**Most Popular badge removed from SCN Reply**
- Removed `popular: true`, `popularBadge: 'Most Popular'`, and the corresponding amber badge render from the SCN Reply card on the homepage pricing tiers (`home.tsx`, `page.tsx`) and the pricing page card (`pricing.tsx`, `pricing/page.tsx`). The green highlight/ring and `btn-primary` CTA were reverted to the standard tier styling.

**Pre-deposit badge added to Commissioner Appeal**
- Commissioner Appeal now shows an amber "Pre-deposit required by law" badge on the homepage notice-card grid (matching the GSTAT notice card) and on the homepage pricing tiers — aligning both appeal services at all visible pre-deposit touchpoints (`home.tsx`, `page.tsx`).
- Legal reference: Commissioner Appeal pre-deposit = 10% of disputed tax (Section 107(6) CGST Act); GSTAT Appeal = 20% (Section 112(8) CGST Act).

**Rotating headline colour → accent-green**
- Added `color: var(--accent-green)` to `.rotator` in `RotatingHeadline.module.css`. All rotating phrases inherit the WCAG-AA compliant brand green (#0B8B4E, ~5.9:1 on white). No other text, gradients, or branding colours changed.

**Navbar brand name → serif typeface**
- Added `font-family: Georgia,'Times New Roman',serif` to `.brand .bn` in `globals.css`. The "GSTNoticeSupport" wordmark near the logo now renders in serif on desktop and mobile (drawer inherits automatically). Footer brand (`.fbrand`) is unaffected.

---

## [2026-06-14] — feat: add "Representation Before Authority" as a full 5th service

**New service (consultation-based, no fixed fee)**
- Added **Representation Before Authority** — personal/virtual appearance before the GST Officer or Appellate Authority — promoted from a half-present mention to a first-class service across all surfaces.
- New dedicated page `/services/representation-before-authority` (SSG), modelled on the existing service-page template (hero, what-is, 5 deliverables via `doGrid5`, documents, steps, consultation pricing block, related services).
- New data file `client/src/data/services/representation-before-authority.tsx` (`representationContent: ServicePageContent`). **Copy is placeholder pending review.**
- New WhatsApp deep link `WHATSAPP_LINKS.representation`.

**Listings**
- Nav dropdown (desktop + mobile drawer) and footer services column (`common.ts`).
- Home notice-card grid and home pricing tiers (`home.tsx`) — shown as `Custom` / `Custom Quote`, consultation-based.
- Pricing page: 5th table card (`Custom · consultation-based`, "View Service Details") + existing Representation callout heading aligned to "Representation Before Authority" and given a "View Service Details" link.
- Sitemap entry (priority 0.9); GSTAT page gains a reciprocal "Representation Before Authority" related card.
- Notice/tier/pricing grids widened from 4 to 5 columns at desktop.

**SEO**
- `serviceSchema()` / `ServiceSchemaInput.price` made optional — consultation services emit a Schema.org `Service` with **no `offers`** (avoids a misleading price of 0). Existing 4 fixed-fee services unchanged.

**Verification:** `tsc --noEmit` clean; dev-server smoke test — all affected routes 200; new page renders correct title/h1 and JSON-LD without `offers`; sitemap, nav, footer, pricing, and GSTAT reciprocal link confirmed.

---

## [2026-06-11] — refactor: extract all static content into `client/src/data/` layer

**Content data layer (developer-facing; zero visible change to rendered site)**
- All hardcoded copy extracted from 9 public pages, `not-found.tsx`, and 6 components into a typed `client/src/data/` directory — 14 new files total.
- `types.ts` — 24+ explicit TypeScript interfaces covering every content shape (`PageMeta`, `ServicePageContent`, `TestimonialItem`, `PricingTier`, `FaqItem`, etc.).
- `common.ts` — shared content: all 7 WhatsApp deep links (with per-service pre-filled message text), nav items, footer columns, 404 copy. Org identity stays env-driven in `lib/site.ts`.
- Per-page data files: `home.tsx`, `about.ts`, `contact.ts`, `pricing.tsx`, `faq.tsx`, `home-faq.tsx`, `pricing-faq.tsx`, `testimonials.ts`, `services/asmt10.tsx`, `services/scn.tsx`, `services/commissioner-appeal.tsx`, `services/gstat-appeal.tsx`.
- SEO metadata (`PageMeta`) and JSON-LD inputs included in data files alongside content.
- Lucide icon component references stored in data arrays beside their copy (typed `LucideIcon`).
- JSX-rich content (links/bold inside FAQ answers, pre-deposit disclosures) stored as `ReactNode` in `.tsx` data files.
- **Verification:** prerendered HTML diff of all 14 static routes against pre-refactor baseline — pixel-identical. `tsc --noEmit` clean, `next build` passes (15 SSG routes).
- **Going forward:** all copy edits touch only `client/src/data/` files; no component code needs changing for content updates.

---

## [2026-06-10] — feat: WhatsApp-first booking, hero video, nav cleanup, site-wide phone removal

**Navigation**
- Navbar: removed phone number from desktop right rail and mobile drawer; renamed "Resources" → "FAQ"; replaced "Book Service" CTA with "Contact Us" (→ `/contact`) in both desktop and mobile drawer.
- Mobile sticky bar: replaced "Call Now" (tel: link) with `RequestCallbackButton`; "Book Service" → "Contact Us" (→ `/contact`).

**WhatsApp widget**
- Floating widget redesigned from text pill to circular 56×56 px icon (proper WhatsApp brand SVG).
- Widget is now always visible on page load — no scroll threshold.

**Homepage hero**
- SVG document + shield graphic replaced with autoplay/muted/loop `hero-section.mp4` video.
- "Upload Your Notice" CTA renamed "Book Service"; links to WhatsApp deep-link with pre-filled message.
- Final CTA section: same WhatsApp redirect; phone number block removed.
- Service descriptions in "Choose Your Service" grid expanded from one-liners to 2–3 sentence professional copy for all 4 services.

**Book Service → WhatsApp (site-wide)**
- About page (hero + final CTA): "Book a Service" → WhatsApp with general enquiry message.
- All 4 service pages (2 buttons each — hero + pricing section): redirects to WhatsApp with service-specific pre-filled messages.

**Scroll indicators**
- New `HeroScrollIndicator` shared component: decorative bounce chevron, `aria-hidden`, `pointer-events:none`, respects `prefers-reduced-motion`.
- Added to hero sections on: Homepage, About page, Contact page. Pricing page already had one. FAQ page explicitly excluded per spec.

**Phone number removal (site-wide)**
- All displayed `+91 93432 97622` and `tel:` hrefs removed from: Navbar, Footer, Contact page "Other Ways to Reach", FAQ "Still Have Questions" card, Homepage final CTA, Refund page, Terms page.

---

## [2026-06-09] — docs: Phase 2 component specs; repo hygiene

**Design system**
- `docs/ui-ux/components.md`: added specifications for the Auth Card Shell, OTP Input, Form Field Primitives, and the authenticated Mobile Bottom Tab Bar (Phase 2 groundwork).

**Repo hygiene**
- `.gitignore` now excludes local tooling and working artefacts (`.playwright-mcp/`, graphify output, audit working note).
- Added the firecrawl skill under `.claude/skills/`.

---

## [2026-06-08] — EP4: SEO plumbing (metadata, OG image, sitemap, robots, JSON-LD)

**Site-wide SEO foundation (unblocked code; legal content + analytics still client-blocked)**
- `src/lib/site.ts` single source for `SITE_URL` (from `NEXT_PUBLIC_SITE_URL`), `SITE_NAME`, `SITE_DESCRIPTION`, and `ORG` legal identity (CIN/GSTIN/address/grievance) — all sourced from env with dummy placeholders to be swapped for authentic data before launch.
- Root layout: `metadataBase`, default title/description, and sitewide `openGraph` (website, `en_IN`) + `twitter` (`summary_large_image`) defaults inherited by every route.
- Homepage: unique absolute `<title>`, unique meta description, and `canonical`. OG is intentionally inherited from root so the generated share image is preserved (a page-level `openGraph` shallow-replaces the root one in Next 16).
- Generated OG/Twitter share image (`app/opengraph-image.tsx`) — 1200×630 branded card via `next/og`, inline SVG check (no dynamic font fetch).
- `app/sitemap.ts` (12 public routes, priority + change frequency) and `app/robots.ts` (allow crawl; disallow `/dashboard`, `/admin`, `/payment`, `/api`; links sitemap).
- Structured data: `Organization` JSON-LD on every public page (via public layout), `Service` JSON-LD on the 4 service pages (INR `Offer`), pre-existing `FAQPage` retained. New `JsonLd` component + `lib/structured-data.ts`.
- About page company-reference card now reads legal identity from `ORG` constants (one place to swap real data later).
- Cleanup: removed "Meet the Team" remnants from `/about` (unused imports, orphaned `LinkedInIcon`, stale metadata description, dead team CSS).
- Verified: `next build` clean, ESLint clean, `tsc --noEmit` exit 0; rendered HTML confirmed for OG/canonical tags, `sitemap.xml`, `robots.txt`, and Organization/Service/FAQPage JSON-LD.

---

## [2026-06-08] — refactor: FAQ page accordion (content-based height, a11y)

**`/faq` page accordion (`FaqSection`) reworked**
- Replaced the fragile JS height animation (a `ref` `scrollHeight` measurement written to inline `max-height`) with the pure-CSS grid `grid-template-rows: 0fr → 1fr` technique. Panels now animate to natural content height — no measurement, no stale heights on resize/font-load, and no clipping or text overlap of long answers.
- Each question is now a semantic `<h3>` wrapping the trigger button (screen-reader heading navigation); panel gets `role="region"` + `aria-labelledby`, and `inert` when collapsed so links inside closed answers are not keyboard-focusable.
- Category headers are divider-separated (bottom border) with the question-count badge retained; item gap increased `2px → 10px`; answer padding consolidated into CSS-module classes (removed inline styles).
- Added `≤640px` padding overrides and a `prefers-reduced-motion: reduce` guard that disables the expand/chevron transitions.
- No FAQ content changed — structure, layout, styling, and behavior only. `tsc --noEmit` passes clean.
- Note: distinct from the 2026-06-06 fix, which addressed the **homepage** `FaqAccordion`.

---

## [2026-06-07] — EP3: Contact form (Resend), Calendly popup, toast, WhatsApp

**Contact form — Resend via Next.js Route Handler**
- `POST /api/contact` Route Handler (server-side, Vercel serverless) sends mail via the Resend SDK. `RESEND_API_KEY` is server-only — never in the browser bundle (decision D61, supersedes the interim EmailJS approach).
- React Hook Form + Zod (`contactSchema`); the same schema validates again server-side in the handler.
- React Email template (`ContactNotificationEmail.tsx`) in brand navy/green; `Reply-To` set to the enquirer's email so admins reply directly to the customer.
- Field-level errors: name (min 2), mobile (Indian `[6-9]\d{9}`), email, query (min 20).
- Submit disabled + `aria-busy` while sending; success state shows submitter's name; failure → `react-hot-toast` error, form data retained.
- Admin-only notification to `bhoure05@gmail.com`; no user auto-reply; no DB persistence.
- **Rate limiting:** 3 requests / 60 min / IP (in-memory sliding window, keyed on `x-forwarded-for`); exceeding it returns `429` and the form shows a distinct toast. Best-effort on serverless (per-instance), swap-ready for Upstash.
- Verified: `curl` → `200 {sent:true}`, invalid → `400` with field messages, malformed JSON → `400`, 4th rapid request → `429`; Playwright E2E → success state renders; live email received at `bhoure05@gmail.com`.

**Global toast system**
- `react-hot-toast` `<Toaster>` mounted in root layout — available on every page.

**WhatsApp links**
- All 4 `wa.me` links verified: correct number `919343297622`, contextual prefill text.

**Calendly popup**
- New `RequestCallbackButton` Client Component wraps `react-calendly` `PopupModal`.
- All 14 "Request Callback" / "Request a Callback" CTAs across navbar (desktop + mobile drawer), homepage (×2), about (×2), all 4 service pages, pricing (×2), contact, faq, and 3 inline accordion links now open the Calendly scheduling popup.
- Falls back to `/contact#callback` if `NEXT_PUBLIC_CALENDLY_URL` is not set (safe for local dev without the env var).
- Tested via Playwright: popup confirmed on homepage, GSTAT service page, and navbar renders correctly as `<button>` on all pages.

---

## [2026-06-06] — fix: FAQ accordion answers now expand correctly

**Bug fixed**
- Homepage FAQ accordion answers were hidden and never revealed on click — `aria-expanded` flipped correctly (state was fine) but the CSS module declared `.faqA { display:none }` with a separate `.faqAOpen { display:block }` class that the component never applied. The React component animates via inline `max-height`, so the fix was to remove `display:none` from `.faqA` and drop the dead `.faqAOpen` rule.
- Root cause: migration artifact — prototype's `display`-toggle model and the React `max-height` animation approach were never reconciled.
- Validated with Playwright MCP: after fix, expanded panel renders `display:block, max-height:103px, height:103px` with answer text visible.

---

## [2026-06-06] — EP2: All public marketing pages shipped (SSG, 10 routes)

**Pages added — all statically generated (○ in `next build`)**
- `/` — Homepage: 12 sections (hero, services grid, how-it-works, about, testimonials, pricing summary, notice guide, trust signals, FAQ accordion, final CTA). Navbar, Footer, WhatsApp float, sticky mobile bar wired as shared shell.
- `/services/asmt-10` — ASMT-10 Reply service page (Section 61 CGST, ₹2,999)
- `/services/scn-reply` — SCN Reply service page (DRC-01/DRC-01A, ₹5,999)
- `/services/commissioner-appeal` — Commissioner Appeal (APL-01, ₹9,999); pre-deposit 10% disclosed at hero + pricing per KB2 §7
- `/services/gstat-appeal` — GSTAT Appeal (APL-05, ₹14,999); pre-deposit 20% disclosed at hero + pricing per KB2 §7
- `/pricing` — Pricing page: 4-card pricing table, accordion FAQ, payment policy, representation card, scroll-to-table interaction
- `/about` — About page: team cards (photo placeholders), mission/vision, company identity (CIN/GSTIN/address hardcoded), why-choose-us
- `/faq` — FAQ page: live keyword search with `<mark>` highlighting, aria-live match count, 4 accordion groups (13 questions), FAQPage schema.org JSON-LD
- `/contact` — Contact page: 5 contact channels (phone/WhatsApp/email/address/hours), grievance officer, callback banner; form deferred to EP3
- `/_not-found` — Custom 404 page matching site design system

**Shell & navigation**
- Navbar: `usePathname()` wires `aria-current="page"` on all nav links; Services button gets `.nav-active` class when on any `/services/*` path; mobile drawer mirrors active states
- All pages verified: no raw `<img>` tags; Navbar logo uses `next/image` with `priority`

**Architecture decisions applied**
- Per-page CSS Modules (D59) — class names 1:1 with prototype HTML for pixel fidelity
- No `[Phase N]` commit prefix (D60)
- Contact form submission deferred to EP3 (static placeholder shown in EP2)

---

## [2026-06-06] — EP1: Project scaffold, design system, and server foundation

**Client (`client/`)**
- Next.js 16 App Router bootstrapped with TypeScript strict mode, Tailwind v4, ESLint
- Tailwind v4 configured with `@theme inline` — all colour utilities (`bg-primary-navy`, `text-accent-green`, etc.) map to `tokens.css` CSS custom properties; no hardcoded hex values anywhere
- Inter and JetBrains Mono loaded via `next/font/google` for optimal performance
- UI primitives created in `client/src/components/ui/`:
  - `Button` — 5 variants (primary, secondary, tertiary, phone, whatsapp), disabled state, block width
  - `Input` — label, placeholder, error state with amber styling
  - `Card` — default and elevated (shadow-sm) variants
  - `Badge` — outline, amber, and green variants
- Primitives showcase page at `/` — fully static (SSG), EP1 definition-of-done page

**Server (`server/`)**
- Express + TypeScript bootstrapped as an independent package
- Middleware chain: CORS (origin = `CLIENT_URL`) → Helmet → cookie-parser → JSON body parser → routes → error handler
- `GET /health` returns `{"status":"ok"}` — used for uptime checks and deploy smoke tests
- Shared utilities: `ApiError` (typed operational errors), `asyncHandler` (async route wrapper), `envelope` (standard response shape)
- Global error handler: separates `ApiError` (operational, surfaces to client) from unknown errors (generic 500)
- `server/.env.example` documents all required environment variables

**Infrastructure**
- `client/` and `server/` are fully independent packages — separate `package.json`, `node_modules`, and deploy targets
- `client/` → Hostinger Business plan (Node.js app, `gstnoticesupport.in`) · `server/` → Hostinger Business plan (Node.js app, `api.gstnoticesupport.in`, entry point `dist/index.js`)
- `server/.env` excluded from git; `.env.example` committed as template
