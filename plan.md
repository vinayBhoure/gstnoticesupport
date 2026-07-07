# Phase 2 Frontend Build Plan — gstnoticesupport.in

> **Source of truth:** `audit.md` (repo root). This plan operationalizes that audit into 4
> sequential, independently-testable phases. It contains **no application code** — scope,
> file-level plans, component verbs, API wiring, assets, risks, and acceptance checklists only.
>
> **Authority (carried from `audit.md`, binding):**
> 1. Existing `client/` + `design.md` + `components.md` win on every conflict; the prototype at
>    `resources/ui/` is layout/composition/interaction **reference only**.
> 2. Wire to the real API in `docs/architecture/api_contract.md` (sole API source; `api_reference.md`
>    does not exist).
> 3. Reuse first: existing components → `components.md` primitives → prototype assets.
> 4. Do not change working Phase 1 functionality unless integration requires it; every touch-point
>    is enumerated per phase and consolidated in the Global Guardrails section.
> 5. Doc precedence: KB2 > KB1 > HLD > LLD > everything else.
>
> All 18 open questions in `audit.md §9` have **confirmed defaults** — treated as approved here.

---

## Locked development practices (apply to every phase)

These are fixed for the entire Phase 2 build. Each phase's execution prompt inherits them.

1. **Component verbs are locked by `audit.md §5`.** Reuse → Extend → New, in that priority. No
   new component may be introduced unless it appears in the §5 matrix as `New`. No speculative
   components.
2. **Design tokens only.** Never hardcode hex. Use `client/src/styles/tokens.css` CSS vars
   (e.g. `var(--accent-green)`, `var(--wa-green)`). Never import `resources/ui/css/tokens.css`.
3. **Styling pattern follows Phase 1.** CSS Modules co-located per page/section + token-based
   component classes appended to `tokens.css`. This is the existing intentional deviation from
   `frontend.md §7.2` — do not fight it (`audit.md §8.2`).
4. **Server Components by default.** `'use client'` only at leaf interactive nodes
   (`frontend.md §1.1–1.2`). Auth verified in Server Components only, never client-side
   (`frontend.md §1.4`).
5. **TanStack Query for all client-side fetching** (`frontend.md §2`). Server Components fetch
   initial data; TQ handles post-interaction mutations/refetch. Never fetch the same data twice.
6. **React Hook Form + `zodResolver` for all forms** (`frontend.md §3`). Import canonical Zod
   schemas; never recreate them. Field-level errors always shown; submit disabled while pending.
7. **Framer Motion only in the 3 sanctioned places** (`design.md §5`, `frontend.md §7.5`):
   Stepper transition, Document Upload confirmation, Pay-to-Unlock reveal. All respect
   `prefers-reduced-motion`. Forbidden UI patterns (`frontend.md §8.2`) never appear in any zone.
8. **Status colors are status-only.** `ServiceStatusBadge` always pairs a Lucide icon + label —
   never color alone (`components.md → Service Status Badge`, `design.md §7`).
9. **Security non-negotiables** (`RULES.md §4`): JWT in HTTP-only cookies only; identity from
   `req.user` server-side, never query params; no PII/tokens in URLs; S3 access via pre-signed
   URLs only; never log secrets/PII; frontend never supplies payment amount.
10. **Pre-deposit disclosure** must appear for Commissioner + GSTAT bookings at every mandatory
    touchpoint reachable in Phase 2: booking flow Step 1 and the Pay-to-Unlock screen
    (`frontend.md §8.3`, KB2 §7). Shown as its own line item, "as per GST Act", never a percentage.
11. **`.claude/` governance honored:** naming conventions (`RULES.md §2`), named exports
    (`RULES.md §1.6`), no `any` (`RULES.md §1.2`), explicit return types on public functions,
    branch/commit conventions (`gitRule.md`, `RULES.md §6`). Run `/review` before each commit.
12. **Next.js version caveat:** `client/AGENTS.md` warns this Next.js has breaking changes from
    training data. Before writing any App Router code, consult `node_modules/next/dist/docs/`.

---

## Backend roadmap alignment (`backend_plan.md`)

The backend is built in 9 phases (0–8). This section reconciles its locked decisions and phase
order against this frontend plan. **Where `api_contract.md` and `backend_plan.md` disagree, the
contract is the wire format the frontend codes against — but the two genuine conflicts below must
be reconciled by the backend before the affected frontend form/page can be finalized.**

### A. Backend decisions that RESOLVE prior open questions

