# Changelog — gstnoticesupport.in

> User-facing and developer-significant changes, newest first.
> Format: `## [date] — description`

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
