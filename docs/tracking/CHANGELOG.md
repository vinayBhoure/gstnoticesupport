# Changelog — gstnoticesupport.in

> User-facing and developer-significant changes, newest first.
> Format: `## [date] — description`

---

## [2026-07-11] — perf: shared scroll-reveal observers + bundle-size CI guardrail

**Branch: `fix/client-performance-audit` (phase 2). Closes audit finding 7 and adds the long-term "CI budget check" recommendation, adapted to this repo's actual toolchain.**

- **`useInView.ts` now shares IntersectionObservers**: the hook previously opened one browser observer per animated element — the homepage alone renders ~28 `AnimateIn`/`CountUp` instances. Refactored to one shared observer per distinct `(threshold, rootMargin)` pair via a module-level registry; public API (`[ref, visible]`, options, defaults) is unchanged, so every call site (`AnimateIn.tsx`, `CountUp.tsx`, homepage, pricing, all 5 service pages) needed zero edits.
- **New build-time bundle-size guardrail** (`client/scripts/check-bundle-budget.mjs`, wired as `postbuild`): fails `npm run build` if any `public/` asset or `.next/static/chunks/*.js` file exceeds its budget (hero video ≤3MB, other public assets ≤200KB each, largest JS chunk ≤400KB, total chunks ≤2.5MB). This repo has no CI workflows, so the check runs on every local and Hostinger-deploy build instead — it would have caught the original 11MB unposterred hero video before it ever shipped. Negative-tested with a temporary oversized dummy file (never committed).

## [2026-07-11] — perf: client bundle & rendering audit fixes

**Branch: `fix/client-performance-audit`. Implements findings 1–6 of the Next.js performance audit (finding 7, the homepage scroll-reveal refactor, deferred — low impact vs. prototype-parity regression risk).**