| Backend decision | Was (frontend OQ) | Now (apply this) |
|---|---|---|
| **D64** — Payment History: offset pagination (default 20, max 100) + Razorpay **receipt URL** per row; no in-house invoice PDF | OQ-12 "flat array, no meta"; OQ-13 "no invoice download" | Payment History is **paginated** (`page`/`limit`) and **each row links to the Razorpay-hosted receipt**. Build the list paginated; render a "View Receipt ↗" link. *(The `api_contract.md §2.2` example still shows a flat array with no receipt field — it must be updated to add `meta` + receipt URL; frontend wires to the D64 shape.)* |
| **D65** — Login alert email = IP + sanitized User-Agent only | OQ (login alert content) | No frontend impact. `/auth/invalidate` page unchanged. |
| **D67** — `complete-profile` collects `name` + `phone`; `PATCH /user/profile` handles later updates | OQ-4 "phone not in `UserObject`, degrade gracefully"; OQ-5 "complete-profile = interestedServices only" | **If D67 is the final word:** phone **is** captured and editable → the Settings profile sub-section **shows and edits phone** (OQ-4's graceful-degrade fallback is no longer needed). **But this collides with the contract — see Conflict 1.** |

### B. Conflicts requiring backend reconciliation (⚠️ do not invent a resolution)

1. **⚠️ `complete-profile` scope — HARD CONFLICT.** `api_contract.md §1.4` says complete-profile
   captures **`interestedServices`** (and `UserObject` includes `interestedServices` but **no
   `phone`**, with no other capture point for phone). `backend_plan.md` **D67** says complete-profile
   captures **`name` + `phone`**. These cannot both be true, and under D67 there is **no capture
   point for `interestedServices`** even though `UserObject` returns it. **This blocks finalizing
   `CompleteProfileForm` (Phase 2.1) and the Settings phone field (Phase 2.2).** *Recommended
   resolution:* reconcile to a single contract — likely complete-profile captures
   `interestedServices` **and** `phone` (and `UserObject` adds `phone`) — then update
   `api_contract.md` §1.1/§1.4/§2.1 + the `UserObject` shape accordingly. Until reconciled, build the
   form shell but treat its exact fields as the one open blocker.
2. **Contract response-shape drift (non-blocking).** `GET /user/payment-history` (`§2.2`) and
   `PATCH /user/profile` (`§2.1`) response/field shapes do not yet reflect D64 (pagination + receipt)
   or D67 (phone). Frontend codes to the resolved decisions; flag the contract examples as
   needing an update so FE and BE agree before integration QA.

### C. Confirmations (no change, now backed by the backend plan)

- **OQ-8 transport** — backend **confirms** direct cross-subdomain auth: cookie
  `Domain=.gstnoticesupport.in`, `Secure`, `HttpOnly`, `SameSite=Lax`, CORS per-environment. **But it
  is only wired/validated in backend Phase 8** (staging) — so live cross-subdomain auth QA for FE 2.1
  cannot fully complete until backend Phase 8.
- **OQ-3 enum** — backend enums come from `schema.prisma`; canonical is snake_case (`asmt_10` …). The
  `ASMT10_REPLY`/`SCN_REPLY` text in `api_contract.md §7.3–7.4` is stale. Code to snake_case.
- **OQ-2 Confirm Draft** — the backend plan contains **no confirm-draft endpoint in any phase**, yet
  Phase 7 audits a 14-event matrix that includes "user confirms draft → admin notified". So this is a
  **mutual FE+BE gap**: the email has no trigger. Strengthens the OQ-2 flag — it is a contract gap on
  both sides, not just a missing FE wire.

### D. Backend-phase → frontend-screen readiness map (integration order ≠ build order)

Frontend phases are ordered by the **frontend dependency spine**; backend data lands in a different
order. Build the frontend in the planned order, but **integrate/QA each screen only once its backing
backend phase ships** (mock or stub the rest).

| Backend phase | Unlocks (frontend can integrate against live API) |
|---|---|
| BE 2 — Auth | **FE 2.1** all auth screens, session guard, refresh middleware |
| BE 3 — Bookings | **FE 2.2** bookings list + detail (read); **FE 2.3** booking create + cancel |
| BE 4 — Documents | **FE 2.3** document upload; `draft-url` fetch in Draft Viewer |
| BE 5 — Payments | **FE 2.3** PayToUnlock (initiate) + `/payment/verify` |
| BE 6 — Admin | **FE 2.4** all admin screens (admin draft upload also produces the draft FE 2.3 views) |
| **BE 8 — User endpoints + hardening** | **FE 2.2** Payment History (`GET /user/payment-history`), profile edit (`PATCH /user/profile`), account delete (`DELETE /user`); **OQ-8** cross-subdomain validation |
| *(no backend phase)* | **OQ-2** Draft Viewer "Confirm Draft" action — unbuildable end-to-end until a contract decision adds the endpoint |

> **Key integration insight:** **FE 2.2's** Payments / profile-edit / account-delete depend on **BE
> Phase 8 (the last backend phase)**, while **FE 2.3** depends on BE Phases 3–5 (earlier). So the
> read-only dashboard's *data wiring* lands late even though the *UI* is built early. Plan to build
> FE 2.2's UI on schedule but defer its live integration (or use the API client's mocked responses)
> for Payments/profile/delete until BE Phase 8. Bookings list/detail in FE 2.2 integrate earlier (BE
> Phase 3).

---

## Phasing strategy

Four phases, ordered to minimize integration risk by building the dependency spine first
(infrastructure → auth → shell → interactive → admin). Each phase is independently buildable and
QA-able end-to-end before the next begins.

| Phase | Name | Delivers | Independently testable as |
|---|---|---|---|
| **1** | Foundation + Auth | All Phase 2 infrastructure + 4 shared form primitives + 6 auth pages | Full signup → OTP → profile → login → forgot-password loop against the live API |
| **2** | Dashboard Shell + Passive Pages | App shell, mobile nav, status/summary components + 5 read-only dashboard pages | Log in → navigate every dashboard page; see bookings, payments, profile (read + edit) |
| **3** | Booking + Payment + Draft | Stepper, DocumentUpload, PayToUnlock + booking flow, payment, draft viewer | Book → upload → draft-ready → pay → verify → view draft, end-to-end |
| **4** | Admin | Stat card, data table, doc row, confirm dialog + 5 admin pages | Admin login → overview → bookings → booking detail (status/draft/note/mark-paid) → users → delete |

**Why this order:**
- **Phase 2.1 first** because nothing authenticated renders without the API client, auth-in-server-
  component guard, `middleware.ts` refresh, and TQ provider. Auth pages are the lowest-risk
  consumers of that infrastructure (mostly forms → single endpoints) and prove the cookie/CORS
  transport (OQ-8) before any data-heavy screen depends on it.
