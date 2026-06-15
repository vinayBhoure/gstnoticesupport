# Changelog — gstnoticesupport.in

> User-facing and developer-significant changes, newest first.
> Format: `## [date] — description`

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
