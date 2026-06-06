# Changelog — gstnoticesupport.in

> User-facing and developer-significant changes, newest first.
> Format: `## [date] — description`

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