- **Phase 2.2 second** because the authenticated shell (AppShell + MobileBottomTabBar) and the
  read-only data components (ServiceStatusBadge, BookingSummaryCard) are prerequisites for the
  booking and admin zones. Building the passive (read-only) dashboard isolates layout/data-display
  bugs from interaction bugs.
- **Phase 2.3 third** because the highest-stakes interactions (DocumentUpload S3 flow, Razorpay
  checkout, draft gating) build on top of an already-proven shell and Service Detail page. Service
  Detail's read-only shell lands in Phase 2; its payment/cancel layer lands here (Q2 default).
- **Phase 2.4 last** because admin reuses everything proven in Phases 1–3 (shell, status badge,
  forms, confirmation patterns) and shares no blocking dependency with the user zone.

---

## Phase 2.1 — Foundation + Auth

### Scope
All Phase 2 frontend infrastructure, the 4 net-new form primitives, the AuthCardShell + OTPInput,
and all 6 auth screens. After this phase a user can complete the entire account lifecycle.

**Screens:** `/signup`, `/verify-otp`, `/complete-profile`, `/login`, `/forgot-password`
(two-state: email entry → OTP+new-password), `/auth/invalidate` (public confirmation page).

### File-level implementation plan

**Infrastructure (new):**
- `client/src/lib/api/client.ts` — typed `fetch` wrapper; base URL from `NEXT_PUBLIC_API_URL`;
  `credentials: 'include'`; envelope parsing (`{ success, data, error, meta }`); error-code →
  message mapping per `api_contract.md` common error codes. Two call surfaces: server-side
  (forwards incoming cookies via `fetch` headers in Server Components) and client-side (browser
  cookies auto-sent).
- `client/src/lib/api/auth.ts` — typed functions for the 11 auth endpoints (`§7` of audit).
- `client/src/lib/api/types.ts` — shared envelope + DTO types (`UserObject`, error shapes).
- `client/src/lib/auth/session.ts` — `getSession()` helper for Server Components: reads
  `access_token` cookie, calls `GET /auth/me`, returns user or null. `requireUser()` redirects to
  `/login` on null; `requireAdmin()` additionally redirects non-admins to `/dashboard`.
- `client/middleware.ts` — silent `POST /auth/refresh` when `access_token` is near/expired (15-min
  TTL) and `refresh_token` present. Confirm Next.js middleware API against
  `node_modules/next/dist/docs/` first.
- `client/src/app/providers.tsx` (`'use client'`) — `QueryClientProvider` wrapper, `{children}`
  passthrough only.

**Form primitives:**
- `client/src/components/ui/Input.tsx` — **Extend** in place: password show/hide toggle (eye icon,
  accessible label), `+91` tel prefix, `inputmode`. Existing label + error wiring unchanged.
- `client/src/components/ui/Checkbox.tsx` — **New**.
- `client/src/components/ui/CheckboxGroup.tsx` — **New** (multi-select, group-level error).
- `client/src/components/ui/OTPInput.tsx` — **New** (`'use client'`; 6-box, paste-aware,
  `autocomplete="one-time-code"`, group error).

**Auth zone:**
- `client/src/app/(auth)/layout.tsx` — AuthCardShell wrapper (no Navbar/Footer); trust strip below.
- `client/src/components/layout/AuthCardShell.tsx` — **New** (440px centered card + trust strip).
- `client/src/app/(auth)/signup/page.tsx` (+ `SignupForm.tsx` client leaf)
- `client/src/app/(auth)/verify-otp/page.tsx` (+ `VerifyOtpForm.tsx`)
- `client/src/app/(auth)/complete-profile/page.tsx` (+ `CompleteProfileForm.tsx`)
  — **⚠️ field set is the one open blocker (Conflict 1, Backend Alignment §B):** `api_contract.md`
  says `interestedServices`; `backend_plan.md` D67 says `name` + `phone`. Build the page + form
  shell now; finalize the exact fields once the contract is reconciled. The `CheckboxGroup`
  (multi-select) primitive is needed **if** `interestedServices` stays here (or moves to signup).
- `client/src/app/(auth)/login/page.tsx` (+ `LoginForm.tsx`)
- `client/src/app/(auth)/forgot-password/page.tsx` (+ `ForgotPasswordForm.tsx`, two visible states)
- `client/src/app/(auth)/auth/invalidate/page.tsx` — public SSR confirmation page (OQ-10).

**Form schemas (temporary location — see Q4/OQ-7):**
- `client/src/lib/schemas/auth.schema.ts` — co-located here following the `contact.schema.ts`
  precedent **because `server/src/schemas/` does not yet exist** (verified: server has only
  `node_modules`). Migrate to `server/src/schemas/` + `@server/*` import once the backend lands it.

**Token additions:**
- `client/src/styles/tokens.css` — append a delimited `/* === Phase 2 === */` section with
  `.auth-card`, `.otp-box`, `.checkbox`, classes. Never modify existing values/classes.

**Config:**
- `client/tsconfig.json` — add `@server/*` → `../server/src/schemas/*` path alias (forward-looking;
  unused until backend schemas exist).
- `client/.env.example` — add `NEXT_PUBLIC_API_URL`.

