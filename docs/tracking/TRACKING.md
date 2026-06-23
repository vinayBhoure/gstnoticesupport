# Project Progress Tracking — gstnoticesupport.in

> Single source of truth for phase progress. Updated after each EP completes.

---

## Timeline

| Milestone | Target Date | Status |
|---|---|---|
| Phase 1 Dev Window | 7–12 June 2026 | 🔄 In Progress |
| Phase 1 Launch | 15–16 June 2026 | ⬚ Pending |
| Phase 2 Dev Window | 16 June – 4 July 2026 | 🔄 In Progress |
| Phase 2 Launch | 5–6 July 2026 | ⬚ Pending |

---

## Phase 1 — Marketing Site

| EP | Name | Status | Completed |
|---|---|---|---|
| EP1 | Project Scaffold, Tooling & Design System | ✅ Done | 2026-06-06 |
| EP2 | Public Marketing Pages | ✅ Done | 2026-06-06 |
| EP3 | Lead Capture & Phase 1 Integrations | ✅ Done | 2026-06-08 |
| EP4 | SEO, Performance & Legal Pages | 🔄 In Progress | — |
| EP5 | Phase 1 Hardening & Launch | ⬚ Pending | — |

---

## Phase 2 — Full Platform

| EP | Name | Status | Completed |
|---|---|---|---|
| EP6 | Database Schema & Repository Layer | ✅ Done | 2026-06-16 |
| EP7 | Backend Core Infrastructure | ✅ Done | 2026-06-16 |
| EP8 | Auth Backend (OTP signup, login, JWT, forgot password) | ✅ Done | 2026-06-16 |
| EP9 | Booking & Document Upload Backend | ✅ Done | 2026-06-23 |
| EP10 | Auth Frontend & Route Protection | ⬚ Pending | — |
| EP11 | User Dashboard & Booking Flow Frontend | ⬚ Pending | — |
| EP12 | Payment Integration (Razorpay + three-layer reliability) | ⬚ Pending | — |
| EP13 | Admin Dashboard | ⬚ Pending | — |
| EP14 | Email Notifications (Resend + notification matrix) | ⬚ Pending | — |
| EP15 | Phase 2 Hardening & Launch | ⬚ Pending | — |

---

## EP2 — Definition of Done (Verified 2026-06-06)

- [x] All 10 public routes generate as `○ (Static)` — confirmed via `next build`
- [x] `tsc --noEmit` passes clean with zero errors
- [x] Homepage: 12 sections, Navbar, Footer, WhatsApp float, sticky mobile bar
- [x] Four service pages: ASMT-10, SCN Reply, Commissioner Appeal, GSTAT Appeal
- [x] Pre-deposit disclosure on Commissioner Appeal and GSTAT Appeal at hero + pricing (KB2 §7)
- [x] Pricing page: 4-card grid, FAQ accordion, payment policy section, scroll interaction
- [x] About page: team, mission/vision, company identity (CIN/GSTIN/address hardcoded)
- [x] FAQ page: live keyword search + `<mark>` highlight + aria-live, 13-question accordion, FAQPage JSON-LD
- [x] Contact page: 5 channels, grievance officer, `#callback` anchor; form deferred to EP3
- [x] Custom 404 (`not-found.tsx`) matches design system
- [x] Nav active states via `usePathname()` — `aria-current="page"` on all links, `.nav-active` on Services button
- [x] No raw `<img>` tags — all images via `next/image`; logo has `priority`
- [x] No hardcoded hex values — all CSS via `tokens.css` custom properties
- [x] Per-page CSS Modules (D59) — class names match prototype 1:1

---

## EP1 — Definition of Done (Verified 2026-06-06)

- [x] `npm run dev` boots `client/` on `localhost:3000`
- [x] `npm run dev` boots `server/` on `localhost:4000`
- [x] `GET /health` returns `{"status":"ok"}`
- [x] Homepage (`/`) renders primitives showcase using only navy/green/neutral tokens
- [x] `npm run build` on client emits `/` as **Static** (SSG)
- [x] `tsc --noEmit` passes clean in `client/`
- [x] `tsc --noEmit` passes clean in `server/`
- [x] No hardcoded hex values in any component — all via `tokens.css` CSS custom properties

---

## Blocked Items

| Item | Blocking | Since |
|---|---|---|
| Resend API key + verified sender domain | EP3 contact email | 2026-06-06 |
| Calendly account + event URL | EP3 popup widget | 2026-06-06 |
| Trust signals (legal name, CIN, GSTIN, address, grievance officer, phone) | EP2 Footer, EP5 launch | 2026-06-06 |
| Cloudflare account access | EP5 DNS/SSL | 2026-06-06 |
| GA4 Measurement ID | EP4 analytics | 2026-06-06 |
| Google Search Console access | EP4 | 2026-06-06 |
