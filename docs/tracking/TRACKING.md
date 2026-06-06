# Project Progress Tracking — gstnoticesupport.in

> Single source of truth for phase progress. Updated after each EP completes.

---

## Timeline

| Milestone | Target Date | Status |
|---|---|---|
| Phase 1 Dev Window | 7–12 June 2026 | 🔄 In Progress |
| Phase 1 Launch | 15–16 June 2026 | ⬚ Pending |
| Phase 2 Dev Window | 16 June – 4 July 2026 | ⬚ Pending |
| Phase 2 Launch | 5–6 July 2026 | ⬚ Pending |

---

## Phase 1 — Marketing Site

| EP | Name | Status | Completed |
|---|---|---|---|
| EP1 | Project Scaffold, Tooling & Design System | ✅ Done | 2026-06-06 |
| EP2 | Public Marketing Pages | ⬚ Pending | — |
| EP3 | Lead Capture & Phase 1 Integrations | ⬚ Pending | — |
| EP4 | SEO, Performance & Legal Pages | ⬚ Pending | — |
| EP5 | Phase 1 Hardening & Launch | ⬚ Pending | — |

---

## Phase 2 — Full Platform

| EP | Name | Status | Completed |
|---|---|---|---|
| EP6 | Database Schema & Repository Layer | ⬚ Pending | — |
| EP7 | Backend Core Infrastructure | ⬚ Pending | — |
| EP8 | Auth Backend (OTP signup, login, JWT, forgot password) | ⬚ Pending | — |
| EP9 | Booking & Document Upload Backend | ⬚ Pending | — |
| EP10 | Auth Frontend & Route Protection | ⬚ Pending | — |
| EP11 | User Dashboard & Booking Flow Frontend | ⬚ Pending | — |
| EP12 | Payment Integration (Razorpay + three-layer reliability) | ⬚ Pending | — |
| EP13 | Admin Dashboard | ⬚ Pending | — |
| EP14 | Email Notifications (Resend + notification matrix) | ⬚ Pending | — |
| EP15 | Phase 2 Hardening & Launch | ⬚ Pending | — |

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