### Components
| Component | Verb | Note |
|---|---|---|
| Input | Extend | password toggle + `+91` + inputmode |
| Button, Card | Reuse | auth CTAs + card surface |
| Checkbox | New | consent flags (termsAccepted, booking consents) — needed regardless |
| CheckboxGroup | New | `interestedServices` multi-select — **placement pending Conflict 1** (complete-profile vs signup); component still required |
| AuthCardShell | New | `components.md → Auth Card Shell` |
| OTPInput | New | `components.md → OTP Input` |
| Toaster | Reuse | already in root layout |

### API wiring
`POST /auth/signup` · `POST /auth/verify-otp` · `POST /auth/resend-otp` ·
`POST /auth/complete-profile` · `POST /auth/login` · `POST /auth/forgot-password` ·
`POST /auth/reset-password` · `GET /auth/invalidate?ref=` · `GET /auth/me` (session guard) ·
`POST /auth/refresh` (middleware). All defined in `api_contract.md §1`.

### Assets
None. (`logo.png` already at `client/public/logo.png` for the AuthCardShell wordmark.)

### Dependencies (new packages)
- `@tanstack/react-query` — mandated for client-side fetching; installed here so the provider
  exists before any authenticated screen.
- `framer-motion` — **install but do not use in Phase 1** (Auth Card Shell motion = none). Installed
  now so Phases 2–3 don't add packages mid-stream. *(Acceptable to defer to Phase 2 if the
  execution prompt prefers; no Phase 1 screen uses it.)*

### Phase 2.1 touch-points & integration risks
- `client/src/app/layout.tsx` (root) — wrap children in `<Providers>`. **Additive only**; preserves
  Server Component trees. (`audit.md §8.1`)
- `client/src/styles/tokens.css` — append-only Phase 2 section.
- `client/tsconfig.json` — add alias (non-breaking).
- **⚠️ Conflict 1 (complete-profile field set):** `api_contract.md` (`interestedServices`) vs
  `backend_plan.md` D67 (`name` + `phone`). Blocks finalizing `CompleteProfileForm`. Build the shell;
  reconcile before locking fields. (Backend Alignment §B.)
- **OQ-8 (⚠️ transport — confirmed but late):** the backend plan **confirms** direct cross-subdomain
  auth (cookie `Domain=.gstnoticesupport.in`, `Secure`, `HttpOnly`, `SameSite=Lax`, CORS per-env), but
  **only wires/validates it in backend Phase 8**. FE 2.1 can be built and unit-tested now; full
  cross-subdomain auth QA against the live API waits on backend Phase 8 (or a dev backend with the
  same CORS/cookie config).
- Public `Navbar` "Book Service" CTA → **do not touch** (OQ-9, product decision deferred).

### Acceptance criteria
- [ ] Full lifecycle works against the API: signup → OTP verify → complete-profile → land on
      `/dashboard` route (even if Phase 2 page not yet built, redirect target resolves); login;
      forgot-password both states; resend-OTP; `/auth/invalidate` renders friendly copy (not JSON).
- [ ] AuthCardShell matches `components.md` (440px, centered, no Navbar/Footer, trust strip, no
      entrance animation); card does not re-layout on error/loading.
- [ ] OTPInput: paste distributes across 6 boxes; `inputmode=numeric`; group-level error.
- [ ] All forms use RHF + `zodResolver`; field errors shown; submit disabled while pending.
- [ ] Tokens only, no hardcoded hex; CSS Modules pattern matches Phase 1.
- [ ] No console errors; no hydration warnings; Server/Client boundary correct (forms are leaves).

### Dependencies on prior phases
None — this is the foundation.

---

## Phase 2.2 — Dashboard Shell + Passive (read-only) Pages

### Scope
The authenticated user shell + the read-only data-display components, then the 5 dashboard screens
that are pure reads or simple profile mutations. **No payment, no booking flow, no document upload,
no draft access** (all deferred to Phase 3).

**Screens:** `/dashboard`, `/dashboard/services`, `/dashboard/services/[id]` (read-only layer:
status, documents list, admin note — **no PayToUnlock/cancel yet**, Q2 default),
`/dashboard/payments`, `/dashboard/settings` (profile edit + account delete).

### File-level implementation plan

**Shell (new):**
- `client/src/app/(dashboard)/layout.tsx` — Server Component; `requireUser()` guard; renders
  `<AppShell variant="user">`.
- `client/src/components/layout/AppShell.tsx` — **New** (parametric, Q3 default). Accepts a
  `navLinks` config + `variant`. Sticky header (logo, tap-to-call, account menu), persistent
  sidebar ≥lg, slide-in drawer <lg. Interactive bits (`drawer toggle`, account menu) are
  `'use client'` leaves; shell frame stays Server Component where possible.
- `client/src/components/layout/MobileBottomTabBar.tsx` — **New** (`'use client'`; 4 tabs; hidden
  during booking flow — that hiding is exercised in Phase 3).
- `client/src/components/ui/ServiceStatusBadge.tsx` — **New** (6 status→token+icon mappings).
- `client/src/components/dashboard/BookingSummaryCard.tsx` — **New** (composes Card +
  ServiceStatusBadge; Draft-Ready amber left-border variant; status-derived next-action line).

**Pages:**
- `client/src/app/(dashboard)/dashboard/page.tsx` — Dashboard Home (active cases, max 3 summary
  cards + entry points).
- `client/src/app/(dashboard)/dashboard/services/page.tsx` — Services List (all bookings; table on
  desktop, stacked BookingSummaryCards on mobile).
- `client/src/app/(dashboard)/dashboard/services/[id]/page.tsx` — Service Detail **read-only layer**:
  booking detail, documents list, admin note, status header. Payment/cancel slot left as a clearly
  marked placeholder for Phase 3.
