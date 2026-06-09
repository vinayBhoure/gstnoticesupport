# Changelog — gstnoticesupport.in

> User-facing and developer-significant changes, newest first.
> Format: `## [date] — description`

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
- `client/` → Vercel · `server/` → Railway (Phase 1) → VPS (before Phase 2)
- `server/.env` excluded from git; `.env.example` committed as template