- **`/public` assets now cache immutably**: `hero-section.mp4`, `hero-poster.jpg`, and `logo.png` were served with `Cache-Control: max-age=0` (Next's unconfigured default) while hashed `/_next/static` chunks already got a full year — added an explicit `headers()` rule in `next.config.ts`. Also enabled AVIF (alongside WebP) and raised the image-optimizer cache TTL to 31 days.
- **Hero video compressed 11.18 MB → 1.65 MB** (1080p → 720p H.264, CRF 28) with a new poster frame + `preload="metadata"`, replacing the previous unposterred autoplay that painted a blank box until the full file downloaded.
- **Logo source shrunk 908 KB → 51 KB** (1254×1254 → 256×256) — the optimizer already delivered correctly-sized bytes to users, but every first request paid a full decode of the oversized source, and it bloated every checkout/deploy.
- **react-calendly code-split out of the root layout**: it previously shipped (~16 KB gzip) on every route including `/privacy`, `/terms`, the 404 page, and the entire admin/dashboard surface. Moved the listener to `(public)/layout.tsx` via a new `CalendlyListenerLoader`, and `RequestCallbackButton` now defers loading the popup module until the first click.
- **Dashboard bookings fetch now starts concurrently with the auth check** instead of waiting for it — `bookingApi.list` only needs the raw cookie header, not the resolved user, so the two requests no longer run serially.
- Verified via production `next build` + `next start` + `curl` header inspection, `.next` chunk-manifest analysis, and route-table diffing against baseline; see the audit artifact for full evidence. Logged-in dashboard render path flagged for staging QA (Express API not reachable in the dev sandbox this was built in).

## [2026-07-08] — fix: resolve production deploy blockers on the split Hostinger frontend/backend repos

**See D93, ERROR.md #9–#11.**

- **Schema-sync build crash** in the standalone `frontend.gstnoticesupport` repo (client-only, no `server/` sibling): `sync-shared-schemas.mjs` now skips gracefully and uses the already-committed generated files instead of throwing `ENOENT`.
- **CORS blocked on login** (`No 'Access-Control-Allow-Origin' header`): root cause was a trailing slash on the backend's `CLIENT_URL` env var, which broke the `cors` package's exact-origin match. Also fixed a related double-slash in API request URLs (`client.ts`/`session.ts` now strip trailing slashes from `NEXT_PUBLIC_API_URL` defensively).
- **Login/signup succeeded but never redirected past `/login`**: the auth cookie was scoped only to `api.gstnoticesupport.in` (no `COOKIE_DOMAIN` set), so the frontend's own Server Components never saw it when calling `/auth/me`. Fixed via `COOKIE_DOMAIN=.gstnoticesupport.in` on the backend.
- **Backend `tsc` build failure on Hostinger** (`'env' is possibly 'undefined'`): `server/src/lib/env.ts`'s control-flow narrowing after `process.exit(1)` depended on `@types/node`'s `never` return type, which didn't hold in Hostinger's build environment. Added an explicit `throw` so the narrowing no longer depends on that.
- All fixes applied in this monorepo and manually synced into the two standalone deploy repos.

## [2026-07-05] — fix: decouple admin notification recipient from the admin login identity

**Corrects D89. Branch: `fix/admin-notification-recipient-decouple`. See D92.**

- D89 repointed `ADMIN_EMAIL` to an external inbox, but `ADMIN_EMAIL` is also the admin account's **login/seed identity** (looked up by the seed and every admin fixture/test). Changing it broke admin login, the seed lookup, and the Admin/Payments/FinalDraft Newman suites (no admin row for the new address).
- New optional **`ADMIN_NOTIFICATION_EMAIL`** env var (falls back to `ADMIN_EMAIL`) is now the delivery target for all admin notification emails. `ADMIN_EMAIL` is restored to the branded identity (`admin@gstnoticesupport.in`); `ADMIN_NOTIFICATION_EMAIL` carries the external inbox. Surfaced while building the feature test suites.
- No behavior change to which events notify admin; only where the mail is delivered vs. who the admin logs in as.

## [2026-07-05] — feat: Representation Before Authority is now a bookable service (custom per-booking pricing)

**Promotes the existing consultation-only marketing service into a fully bookable one. Branch: `feature/phase-2/representation-service`. See D91.**

- **New `ServiceType` value `representation`** (migration `add_representation_service_and_quoted_amount`) threaded through the Prisma enum, `SERVICE_TYPES`, client `ServiceType` union, `SERVICE_META` (label + "Custom Quote"), `SERVICE_ORDER`, and the wizard's icon map (Gavel).
- **Per-booking custom pricing**: new nullable `quotedAmountPaise` column. Because representation is consultation-priced, the admin enters the fee on the Draft card when confirming the draft; the Razorpay order and the user's pay-to-unlock screen then use that quote instead of a fixed price. `SERVICE_PRICING` excludes representation; a new `getBookingAmountPaise` resolves fixed price vs. quote.
- **Server rules**: `draft-confirm` requires a `quotedAmountPaise` (₹500–₹1,00,000) for representation and rejects it for other services; payment initiate returns `409 QUOTE_REQUIRED` if a representation booking is somehow payable without a quote (defensive — it can't reach draft_ready without one).
- **Booking wizard**: representation appears as a 5th service card (third row) with a "Custom Quote" price and a note that the fee is confirmed after case review.
- **Fee display**: the booking detail meta and the pay-to-unlock fee row show the quoted amount (via a shared `formatInr` helper) when set, else the fixed display price.
- **Marketing**: the service page + pricing card keep the consultation positioning but the CTAs now say "Book This Service" (they already routed to the wizard) and copy explains the quote-in-dashboard flow. No pre-deposit applies. Verified via server `tsc`, client `tsc`, and a full `next build` (representation page still static).

## [2026-07-04] — feat: admin can upload a final (post-payment) draft; user gets a version toggle

**Adds a post-payment deliverable distinct from the pre-payment draft. Branch: `feature/phase-2/final-draft`. See D90.**

- **New `finalDraftS3Key` column** (migration `add_final_draft_s3_key`) — the original `draftS3Key` (the version the user pays to unlock) is preserved; the final draft is a separate artifact.
- **Two new admin endpoints**: `POST /admin/bookings/:id/final-draft-upload-url` and `.../final-draft-confirm` — same PDF/20 MB limits and pre-signed-S3 flow as the pre-payment draft, but gated on `filing`/`complete` (the final draft cannot be uploaded before the user pays). Uses a distinct `final-drafts/{bookingId}-…` S3 key prefix. Uploading never changes the booking status.
- **New admin UI**: a `Final Draft` card on the booking detail page, shown below the existing Draft card — locked ("Available once the user completes payment") until payment, then a dropzone / replace flow.
- **User side**: `GET /bookings/:id/draft-url` gains an optional `?variant=original|final` param (omitted → final if present, else original). The Draft Viewer shows a **Final Draft / Original Draft** toggle when a final draft exists; existing "View Draft" links become "View Final Draft".
- **User email**: first final-draft upload sends "Your final draft is available"; a replacement sends "Your final draft has been updated" (user-only, mirroring the draft-ready/updated pair).
- DTOs expose only a derived `hasFinalDraft` boolean — the S3 key never leaves the server. Verified via server `tsc`, client `tsc`, and a full `next build` (route strategy unchanged).

## [2026-07-04] — fix: admin notifications delivered to external inbox + email delivery observability

**Root-cause fix for "admin receives no notification emails" (users always did). Branch: `feature/phase-2/admin-notification-delivery`. See D89.**

- Confirmed every admin-notification trigger is correctly wired in code — the failure was delivery, not dispatch. Both `ADMIN_EMAIL` (server) and `CONTACT_TO_EMAIL` (client) pointed at `admin@gstnoticesupport.in`, the same domain as the Resend sender, whose SPF/DKIM/DMARC are not yet verified, so same-domain mail could silently bounce/suppress.
- **Recipient repointed** to an external inbox the operator reads (`.env` local change; not committed). `.env.example` on both sides now warns against a recipient on the sender's own domain until DNS is verified.
- **Email transport now surfaces outcomes**: `emailService.sendEmail` accepts an optional `event` name and returns `{ok:true,id}` / `{ok:false,reason}`, logging `Email sent`/failure with the event slug and Resend id — still best-effort (never throws, callers unchanged) and still never logs recipient/OTP/body. Every `notificationService` call and the client contact/callback routes now log delivery results.
- **Manual follow-up** (documented, not code): verify the `gstnoticesupport.in` sending domain (SPF/DKIM/DMARC) in Resend so branded same-domain admin addresses become deliverable.
- No new endpoints, no schema/DB change, no in-app notification system.

## [2026-07-04] — feat(client): landing page UI refinement — nav cleanup, booking CTA, testimonials, pricing polish

**Ships a landing-page visual/UX pass across the homepage and all 5 service pages, requested directly (no dedicated feature branch this session). See D88 for the prototype-parity and D86-carve-out deviations this introduces.**

- **Navigation** — removed "Request Callback" and "Sign Up" from the desktop header, mobile drawer, and mobile sticky bar (`Navbar.tsx`, `NavAuthActions.tsx`, `ScrollShell.tsx`); nav is now Logo · Services · About · FAQ · Pricing · Contact Us · Log In. Now-unused `NAV_LABELS.callback`/`.signup` removed; the `/signup` route itself is unchanged and still reachable from the login page.
- **Booking flow** — service pages' "Book Service" CTAs (hero + pricing section, all 5 services) now route to the booking wizard via a new `BookServiceButton` client component: logged-in users go straight to `/dashboard/bookings/new`; guests go to `/login?returnTo=...` and land back on the wizard after authenticating, via a new `sanitizeReturnTo` open-redirect guard (`client/src/lib/auth/return-to.ts`). Home and About page CTAs updated to use the same component for consistency.
- **Choose Your Service** — card content is now center-aligned; the "Pre-deposit required by law" badge moved above the price.
- **Testimonials** — removed the "Chartered Accountants" tab; default tab is now "Business Owners"; each card now shows the client's business name above the quote (`TestimonialItem.business`).
- **Pricing** — homepage tiers and the `/pricing` page now share one consistent spacing/typography rhythm (card padding, feature-list gaps, CTA-block spacing, grid gap); no pricing numbers, feature copy, or pre-deposit disclosure text changed.
- Verified via `next build` + `next lint` (both clean) and a live Playwright walkthrough of desktop/mobile nav, the guest→login→booking redirect chain, and all three content sections.

## [2026-07-04] — refactor: remove phone number from Dashboard/Admin app-shell topbars

**Closes the "mobile number removed" requirement from a post-launch implementation audit. Branch: `feature/phase-2/topbar-phone-removal`. See D87 for the prototype-parity deviation this deliberately introduces.**

- Removed the `.tap-call` phone link and its `formatPhone` helper from both `DashboardShell` and `AdminShell` topbars.
- `ORG.phone` itself is unchanged — still used by WhatsApp links, the Organization JSON-LD schema, and the Admin Settings business-info panel.
- No other shell element affected; `next build` confirms route structure and rendering strategy are unchanged.

## [2026-07-04] — feat: auth-aware public header + Book Service routes to the dashboard

**Closes the "no Login/Sign Up entry point" and "Book Service goes to WhatsApp" gaps from a post-launch implementation audit. Branch: `feature/phase-2/public-header-auth`. See D86 for full rationale, including why this is a client-side check rather than a Server Component fetch.**

- Public marketing header (`Navbar`) now shows **Log In / Sign Up** when logged out, or a role-aware **Dashboard** link when logged in — via a new `NavAuthActions` Client Component leaf backed by a new `useCurrentUser` hook (TanStack Query, `GET /auth/me`). Marketing pages remain fully static (`○` in `next build`) — this is a cosmetic client-side check only, not a Server Component fetch, so the locked SSG guarantee for the public site is preserved.
- The four **generic** "Book Service" CTAs (homepage hero, homepage final CTA, About page hero, About page final CTA) now route to `/dashboard/bookings/new` instead of a WhatsApp deep-link. Service-specific "Book X — ₹price" CTAs on service pages are unchanged and still open WhatsApp.
- Removed now-orphaned `whatsappHref` fields and the now-unused `WHATSAPP_LINKS.home`/`.about` entries.

## [2026-07-04] — feat: notification-matrix gap closures (account deleted, welcome, service-complete admin alert, callback)

**Closes four notification gaps identified in a post-launch implementation audit. Branch: `feature/phase-2/notification-gaps`. See D85 for full rationale and the audit's reconciliation against HLD §12.2.**

- **Account Deleted → User + Admin** — `notificationService.sendAccountDeleted`, fired from `userService.deleteAccount` right after the soft-delete succeeds (email/name captured before deletion). Closes the one undisputed gap from the audit.
- **Welcome email → User** — `notificationService.sendWelcome`, fired from `authService.verifyOtp` once the account is confirmed (not at signup). New `welcomeUser` template.
- **Service Completed → also Admin** — `sendStatusComplete` extended to email both user and admin (`statusCompleteAdmin` template added); the existing call site in `admin.service.ts` is unchanged.
- **Request Callback → admin-only platform alert** — new `POST /api/callback` Next.js Route Handler (mirrors the existing `/api/contact` pattern: Resend + React Email + `checkRateLimit`), fired by a single app-wide `CalendlyCallbackListener` mounted once in root `layout.tsx`. Deliberately **not** wired per-`RequestCallbackButton` instance — `useCalendlyEventListener` attaches a global `window` listener, so one app-wide mount avoids firing duplicate emails when multiple callback buttons are mounted on the same page. Admin-only because Calendly's client event exposes no invitee name/email without an API token (not available); the user's own confirmation email continues to come directly from Calendly, unchanged.
- No changes to the payment/webhook idempotency core, the booking state machine, or any existing endpoint contract.

## [2026-07-04] — feat: My Services, Payment History & Settings pages + user account endpoints

**Completes the user dashboard's remaining prototype screens and wires the mobile tab bar. Branch: `feature/phase-2/user-pages`.**

**New backend endpoints** (`/api/v1/user`, all authenticate-gated; `user.routes.ts` → `user.controller.ts` → `user.service.ts`)
- `GET /user/payment-history` — captured payments across all of the user's bookings, joined with each booking's service type + status, newest-first, offset-paginated (default 20 / max 100, D64). New `paymentRepository.findCapturedByUserId` + `PaymentHistoryItemDTO`. Only `captured` records appear (KB1 §8.1) — pending/failed attempts and cancelled bookings never show.
- `PATCH /user/profile` — updates name / phone / `allowPromotions` only; email and `interestedServices` are never editable (D67). Extends `userRepository.updateProfile` to accept `allowPromotions`.
- `DELETE /user` — self-serve account closure (KB1 §13): type-your-own-email confirmation (D24 — `EMAIL_MISMATCH` 400, no OTP/password), blocked while any booking is active (`ACTIVE_BOOKINGS` 409, reusing `bookingRepository.countActiveByUserId`), then soft-delete + revoke all refresh tokens + blacklist the current access JTI + clear both cookies. Bookings and payment records are retained (tax law); the 7-day S3 hard-delete job is still pending (EP15).
- `user.schema.ts` added to the client schema-sync allow-list so the frontend validates against the same Zod definitions.

**My Services** (`/dashboard/services`, `Services List.html`) — SSR page fetching `GET /bookings`; `ServicesListView` client leaf provides the All/Active/Complete/Cancelled filter (in-memory — the list is per-user and unpaginated). Desktop stretched-row table; mobile reuses `BookingCard`. New-user vs filtered empty states. Rows link to the Service Detail page.

**Payment History** (`/dashboard/payments`, `Payment History.html`) — fully server-rendered; URL-driven offset pagination via the reused admin `Pagination` component. Desktop table (Date / Service / Reference / Amount / Status / Receipt / View) + mobile cards; amounts formatted in INR from `amountPaise`; status uses the booking's `StatusBadge`. **Receipt link → the booking's Service Detail page** (D83): Razorpay exposes no hosted customer receipt URL and D64 forbids an in-house PDF, so — exactly as the prototype does — the receipt icon opens the service page.

**Settings** (`/dashboard/settings`, `Settings.html`, trimmed to Phase-2 scope per D84) — breadcrumb + scroll-spy side-nav over three panels: **Account** (`AccountSettingsForm`: name, mobile, marketing-email toggle → `PATCH /user/profile`; email shown read-only), **Security** (`ChangePasswordPanel` → existing `POST /auth/change-password`), **Danger zone** (`CloseAccountSection`: disabled with a reason while bookings are active, else type-email confirm → `DELETE /user` → redirect home). 2FA, active sessions/devices, billing entity/GSTIN, data export, and language/timezone from the prototype are **out of Phase-2 scope (HLD §19) and omitted rather than faked** (My Profile precedent). The danger zone uses **amber, not the prototype's red** — pure red is forbidden by the design system and amber is the app's only destructive-action colour (matching `.btn-danger` / CancelBookingButton).

**App shell** — `DashboardShell` sidebar and drawer gain My Services / Payments / Settings links, the account menu gains Settings, and the **mobile bottom tab bar** (Dashboard / Services / Payments / Settings, `<lg` only) is added now that all four targets exist (closes D80h). All dashboard pages get extra mobile bottom padding to clear the bar.

**Verified** — `server` `tsc` build and `client` `next build` both green (new `/dashboard/{services,payments,settings}` routes registered as SSR); `tsc --noEmit` clean on both. Live route smoke test against the running server: the three new `/user/*` routes return `401` unauthenticated (auth gate wired, not 404) with the correct error envelope, a bogus `/user/*` path returns 404. Authenticated browser QA against a logged-in session (incl. the destructive delete flow) is left for staging.

---

## [2026-07-03] — feat(client): EP11 My Profile page — read-only account details

**Closes the last EP11 leftover. Branch: `feature/phase-2/profile-page`.**

**`/dashboard/profile`** per `My Profile.html` — Identity panel (avatar initials, name, "Member since") + Contact Details panel (email + Verified badge, mobile or "Not provided", interested-services chips, promotional-updates status, terms-accepted badge). Data comes entirely from the already-fetched `requireUser()` result (`GET /auth/me`) — no extra request. **Read-only by design**: `complete-profile` is a one-time step and `PATCH /user/profile` doesn't exist yet (EP15), so the prototype's edit inputs, KYC/PAN/GSTIN fields, engagement stats, and activity log are omitted rather than faked — a muted note points users to Contact support instead. Linked from the dashboard account menu ("My Profile", above Log out), matching the prototype's account-dropdown placement.

**Verified** — `tsc --noEmit` clean, `next build` green (new `/dashboard/profile` route), lint clean (no new findings beyond pre-existing Phase 1 items).

---

## [2026-07-03] — feat(client): EP12 payment UI — pay-to-unlock, Razorpay Checkout, and the payment verify page

**Fills the D74 placeholder: users can now actually pay to unlock their draft. Branch: `feature/phase-2/payment-ui`.**

**`PayToUnlock`** (`components/booking/PayToUnlock.tsx`) — renders at the `draft_ready` + unpaid slot in `BookingActionPanel`, below the pre-deposit disclosure (touchpoint #4, KB2 §7) and fee row. Click → `POST /payments/:bookingId/initiate` → loads Razorpay Checkout.js on demand (`lib/razorpay-checkout.ts`, idempotent injector, no `next/script` mount since the script is only needed behind this conditional panel) → opens Checkout with a **`handler` callback, not `callback_url` redirect** — Razorpay's redirect mode POSTs form data, which a Next.js page route can't receive. The handler takes the server-returned `callbackUrl` (already carries `booking_id`) and appends the three `razorpay_*` params as a same-origin GET, so cookies flow naturally and the shape matches `verifyQuerySchema` exactly (no PII in the URL — RULES.md §4.2). `modal.ondismiss` and `payment.failed` both reset the button; `INVALID_STATUS`/`PAYMENT_ALREADY_CAPTURED` from `initiate` trigger a toast + `router.refresh()` (state drifted since page load).

**`/payment/verify`** — dynamic Server Component + `PaymentVerifier` client leaf per `Payment Verification.html` (own chromeless shell, not the shared `AuthCardShell`). The page shape-validates the redirect query with the synced `verifyQuerySchema` **before** any network call — malformed params never reach the API and render the invalid-link state directly. Valid params mount `PaymentVerifier`, a one-shot `useQuery` (`retry:false`) against `GET /payments/verify`, mapped to five states: loading (spinner) → **success** (auto `router.replace` to the booking after 1.5s + a manual fallback link) / **failed** (no amount deducted, retry from service page) / **inconclusive** (booking ref + WhatsApp support link, per plan) / **tampered** (reuses the invalid-link state — no ownership was confirmed, so no booking link is shown). A network/auth error on the verify call itself falls back to the inconclusive-style copy with a Retry button.

**Client plumbing** — `payment.schema.ts` added to the schema sync allow-list; `paymentApi` module (`initiate`, `verify`); `InitiateOrderDTO`/`VerifyResultDTO` mirrored in `lib/api/types.ts`.

**Verified end-to-end against a live server** (no server code changed this branch): `tsc --noEmit` and `next build` clean (new `/payment/verify` route registered), lint clean. Live smoke test: created a `draft_ready` booking via the existing `setup-draft-ready-booking.mjs` fixture, called `POST /payments/:id/initiate` as the owner — response shape (`orderId`, `keyId`, `prefill`, `callbackUrl`) matches exactly what `PayToUnlock` and the verify handler consume; called `GET /payments/verify` with a fabricated signature → `{"outcome":"tampered"}`, confirming the exact fallback path `PaymentVerifier` renders; confirmed malformed-shape and invalid-UUID requests are rejected server-side with `VALIDATION_ERROR` (the client never reaches this — its own Zod shape check intercepts first) and that the route is `401` when unauthenticated. A real captured payment requires live Razorpay Checkout (test card / UPI) and is deferred to manual QA, same constraint as the existing D77 payments Newman suite.

---

## [2026-07-03] — feat(admin): EP13 admin frontend — all six prototype screens + role-based routing + supporting backend endpoints

**The admin can now run the entire operation from the browser. All six `resources/ui/Admin *.html` prototypes are implemented, admins are routed to their own surface at login, and six small backend additions close the gaps the prototypes needed. Branch: `feature/phase-2/admin-surface`.**

**Role-based routing** — login now redirects by role (`admin` → `/admin`, `user` → `/dashboard`); the `(dashboard)` layout bounces admins to `/admin`; `redirectIfAuthenticated` is role-aware; the new `(admin)` layout gates everything with `requireAdmin()` (anonymous → `/login`, non-admin → `/dashboard`).

**New backend endpoints (user-approved scope extension)**
- `GET /admin/users` — paginated (default 20/max 100), case-insensitive name/email search; `role=user`, soft-deleted excluded.
- `GET /admin/users/:id` — detail + `activeBookingsCount`.
- `DELETE /admin/users/:id` — **soft delete only**, blocked with `409 USER_HAS_ACTIVE_BOOKINGS` while any booking is active; bookings/payments retained (database.md §3).
- `POST /auth/change-password` — authenticated; bcrypt-verifies current password (`401 INVALID_CREDENTIALS`), revokes other refresh tokens on success. Rate-limited.
- `GET /admin/bookings` gains `search` (user name/email), `sortBy` (`createdAt|updatedAt`), `sortDir` — defaults unchanged (`createdAt desc`) so the existing Newman suite is unaffected.
- `GET /admin/bookings/:id/documents/:documentId/download-url` — pre-signed GET for user documents (admin download buttons); s3Key never exposed.

**Admin screens** (new `(admin)` route group + `AdminShell` sidebar shell, desktop-primary)
- **Overview `/admin`** — KPI row (Total Bookings + per-service sub-line, Bookings-by-Status badge grid, Revenue Collected ₹), "Needs attention" queue (draft-ready unpaid + in-review, newest first).
- **Bookings `/admin/bookings`** — debounced search, status/service/payment filter selects, sortable Booking Date/Updated columns, `paginated()`-driven pagination, booking-ref sub-line, payment + status badges. URL-driven throughout.
- **Booking Detail `/admin/bookings/[id]`** — user info, document list with per-file Download (fresh pre-signed URL per click), Admin Note editor (5000-char, clears on empty), sticky right column: Draft card (dropzone → XHR progress → confirm auto-transitions to `draft_ready`; Replace; locked once payment begins) and Status Actions (Set to In Review / Mark-as-Paid panel with Razorpay-verified override and exact error mapping / Mark Complete / per-status hints).
- **Users `/admin/users`** + **User Detail `/admin/users/[id]`** — searchable list; read-only profile; Delete User with type-the-email confirmation dialog, gated on active bookings.
- **Settings `/admin/settings`** — Change Password (shared `changePasswordSchema`, strength meter, show/hide toggles) + read-only Business Information from `lib/site.ts`.

**Client plumbing** — `admin.schema.ts` added to the schema sync allow-list; `apiClient.getList()` (keeps the `paginated()` envelope's `meta`); `adminApi` module; admin DTO mirrors in `lib/api/types.ts`; `authApi.changePassword`.

**Verified** — server + client `tsc --noEmit` clean; `next build` green (5 admin routes); lint clean for all new files; live smoke test against the dev server: admin login, users list/search/detail (`activeBookingsCount`), bookings search+sort, change-password wrong-current → `401 INVALID_CREDENTIALS`, bogus document download-url → 404, unauthenticated → 401. Destructive paths (actual delete-user, real password change) left for manual QA.

---

## [2026-07-03] — feat(client): EP11 UI parity — authenticated screens now match the `resources/ui` prototypes exactly

**Full visual parity pass over every existing Phase 2 screen (restyle/re-layout only — zero API, data-flow, or backend change). The user flagged that the EP11 screens worked but did not match the prototype HTML; this branch (`feature/phase-2/ui-parity`) closes that gap and is the base for the payment (EP12) and admin (EP13) frontends.**

**App Shell (new)** — `components/dashboard/DashboardShell.tsx` per `Dashboard Home.html`: fixed 264px sidebar (brand, Dashboard nav, Help & Support), sticky blurred topbar (tap-to-call from `ORG.phone`, account menu with avatar initials + logout), mobile slide-in drawer + scrim with Escape/scrim/navigation close. Mounted via a new nested route group: `(dashboard)/(shell)/…` wraps dashboard home, booking detail, and draft viewer; `(dashboard)/(flow)/…` keeps the booking wizard chromeless (prototype "focused flow shell"). URLs unchanged. `getCurrentUser` wrapped in React `cache()` so layout+page share one `/auth/me` fetch per request.

**Dashboard Home** — time-based greeting (IST) + date, summary strip (Active/Complete/Cancelled), amber attention banner for draft-ready bookings, 3-col Active Services `cards-grid` with prototype `booking-card`s (draft-ready renders first with amber left border), Past Services section, prototype empty state and skeleton `loading.tsx`.

**Booking wizard Steps 1–3** — focused flow shell (logo top bar + "Save & Exit", stepper rail, sticky footer bar with Back/Continue). Step 1: 2×2 Notice Type Selector Cards with icons, prices (from `pricing.tsx` values, now in `SERVICE_META.priceDisplay` — display only, charge stays server-derived), selected checkmark, animated pre-deposit region; Step 2: prototype Form Field Primitives (+91 phone-wrap prefix, mono GSTIN, green focus ring), "A Client" toggle label; Step 3: prototype dropzone (constraints line, privacy note, per-file rows with real XHR upload progress bars + icon→check confirmation animation), Booking Summary reveal after first upload, "Submit Booking" → prototype success state with booking ref.

**Service Detail (booking detail)** — breadcrumb, status row + `booking-meta`, 60/40 two-col layout: left Case Information `dl.kv` + Uploaded Documents `doc-list` + confidentiality note; right sticky status **action panel** with the prototype's per-status panels (Documents Received / Under Review / Draft Ready with Expert Summary + fee row + lock icon [EP12 CTA slot, D74] / Filing with View Draft / green Service Complete / Cancelled with re-book link). Cancel is now the prototype `cancel-link` + inline "Are you sure?" confirm (amber `btn-danger`). Admin note renders as "Expert Summary" inside the panel.

**Draft Viewer** — back link, breadcrumb, "Draft Reply — {service}" head with Download Draft button, amber expiry notice with live 15:00 countdown, `viewer-shell` with the four prototype states (Loading spin-ring / Loaded iframe / **Link Expired** lock + Generate New Link / Load Error + Retry), read-only note.

**Shared components restyled** — `StatusBadge` (prototype `s-*` classes + canonical icons from Service Detail STATUS_CONFIG), `BookingCard`, `Stepper` (rail + connectors, 300ms), `SegmentedToggle`, `PreDepositNotice` (`predep-banner`), `Input` (separated +91 prefix block), `DocumentUpload`. `NEXT_ACTION_COPY` aligned to prototype copy. New `uploadToS3WithProgress` (XHR) in `lib/api/document.ts`.

**Verified** — `tsc --noEmit` clean; `next build` green (all routes resolve, `(shell)`/`(flow)` groups merge correctly); the one new lint finding (drawer close-on-navigation effect) fixed via adjust-state-during-render; remaining lint errors are pre-existing Phase 1 items. Deviations from prototypes are logged as D80.

**The single admin can now run a case end-to-end: review bookings, transition status, upload the draft PDF, add notes, override payment (Layer 3), and view overview stats. All 8 `api_contract.md §6` endpoints. Reuses Phases 0–5 primitives; no existing user-facing behaviour changed. Admin frontend deferred.**

**New endpoints (`/api/v1/admin`, all `authenticate → requireRole('admin')`)**
- `GET /admin/bookings` — list, offset pagination (default 20, max 100), filters `status`/`paymentStatus`/`serviceType`; each item joins `user{id,name,email}`. `paginated()` envelope.
- `GET /admin/bookings/:id` — full detail: user, all documents, **all** payment attempts (D66 `source` visible), derived `hasDraft`. `draftS3Key`/`s3Key` never returned.
- `PATCH /admin/bookings/:id/status` — body `in_review | complete` only; legality enforced by `booking-state-machine.assertTransition` (illegal → `409 INVALID_TRANSITION`); emails user (in_review / complete).
- `POST /admin/bookings/:id/draft-upload-url` — pre-signed PUT, PDF only, ≤20 MB; gate status ∈ {`in_review`,`draft_ready`} else `409 DRAFT_LOCKED`; key `drafts/{bookingId}-{yyyyMMdd}-{name}-{4rand}.pdf`. Rate: 15/hr.
- `POST /admin/bookings/:id/draft-confirm` — sets `draft_s3_key` + transitions to `draft_ready`; first draft emails **draft-ready**, re-upload emails **draft-updated**. No `booking_documents` row (draft delivered only via `draftS3Key`, kept out of the user's document list). `s3Key` must be prefixed `drafts/{id}-`.
- `PATCH /admin/bookings/:id/note` — `admin_note` ≤5000 chars, user-visible; empty string clears.
- `POST /admin/bookings/:id/mark-paid` — Layer 3 override. `assertPayable` gate → Razorpay **Fetch Payment API** (must be `captured`, else `422 PAYMENT_NOT_CAPTURED`; API failure → `502 RAZORPAY_ERROR`) → **cross-booking guard** (fetched order must belong to this booking) → shared `paymentService.processCaptured({ source: admin_override, performedByAdminId })`. Idempotent via the same D76 core.
- `GET /admin/stats` — `totalBookings`, `byStatus`, `byServiceType` (zero-filled), `totalRevenuePaise` (sum of `captured`).

**New files** — `routes/admin.routes.ts`, `controllers/admin.controller.ts`, `services/admin.service.ts`, `schemas/admin.schema.ts`, `dto/admin.dto.ts`.

**Modified (additive)** — `routes/index.ts` (register `/admin`); `repositories/booking.repository.ts` (`findAllForAdmin`, `findByIdForAdmin`, `setAdminNote`, `setDraftAndStatus`, `countGroupedByStatus`, `countGroupedByServiceType`); `repositories/payment.repository.ts` (`sumCapturedRevenuePaise`); `lib/s3.ts` (`buildDraftKey`); `lib/rateLimiter.ts` (`adminDraftUploadRateLimiter` 15/hr); `services/notification.service.ts` + `emails/templates.ts` (4 user-facing templates: in_review, draft-ready, draft-updated, complete).

**Pre-deposit disclosure (KB2 §7)** — the draft-ready and draft-updated emails render the statutory pre-deposit notice for `commissioner_appeal` / `gstat_appeal`, matching the client `PreDepositNotice.tsx` copy — the fourth mandatory touchpoint alongside pricing page, booking Step 1, and pay-to-unlock.

**Mark-paid reuses Phase 5, does not insert a new row (D78)** — clarifies D66: the shared `processCaptured` core updates the `created` order row in place to `source=admin_override` + `performed_by_admin_id`; the D66 audit intent is fully met. A repeat `mark-paid` is rejected at the `assertPayable` gate (`PAYMENT_ALREADY_CAPTURED`).

**Verified** — `tsc --noEmit` clean; full route-registry module graph loads at runtime with `.env` (no circular-import/export errors). No `any`/`console.log` in new code. Full Newman acceptance pass (see next entry): **50/50 requests, 109/109 assertions, 0 failures**. `npm run lint` is a pre-existing no-op (no ESLint config in repo) — unrelated to this change.

---

## [2026-07-01] — test: EP13 — Admin Surface Newman suite (50 requests / 109 assertions, all green)

**Automated API test coverage for all 8 `/api/v1/admin` endpoints, mirroring the EP12 Payments Newman setup. Full pass confirmed against a live dev server + seeded admin. See D79.**

**New files**
- `test/postman/Admin.postman_collection.json` — 12 folders / 50 requests covering: unauthenticated (401), non-admin RBAC (403 on all 8 routes), list (pagination/filters/validation), detail (asserts `draftS3Key`/document `s3Key` are **never** exposed), status transitions (both legal + all illegal → `INVALID_TRANSITION`), draft-upload-url (`INVALID_FILE_TYPE`/`FILE_TOO_LARGE`/`DRAFT_LOCKED` ×2/valid), draft-confirm (foreign-key reject/`DRAFT_LOCKED`/first-draft/re-upload), note (set/update/clear/too-long), mark-paid gates (`VALIDATION_ERROR`/`NOT_FOUND`/`INVALID_STATUS`/`PAYMENT_ALREADY_CAPTURED`/`RAZORPAY_ERROR`), and stats (zero-filled enum keys, count reconciliation).
- `test/postman/admin-local.postman_environment.json` — placeholders only, no secrets.
- `test/postman/run-admin-newman.sh` — mints fixtures, injects admin creds, runs Newman.
- `server/scripts/setup-admin-fixtures.mjs` — one verified `role=user` account (RBAC checks) + 8 bookings pre-pinned to the exact status each test needs (order-independent, no inter-test coupling).
- `test/postman/ADMIN_TEST_PLAN.md` — full coverage matrix + the manual/deferred paths.

**Result** — `bash test/postman/run-admin-newman.sh`: **50 requests / 50 test-scripts / 109 assertions, 0 failed.**

**Deferred to manual** (same constraint as EP12/D77 — Razorpay exposes no way to fabricate a captured payment via API): `mark-paid` 200 success, the cross-booking guard, idempotency-on-repeat, a real browser→S3 PUT, and email delivery incl. the pre-deposit disclosure.

**Bug found & fixed during this pass (ERROR.md #8)** — the first run failed at admin login (`401`) despite correct credentials, cascading into ~25 apparent downstream failures. Root cause: a stale duplicate `ADMIN_EMAIL`/`ADMIN_PASSWORD` pair in `server/.env` — the app's `dotenv` load is last-value-wins (correct), but the runner's `grep -E "^KEY=" | head -1` extraction grabbed the first (stale) value. Fixed `run-admin-newman.sh` to resolve credentials via `dotenv` directly, matching the app's own resolution; the user also deduplicated `server/.env`. Re-run after both fixes: fully green.

---

## [2026-06-30] — feat(server): EP12 — Payments (Razorpay, 3-layer reliability backend)

**The draft-gated payment mechanic. A user with a `draft_ready` booking can now pay via Razorpay; payment transitions the booking `draft_ready → filing` (unlocking the draft) exactly once across all reliability layers. Layer 3 (admin mark-paid) deferred to EP13 but its shared transition core is built here. Payment frontend (modal + `/payment/verify` page) deferred.**

**New endpoints (`/api/v1`)**
- `POST /payments/:bookingId/initiate` — `assertPayable` gate (`draft_ready` + not paid), price derived server-side from `serviceType`, creates a Razorpay Order + `payment_records` row at `status=created`; returns `orderId`/`keyId`/`prefill`/`callbackUrl`. Rate: 5/hr.
- `GET /payments/verify` — Layer 2 fallback. Verifies redirect signature → ownership → Razorpay Fetch Payment API; returns outcome enum (`success`/`failed`/`inconclusive`/`tampered`), never redirects. Rate: 7/hr.
- `POST /webhooks/razorpay` — Layer 1. Mounted in `index.ts` with `express.raw()` **before** `express.json()`; HMAC-SHA256 verify over raw body (timing-safe) → 400 on failure (no payload log); dispatches `payment.captured`/`payment.failed`; **always returns 200**. Rate-limit exempt.

**New files**
- `server/src/lib/razorpay.ts` — SDK client + `createOrder`, `fetchPayment`, `verifyWebhookSignature`, `verifyPaymentRedirectSignature`.
- `server/src/schemas/payment.schema.ts`, `dto/payment.dto.ts`, `repositories/payment.repository.ts`, `services/payment.service.ts`, `controllers/payment.controller.ts`, `controllers/webhook.controller.ts`, `routes/payment.routes.ts`.

**Idempotency (locked invariant)**
- `payment.repository.captureAndTransition` runs an atomic `$transaction`: a conditional `updateMany` (`status != captured`) claims the order row and only then flips the booking to `filing`/`paid`. The first layer wins (count=1); duplicates get count=0 → no-op. Unique `razorpay_payment_id` violations under a true race are caught and treated as already-processed. The shared `processCaptured` core fires the confirmation email exactly once.

**Notifications** — `sendPaymentConfirmed` (user + admin) on capture; `sendPaymentFailed` (admin only) on failed attempt. Three new brand-styled templates. Best-effort — email failure never blocks a transition.

**Reused** — `lib/pricing.ts` (server-side price), `booking-state-machine.ts` (added `assertPayable`; `draft_ready → filing` already legal), `bookingRepository.findByIdAndUserId` (ownership/404-collapse), `createRateLimiter`, `notificationService`/`emailService`.

**Config** — added `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` to `env.ts` (`.env.example` already listed them). `razorpay@^2.9.6` dependency.

**Verified** — `tsc --noEmit` clean; no `any`/`console.log` in new code. Newman suite `test/postman/Payments.postman_collection.json` (21 requests / 45 assertions, all green) drives the full flow against the live test keys: auth gates (401), `INVALID_STATUS`/`PAYMENT_ALREADY_CAPTURED`/`NOT_FOUND` gates, server-derived amount (₹2,999), real Razorpay Orders API on `initiate`, webhook signature rejection (missing/bad/tampered → 400) and acceptance (200), `payment.captured` → booking `filing`/`paid`, **duplicate delivery → single transition (idempotency)**, `payment.failed` leaves the booking retryable, and verify `tampered`/`inconclusive`/validation outcomes. Run via `test/postman/run-payments-newman.sh` (mints two `draft_ready` fixtures via `server/scripts/setup-draft-ready-booking.mjs`; admin creds + Razorpay secrets injected at runtime, never committed). Not auto-covered by Newman: verify *success* + a real captured webhook (need an actual Razorpay test payment) — the synthetic signed webhook proves the capture→filing→idempotency core.

**Live end-to-end validation (real payment, 2026-07-01)** — completed a real Razorpay test Checkout (Netbanking→Success, since international cards are disabled on the test account) for a `draft_ready` booking. Razorpay delivered the **real signed `payment.captured` webhook** to the API over an ngrok tunnel (`user-agent: Razorpay-Webhook/v1`, valid `x-razorpay-signature`) → handler verified and returned **200** → booking transitioned to `filing`/`paid`. Re-deliveries of related events all returned 200 with a single transition (idempotency on real traffic). Layer 2 verify, called with the real `payment_id`/`order_id`/`signature`, returned `outcome:success` idempotently (no double-processing). Both reliability layers now confirmed with a genuine captured payment.

**Test tooling added** — `test/postman/Payments.postman_collection.json` + `payments-local.postman_environment.json` + `run-payments-newman.sh`; `server/scripts/setup-draft-ready-booking.mjs` (draft-ready fixture); `test/manual/checkout.html` + `initiate.sh` + `verify.sh` (manual real-payment helpers, Path B). See decisions D76–D77 and ERROR.md §6–7.

---

## [2026-06-29] — feat(client): EP11 — Booking, Document Upload & Draft Viewer UI

**Logged-in app wired to the Phase 2 booking/document backend (8 endpoints + draft-url). Consumes every existing un-consumed endpoint; payment-dependent UI (pay-to-unlock) deferred until the Razorpay backend exists.**

**Shared-schema unblock**
- `server/src/schemas/booking.schema.ts` — Refactored `z.nativeEnum(ServiceType/FilingFor)` → `z.enum([...])` literals; dropped the `@prisma/client` import so the schema is now client-safe. Behaviour-identical (literal unions are structurally equal to the Prisma enum types). Added `SERVICE_TYPES`/`FILING_FOR_VALUES` consts.
- `client/scripts/sync-shared-schemas.mjs` — Added `booking.schema.ts` to the sync allow-list; it now syncs to `client/src/lib/shared-schemas/`.

**Typed API surfaces**
- `client/src/lib/api/booking.ts` — `bookingApi.create/list/getById/cancel` (unwraps the nested `booking` key).
- `client/src/lib/api/document.ts` — `documentApi.getUploadUrl/confirmUpload/list/getDraftUrl` + `uploadToS3()` helper (direct browser→S3 PUT, bypasses `apiClient`).
- `client/src/lib/api/types.ts` — Booking domain DTOs + enum unions mirroring `server/src/dto/booking.dto.ts`.

**Components**
- `StatusBadge` — 6 booking statuses → label + icon + token colour (never colour-only).
- `Stepper`, `SegmentedToggle`, `PreDepositNotice` (+ `requiresPreDeposit`), `DocumentUpload` (validate → pre-signed PUT → confirm; drag-drop, per-file progress/error), `BookingCard`.
- `client/src/lib/constants/services.ts`, `booking-status.ts` — service metadata, next-action copy, date/ref helpers.

**Screens (`(dashboard)/` — SSR, auth-gated)**
- `/dashboard` — Server Component fetches `GET /bookings` (cookie-forwarded); booking cards + empty state + "Start a service".
- `/dashboard/bookings/new` — 3-step wizard (service + pre-deposit disclosure → case details RHF+Zod → create booking + upload).
- `/dashboard/bookings/[id]` — case info, documents, admin note, status-dependent action panel (upload / review / draft-ready + cancel / view-draft / cancelled). No pay-to-unlock (deferred).
- `/dashboard/bookings/[id]/draft` — read-only draft viewer (filing/complete only), fetches fresh 15-min pre-signed URL, expiry countdown + regenerate.
- `loading.tsx` / `error.tsx` for `(dashboard)/dashboard` and `bookings/[id]`.

**Backend fix**
- `server/src/services/notification.service.ts` — Login-alert "This wasn't me" link now points at `CLIENT_URL/auth/invalidate` (frontend page) instead of the raw API endpoint, so the user sees a friendly screen.

**Pre-deposit disclosure** present at booking Step 1 and the draft-ready panel for Commissioner/GSTAT Appeal (frontend.md §8.3).

**Build verified** — server + client `tsc --noEmit` clean; `npm run build` exits 0; new routes are `ƒ (Dynamic)`, marketing routes remain `○ (Static)`; new files lint clean. Browser→S3 CORS not yet verified against the live bucket (external config may be required).

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