- `client/src/app/(dashboard)/dashboard/payments/page.tsx` — Payment History. **Per backend D64:
  offset-paginated** (`page`/`limit`, default 20 / max 100) **with a per-row "View Receipt ↗" link to
  the Razorpay-hosted receipt** (no in-house invoice PDF). Build paginated; resolves OQ-12 + OQ-13.
  *(Backing endpoint `GET /user/payment-history` lands in backend Phase 8 — integrate then.)*
- `client/src/app/(dashboard)/dashboard/settings/page.tsx` (+ `ProfileForm.tsx`,
  `DeleteAccountSection.tsx` client leaves) — profile edit + account delete. My Profile is a
  sub-section here, **not** a separate `/dashboard/profile` route (OQ-15). Deferred settings content
  (OQ-6) is out of scope.
- `client/src/app/(dashboard)/dashboard/services/[id]/loading.tsx` + `error.tsx`, and equivalents
  per route as needed (`frontend.md §4.4`).

**Token additions:** append `.app-shell`, `.sidebar`, `.mobile-tabbar`, `.status-badge-*`,
`.booking-card` classes to the Phase 2 section of `tokens.css`.

### Components
| Component | Verb | Note |
|---|---|---|
| AppShell | New | parametric user/admin (Q3) |
| MobileBottomTabBar | New | 4-tab authenticated nav |
| ServiceStatusBadge | New | 6 status mappings |
| BookingSummaryCard | New | composes Card + badge |
| Card, Button, Badge | Reuse | surfaces + actions |
| Input, Checkbox | Reuse (from P1) | profile form |
| ConfirmationDialog | New (built here, reused in P4) | account delete typed-confirmation |

> **Note:** ConfirmationDialog is listed `New` in `audit.md §5` for user account delete + admin
> user delete. Build it in Phase 2 for the account-delete flow; Phase 4 reuses it.

### API wiring
`GET /bookings` (dashboard + services list) · `GET /bookings/:id` (service detail) ·
`GET /user/payment-history` (payments) · `GET /auth/me` + `PATCH /user/profile` (settings profile)
· `DELETE /user` (account delete). All `api_contract.md §2–3`.

### Assets
None new. `logo.png` reused in AppShell header.

### Dependencies
None (TanStack Query + framer-motion installed in Phase 1).

### Phase 2.2 touch-points & integration risks
- **OQ-4 → reframed by D67:** the backend now intends to **capture `phone` at complete-profile** and
  let `PATCH /user/profile` edit it. So the profile sub-section **plans to show + edit phone** —
  *contingent on Conflict 1 being resolved and `UserObject`/`PATCH profile` gaining a `phone` field*.
  The earlier "omit/degrade" fallback applies only if D67 is reversed. Do not invent a source.
- **OQ-12/OQ-13 → resolved by D64:** Payment History is **paginated** with a **Razorpay receipt link**
  per row (no in-house invoice). Wire to the D64 shape (`meta` + receipt URL), which the contract
  example must be updated to match.
- **Backend Phase 8 dependency (⚠️ integration timing):** `GET /user/payment-history`,
  `PATCH /user/profile`, and `DELETE /user` are owned by **backend Phase 8 (last)**. Build FE 2.2's
  UI on schedule; defer live integration of Payments / profile-edit / account-delete until BE Phase 8
  (use the API client's mock surface meanwhile). **Bookings list + detail integrate earlier (BE
  Phase 3).**
- **OQ-3 (`interestedServices` enum):** treat `UserObject` snake_case values as canonical; the stale
  `ASMT10_REPLY`/`SCN_REPLY` text in the `/admin/users` example is a backend correction item.
- Service Detail links from Services List resolve to the read-only page (no dead 404) — the payment
  layer placeholder is visible but inert until Phase 3.

### Acceptance criteria
- [ ] Logged-in user navigates Dashboard → Services → Service Detail → Payments → Settings with no
      dead links; auth guard redirects unauthenticated users to `/login` server-side.
- [ ] AppShell matches `components.md` (sidebar ≥lg, drawer <lg); MobileBottomTabBar shows 4 tabs
      with active state; coexists with header.
- [ ] ServiceStatusBadge renders all 6 statuses with correct token+icon pairing; never color-only;
      WCAG AA at 14px/500.
- [ ] BookingSummaryCard: whole card clickable, Draft-Ready amber left border, status-derived
      next-action line; skeleton loading state.
- [ ] Profile edit persists via `PATCH /user/profile`; account delete uses ConfirmationDialog with
      typed-email confirmation and handles `ACTIVE_BOOKINGS` 409.
- [ ] No console errors, no hydration mismatch; matches prototype layout/spacing/typography/color.

### Dependencies on prior phases
Phase 1 (API client, session guard, TQ provider, Input/Checkbox primitives, ConfirmationDialog is
built here).

---

## Phase 2.3 — Booking + Payment + Draft

### Scope
The highest-stakes interactive flows: the 3-step booking flow, the document upload S3 pipeline, the
Service Detail payment/cancel layer, the chromeless payment-verify page, and the Draft Viewer.

**Screens:** `/dashboard/book` (single route, client stepper, steps 1–3), Service Detail payment
layer (PayToUnlock + cancel, layered onto the Phase 2 read-only page),
`/dashboard/services/[id]/draft` (Draft Viewer), `/payment/verify` (chromeless).

### File-level implementation plan

**Components (new):**
- `client/src/components/booking/Stepper.tsx` — **New** (`'use client'`; numbered steps, connector;
  sanctioned Framer Motion 300ms ease-out).
