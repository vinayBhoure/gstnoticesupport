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

> Tasks will be added as Phase 1 ships. See README §Roadmap for full Phase 2 scope (EP6–EP15).

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