- `client/src/components/booking/DocumentUpload.tsx` — **New** (`'use client'`; highest-stakes;
  drag-drop desktop + Take a Photo/Choose File mobile; 5-state machine; sanctioned upload-confirm
  motion; wraps upload-url → S3 PUT → confirm-upload).
- `client/src/components/booking/PayToUnlock.tsx` — **New** (`'use client'`; locked→unlocked reveal;
  pre-deposit line item for Commissioner + GSTAT; sanctioned lock→unlock motion; Razorpay checkout).

**Booking flow:**
- `client/src/app/(dashboard)/dashboard/book/page.tsx` — SSR shell + `'use client'` stepper
  container. Single route, ephemeral client-side state; reload restarts at step 1 (OQ-1). Focused
  layout hides MobileBottomTabBar.
- `BookingStepService.tsx` (step 1 — 4 service types only, OQ-17; pre-deposit disclosure for
  Commissioner + GSTAT) · `BookingStepInfo.tsx` (step 2 — intake form) ·
  `BookingStepUpload.tsx` (step 3 — DocumentUpload). All client leaves under `book/`.

**Service Detail payment layer (extends Phase 2 page):**
- Add PayToUnlock panel + cancel action to
  `client/src/app/(dashboard)/dashboard/services/[id]/page.tsx`. Reads `?payment=success|failed`
  query param to show post-redirect toast.

**Draft Viewer:**
- `client/src/app/(dashboard)/dashboard/services/[id]/draft/page.tsx` — fetches fresh pre-signed
  `draft-url` per load; renders PDF; "Confirm Draft" [Primary] button.

**Payment verify (chromeless):**
- `client/src/app/(payment)/payment/verify/page.tsx` + a dedicated chromeless `layout.tsx` (no
  AppShell, no nav). Server Component reads Razorpay redirect query params, calls
  `GET /payments/verify`, then redirects/renders per the 4 outcomes.

**Razorpay loader:**
- `client/src/lib/razorpay.ts` + `next/script` load of `https://checkout.razorpay.com/v1/checkout.js`.
  Opens modal with `keyId` + `orderId` from `initiate`. Frontend never supplies amount.

**Token additions:** append `.stepper`, `.upload-zone`, `.pay-unlock`, `.draft-viewer` classes.

### Components
| Component | Verb | Note |
|---|---|---|
| Stepper | New | sanctioned motion |
| DocumentUpload | New | S3 2-step flow, sanctioned motion |
| PayToUnlock | New | Razorpay + pre-deposit, sanctioned motion |
| ServiceStatusBadge, BookingSummaryCard | Reuse (from P2) | |
| Input, Checkbox, Button, Card | Reuse | intake form + actions |
| ConfirmationDialog | Reuse (from P2) | cancel-booking confirm |

### API wiring
**Booking:** `POST /bookings` → `POST /bookings/:id/upload-url` → S3 PUT → `POST /bookings/:id/confirm-upload`.
**Service Detail:** `GET /bookings/:id` · `POST /bookings/:id/cancel` · `POST /payments/:bookingId/initiate`.
**Payment verify:** `GET /payments/verify?razorpay_payment_id=&razorpay_order_id=&razorpay_signature=&booking_id=`
(4 outcomes: success/failed → redirect to `/dashboard/services/{id}?payment=…`; inconclusive →
stay + WhatsApp; tampered → stay + invalid-link).
**Draft Viewer:** `GET /bookings/:id/draft-url` (gate: status `filing` or `complete`) + **Confirm Draft action (⚠️ endpoint TBD)**.

### Assets
None new.

### Dependencies
None new (framer-motion from Phase 1; Razorpay loaded via `next/script`, not an npm package).

### Phase 2.3 touch-points & integration risks
- **OQ-2 (⚠️ HARD BACKEND GAP — `Confirm Draft` endpoint missing):** no
  `POST /bookings/:id/confirm-draft` exists in `api_contract.md`. The Draft Viewer renders the
  "Confirm Draft" [Primary] button against a **TBD endpoint**. **Draft Viewer's primary action
  cannot ship until this endpoint is defined and added to the contract.** Do not invent a path.
  Build the rest of the Draft Viewer (fetch + render draft) so only the confirm action is blocked.
  **Confirmed mutual gap:** `backend_plan.md` defines **no confirm-draft endpoint in any phase**, yet
  its Phase 7 matrix audits a "user confirms draft → admin notified" email — which therefore has no
  trigger. This needs a contract decision (new endpoint) before either side can implement it.
- **Pre-deposit disclosure (KB2 §7, `frontend.md §8.3`):** must appear at booking Step 1 AND on the
  PayToUnlock screen for Commissioner + GSTAT. Both are in this phase — never omit either.
- **Razorpay callback URL** is set server-side in `initiate` (`/payment/verify?booking_id=`);
  frontend consumes `keyId`/`orderId` only, never the amount.
- Service Detail page is **modified, not replaced** — the Phase 2 read-only layer stays; payment
  layer is added. Regression-check the read-only view still renders.
- MobileBottomTabBar hidden state is exercised here (booking flow focused layout) — verify the
  Phase 2 component's hide condition fires correctly.

### Acceptance criteria
- [ ] Book end-to-end: select service (4 types only) → intake form → upload (PDF, ≤8 files, ≤5MB
      each, ≤40MB total) → booking created in `document_upload`.
- [ ] DocumentUpload exercises all 5 states (empty/uploading/success/error/over-limit); upload-
      confirm motion fires; respects `prefers-reduced-motion`; privacy reassurance line shown.
- [ ] Stepper transitions with sanctioned 300ms motion; MobileBottomTabBar hidden during flow.
- [ ] PayToUnlock: locked placeholder → Razorpay modal → reveal; pre-deposit line for Commissioner
      + GSTAT; amount never set client-side.
- [ ] `/payment/verify` handles all 4 outcomes correctly (redirects for success/failed; stays for
      inconclusive/tampered with correct copy + WhatsApp link); chromeless (no shell).
- [ ] Draft Viewer fetches fresh pre-signed URL per load; renders PDF; Confirm Draft button present
      but flagged blocked pending OQ-2 endpoint.
- [ ] Cancel booking works only at `draft_ready` + `pending`; ConfirmationDialog reused.
- [ ] No console errors; no hydration mismatch; matches prototype.

### Dependencies on prior phases
Phase 1 (infra, forms) + Phase 2 (AppShell, ServiceStatusBadge, Service Detail read-only page,
ConfirmationDialog).

---

## Phase 2.4 — Admin

### Scope
The admin zone: overview metrics, paginated/filterable bookings + users tables, booking detail with
the full admin action set, user detail with delete.

**Screens:** `/admin`, `/admin/bookings`, `/admin/bookings/[id]`, `/admin/users`,
`/admin/users/[id]`. (`/admin/settings` deferred — OQ-6 — route reserved, not implemented.)

### File-level implementation plan

**Shell:**
- `client/src/app/(admin)/layout.tsx` — Server Component; `requireAdmin()` guard (redirects
  non-admins to `/dashboard`); renders `<AppShell variant="admin">` (reused parametric shell, Q3).

**Components (new):**
- `client/src/components/admin/AdminStatCard.tsx` — **New** (composes Card; status-count + revenue
  variants; non-interactive).
- `client/src/components/admin/AdminDataTable.tsx` — **New** (`'use client'`; search/filter controls,
  sortable headers, row click, ServiceStatusBadge cells, footer pagination, 5 states: loading /
  populated / empty-no-data / empty-no-results / error; <lg horizontal scroll, not card-collapse).
- `client/src/components/admin/DocumentListRow.tsx` — **New** (downloadable file row; Download
  [Secondary]).
- ConfirmationDialog — **Reuse** (from Phase 2) for delete-user typed-confirmation.

**Pages:**
- `client/src/app/(admin)/admin/page.tsx` — Overview (AdminStatCards).
- `client/src/app/(admin)/admin/bookings/page.tsx` — Bookings (AdminDataTable + filters: page/limit/
  status/paymentStatus/serviceType).
- `client/src/app/(admin)/admin/bookings/[id]/page.tsx` — Booking Detail (full action set: status
  transition, draft upload, note, mark-paid, documents list + download). Draft upload reuses the
  DocumentUpload pattern or a dedicated admin variant; status/note/mark-paid are client-leaf forms.
- `client/src/app/(admin)/admin/users/page.tsx` — Users (AdminDataTable + search).
- `client/src/app/(admin)/admin/users/[id]/page.tsx` — User Detail + delete (ConfirmationDialog;
  delete disabled when `activeBookingCount > 0`).
- `loading.tsx` / `error.tsx` per route as needed.

**Token additions:** append `.stat-card`, `.data-table`, `.doc-row` classes.

### Components
| Component | Verb | Note |
|---|---|---|
| AdminStatCard | New | composes Card |
| AdminDataTable | New | 5 states, sortable, paginated |
| DocumentListRow | New | download row |
| AppShell | Reuse | `variant="admin"` |
| ServiceStatusBadge | Reuse | table cells |
| ConfirmationDialog | Reuse | delete user |
| Input, Button, Card | Reuse | filters, forms, surfaces |

### API wiring
`GET /admin/stats` (overview) · `GET /admin/bookings` (filters) · `GET /admin/bookings/:id` ·
`PATCH /admin/bookings/:id/status` · `POST /admin/bookings/:id/draft-upload-url` ·
`POST /admin/bookings/:id/draft-confirm` · `PATCH /admin/bookings/:id/note` ·
`POST /admin/bookings/:id/mark-paid` · `GET /admin/bookings/:id/documents` ·
`GET /admin/bookings/:id/documents/:docId/download-url` · `GET /admin/users` ·
`GET /admin/users/:id` · `DELETE /admin/users/:id`. All `api_contract.md §6–7`.

### Assets
None new.

### Dependencies
None new.

### Phase 2.4 touch-points & integration risks
- **OQ-3 (⚠️ stale enum in contract):** `GET /admin/users` example shows `ASMT10_REPLY`/`SCN_REPLY`
  while `UserObject` is canonical (`asmt_10` etc.). Code to the canonical snake_case; flag the
  example as a backend correction. Do not branch on the stale values.
- **OQ-6:** `/admin/settings` has no endpoint/spec — reserve the route, do not implement.
- **Admin draft upload** allowed only at `in_review`/`draft_ready` (auto-transitions to
  `draft_ready` on confirm) — respect `DRAFT_LOCKED` 409.
- **Mark-paid** is visible only at `draft_ready` + payment `pending`/`failed`; backend verifies with
  Razorpay — frontend just submits `razorpayPaymentId` and handles `PAYMENT_NOT_CAPTURED` 422.
- **D66 (payment audit fields):** `payment_records` gains a `source` enum
  (`webhook | verify | admin_override`) and `performed_by_admin_id`; `mark-paid` inserts a new row
  with `source=admin_override`. Booking Detail's "all payment attempts" list **may surface `source`**
  per row (optional, low-effort) so the admin can distinguish a manual override from a webhook
  capture. Wire only if/when the contract's `PaymentRecordObject` exposes these fields.
- **Status transitions** via `PATCH …/status` accept only `in_review` | `complete`; UI must not
  offer other transitions.
- Admin mobile is minimal fallback only (drawer + horizontally-scrollable tables, not card-collapse)
  per `components.md → App Shell` / `Admin Data Table`.

### Acceptance criteria
- [ ] Non-admin hitting any `/admin/*` route is redirected to `/dashboard` server-side; admin
      reaches all 5 screens.
- [ ] AdminDataTable exercises all 5 states; filters/search update results; pagination works; rows
      clickable + keyboard-focusable; status cells use ServiceStatusBadge.
- [ ] AdminStatCard renders total/byStatus/byServiceType/revenue; loading + error states.
- [ ] Booking Detail: status transition, draft upload→confirm, note set/clear, mark-paid all wired
      and handle their documented error codes; documents downloadable via pre-signed URL.
- [ ] User Detail: delete via ConfirmationDialog (typed email); disabled with reason when
      `activeBookingCount > 0`; handles `USER_HAS_ACTIVE_BOOKING` 409.
- [ ] No console errors; no hydration mismatch; matches prototype; tokens only.

### Dependencies on prior phases
Phase 1 (infra, forms) + Phase 2 (AppShell parametric, ServiceStatusBadge, ConfirmationDialog) +
Phase 3 (DocumentUpload pattern for admin draft upload, if shared).

---

## Cross-phase open-question ledger (⚠️ = decision/backend action required)

| OQ | Phase affected | Status for the build (updated vs `backend_plan.md`) |
|---|---|---|
| **Conflict 1** ⚠️ | 1, 2 | **NEW — hard contract conflict.** complete-profile: `api_contract` (`interestedServices`) vs D67 (`name`+`phone`). Blocks finalizing `CompleteProfileForm` + Settings phone field. Backend must reconcile. |
| OQ-2 ⚠️ | 3 | **Blocks Draft Viewer "Confirm Draft".** Now confirmed a **mutual FE+BE gap** — no endpoint in `backend_plan.md` either; its Phase 7 email has no trigger. Build everything else; flag the button. |
| OQ-4 | 2 | **Reframed by D67** — phone is intended to be captured/editable → plan to show + edit phone, **contingent on Conflict 1** and `UserObject` gaining `phone`. Graceful-degrade only if D67 reversed. |
| OQ-6 ⚠️ | 2, 4 | `/dashboard/settings` deferred content + `/admin/settings` reserved, not built. (Unchanged — no backend endpoint.) |
| OQ-8 ⚠️ | 1 | **Confirmed by backend**, but cross-subdomain cookie/CORS is only validated in **BE Phase 8** → full live auth QA waits on it. |
| OQ-9 ⚠️ | (pre-launch) | Public "Book Service" CTA destination — product decision, do not touch in build. |
| OQ-12 | 2 | **Resolved by D64** — payment history is **paginated** (`page`/`limit`). Wire to `meta`; contract example needs updating. |
| OQ-13 | 2 | **Resolved by D64** — per-row **Razorpay receipt URL** (no in-house invoice PDF). Add "View Receipt ↗" link. |
| OQ-3 | 2, 4 | Code to canonical `UserObject` snake_case enum; stale `ASMT10_REPLY` contract example flagged (backend uses `schema.prisma` enums). |
| **Integration timing** | 2 | **NEW** — FE 2.2 Payments / profile-edit / account-delete depend on **BE Phase 8 (last)**; build UI on schedule, defer live integration. Bookings list/detail integrate at BE Phase 3. |
| OQ-1, 5, 7, 10, 11, 14, 15, 16, 17, 18 | various | Confirmed defaults applied inline above. (OQ-5 now subsumed by Conflict 1.) |

---

## Global guardrails (restated)

- **Design system wins on conflict.** `client/` + `design.md` + `components.md` are authoritative;
  the prototype is reference only. Resolve every prototype↔design-system conflict per `audit.md §8.2`
  (WhatsApp green → `var(--wa-green)`; no pill radius → `var(--r-btn)` 8px; never import prototype
  CSS/JS).
- **Reuse-first**, exactly per the `audit.md §5` matrix. No component is created unless §5 marks it
  `New`. No speculative components, props, or abstractions.
- **Do not break Phase 1.** The only sanctioned touch-points are: root layout provider wrap,
  append-only `tokens.css` Phase 2 section, `tsconfig.json` alias, and the Service Detail page
  payment-layer extension in Phase 3. The public Navbar "Book Service" CTA is **not** changed (OQ-9).
  `contact.schema.ts` and `/api/contact` stay put.
- **Honor `.claude/` governance** — `RULES.md`, `frontend.md`, the locked stack (Next.js 15 App
  Router, Tailwind v4, TanStack Query, RHF + Zod), naming conventions, branch/commit rules
  (`gitRule.md`), and the relevant skill (`frontend`) loaded before writing code.
- **Schemas:** Phase 2 schemas target `server/src/schemas/` via the `@server/*` alias; until the
  backend creates that directory they are co-located in `client/src/lib/schemas/` (per the existing
  `contact.schema.ts` precedent) and migrated later. Never recreate a schema in two places.

---

## Execution note

**Execution prompts are NOT generated in this document.** Each of the 4 phases will receive its own
execution prompt later, written in Claude Code during development. Each phase block above is
self-contained — scope, file-level plan, component verbs, API wiring, assets, dependencies,
touch-points, acceptance criteria, and prior-phase dependencies — so it can be handed (together with
a reference prompt) to generate that phase's execution prompt cleanly, one phase at a time.
