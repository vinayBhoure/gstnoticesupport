# gstnoticesupport.in — Agent Configuration

## Project Overview
**gstnoticesupport.in** is a two-phase GST litigation services platform for Indian businesses, CAs, and Advocates. Phase 1 is a trust-first marketing site (launch: 15 June 2026). Phase 2 adds booking, document upload, draft-gated payment, and admin workflow (launch: 5 July 2026). The core product mechanic: admin prepares a draft PDF → user pays via Razorpay to unlock it.

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + Tailwind CSS + TanStack Query + React Hook Form + Zod
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL via NeonDB + Prisma ORM
- **Auth**: JWT in HTTP-only cookies + OTP via Resend
- **Storage**: AWS S3 (private bucket, pre-signed URLs only)
- **Payments**: Razorpay (Orders API + webhook + three-layer reliability)
- **Email**: Resend (transactional templates)
- **Language**: TypeScript (strict mode, both client and server)

## Architecture
- **Pattern**: Monorepo — `/client` (Next.js) + `/server` (Express)
- **API Style**: REST with `/api/v1/` prefix
- **Response Format**: `{ success: boolean, data: T | null, error: string | null, statusCode: number }`
- **Layering**: Controller → Service → Repository (hard boundaries, no cross-layer imports)
- **File uploads**: Browser → S3 direct via pre-signed PUT URLs (never through Express)
- **Auth flow**: OTP signup → JWT access token in HTTP-only cookie

## Project Structure
```
/client          → Next.js 15 App Router frontend
/server          → Express.js + TypeScript API
/docs            → Architecture, UI/UX, tracking documents
/resources       → UI assets, design system, CSS tokens
/.claude         → Agent configuration, rules, skills, commands
```

## Key Documentation

**Product & Requirements**
- `docs/architecture/gstnoticesupport_project_knowledge_base_1.md` — Services, pricing, personas, booking mechanics, state machine, admin scope, notification matrix *(primary source of truth)*
- `docs/architecture/gstnoticesupport_project_knowledge_base_2.md` — Payment flow, PDF gating, Razorpay verify page, pre-deposit disclosure *(supplements and partially overrides KB1)*
- `docs/architecture/platform_interaction_flows.md` — Step-by-step user and admin journeys across both phases
- `docs/architecture/service_workflow.md` — Admin workflow detail for the booking lifecycle

**Architecture & Technical Design**
- `docs/architecture/gstnoticesupport_HLD.md` — Full system architecture, deployment topology, auth, payments, state machine, security, SEO, locked decisions appendix
- `docs/architecture/gstnoticesupport_LLD.md` — Prisma schema, endpoint contracts, implementation specifics *(read after HLD)*

**UI/UX & Design System**
- `docs/ui-ux/design.md` — Design principles, layout rules, interaction patterns
- `docs/ui-ux/components.md` — Component specifications and usage patterns
- `resources/ui/css/tokens.css` — Locked CSS design tokens (colour, spacing, typography) — never hardcode hex values
- `resources/ui/design-system/design.md` — Extended design system documentation

**Tracking**
- `docs/tracking/TASKS.md` — Active task board — check at session start, update when completing work
- `docs/tracking/CHANGELOG.md` — User-facing changes log — update via `/log change` after every shipped feature
- `docs/tracking/TRACKING.md` — Project progress and phase tracking
- `docs/tracking/ERROR.md` — Known errors and resolutions — check before debugging a recurring issue

## Rules (must follow)
- `.claude/rules/RULES.md` — Universal: TypeScript, naming conventions, Zod schemas, security non-negotiables, Git & PR conventions
- `.claude/rules/frontend.md` — `client/`: Server vs Client Components, TanStack Query, React Hook Form, SSG/SSR, routing, images, component structure, design system
- `.claude/rules/backend.md` — `server/`: Controller-service-repository layering, `asyncHandler`, `ApiError`, middleware order, validation, webhook handling, response envelope, file upload
- `.claude/rules/database.md` — `server/src/repositories/`, `server/prisma/`: Repository-only Prisma calls, no raw SQL, soft-delete, migrations, DTO exposure, pagination, query safety

## Skills (load before writing code in that domain)
- `backend` — Any Express route, controller, service, Zod schema, error handling
- `auth` — Auth endpoints, JWT/cookies, CORS, env config, OTP, password handling
- `data-storage` — Prisma models, migrations, S3 uploads, file handling, repositories
- `integration` — Razorpay, Resend, webhook processing, email templates, notification matrix
- `frontend` — Next.js pages, Server/Client Components, forms, TanStack Query, SEO metadata
- `status-machine` — Booking status transitions, status-gated actions — load whenever `Booking.status` is touched

## Commands
- `/context` — **Start of every session.** Loads project summary, open tasks, recent decisions, locked stack. Use `/context flow:<name>` for a specific platform flow; `/context scope:<feature>` to check in-scope status
- `/scaffold <type> <name>` — Generate a complete, convention-compliant artifact (types: `endpoint`, `page`, `model`, `email`, `component`) — never stubs
- `/review [target]` — Audit against all locked conventions across 7 passes. Run before every commit and PR. Default target is current git diff
- `/git start <description>` — Create a correctly named branch
- `/git commit` — Generate a Conventional Commits message from the staged diff
- `/git pr` — Draft a complete PR description with the project-specific checklist
- `/log decision <text>` — Record an architectural or product decision in `docs/tracking/decisions.md`
- `/log change <text>` — Record a user-facing change in `docs/tracking/CHANGELOG.md`
- `/log question <text>` — Record an unresolved question in `docs/tracking/open-questions.md`
- `/task add <description>` — Add a task to `docs/tracking/TASKS.md` with phase, layer, and priority
- `/task list [filters]` — List open tasks filtered by phase, layer, priority, or status
- `/deploy staging` — Run staging pre-deploy checklist and post-deploy smoke tests
- `/deploy production` — Run production pre-deploy checklist (Razorpay live key, Cloudflare WAF, CORS, cookie domain, Sentry DSN)
- `/debug payment [bookingId]` — Diagnose a stuck payment across all three reliability layers
- `/debug webhook` — Diagnose Razorpay webhook signature failures, raw body middleware, Cloudflare WAF
- `/debug auth [symptom]` — Diagnose JWT rejection, cookie not sent, CORS failures
- `/sync-hld [section]` — Detect drift between codebase and HLD/KB documentation — run after significant features

## Session Workflow
**Session start:** Run `/context` → check `docs/tracking/TASKS.md` → load the relevant skill for your area before writing any code.

**While working:** Load skill before scaffolding → run `/review` before committing → use `/git commit` for messages → log any undocumented decision with `/log decision`.

**Before PR:** Run `/review pr` on the full branch diff → resolve all errors → run `/git pr` → confirm target is `staging`, not `main`.

**After shipping:** Run `/log change` for any user-facing change → update task status in `TASKS.md` → run `/sync-hld` if HLD was affected.

## Important Constraints

**Product scope**
- **No admin-initiated cancellation in Phase 2** — explicitly deferred, do not implement (KB2 §9)
- **No mid-service re-upload** — users must create a new booking instead (HLD §19)
- **No in-platform messaging** — all admin↔user communication is via WhatsApp or email outside the platform (KB1 §14)
- **No WhatsApp API automation** — the WhatsApp button is a redirect-only URL (KB1 §16)
- **Pre-deposit disclosure** for GSTAT Appeal and Commissioner Appeal must appear at all four points: pricing page, booking flow Step 1, Draft Ready email, Pay-to-Unlock screen — never omit any (KB2 §7)

**Payment**
- **Webhook must use `express.raw()`** — never `express.json()` on the Razorpay route; register it before the global JSON parser (HLD §6.3)
- **HMAC-SHA256 verification is the first operation** — return 400 immediately on failure, no payload logging (backend.md §6.2)
- **Idempotency via unique constraint** on `payment_records.razorpay_payment_id` — never remove this constraint (HLD §10.4)
- **Admin "Mark as Paid"** must call Razorpay Fetch Payment API before updating DB — no blind override (HLD §10.2)

**File handling**
- **Files never pass through Express** — pre-signed S3 PUT for upload, pre-signed GET for download, no Multer (HLD §9.2)
- **All S3 objects are private** — no public S3 URLs, ever (RULES.md §4.5)
- **Draft PDF pre-signed URLs expire in 15 minutes** and are generated fresh per page load — never store them in the DB (HLD §9.4)

**Auth & security**
- **JWT in HTTP-only cookies only** — never `localStorage`, never `sessionStorage` (HLD §8.1)
- **User identity from `req.user` only** — never from `req.body` (RULES.md §4.6)
- **Never log** passwords, OTPs, JWT tokens, Razorpay secrets, or PII (RULES.md §4.1)
- **Never put PII or tokens in URL query parameters** (RULES.md §4.2)

**Data**
- **All Prisma queries in `src/repositories/`** — controllers and services never import Prisma directly (database.md §1.1)
- **Users are soft-deleted** — bookings and payment records are never deleted (database.md §3)
- **Never return raw Prisma rows** — always map to a DTO before sending a response (backend.md §7.3)

**Deployment**
- **No code reaches `main` without passing `staging` first** — `feature branch → PR to staging → test → PR to main → production` (HLD §18.4)
- **Production Razorpay key must start with `rzp_live_`** — deploying with a test key is a critical error

## Document Reading Order
1. `README.md` — project overview, services, tech stack, roadmap
2. `docs/architecture/gstnoticesupport_project_knowledge_base_1.md` — full product requirements
3. `docs/architecture/gstnoticesupport_project_knowledge_base_2.md` — payment mechanic and scope updates
4. `docs/architecture/gstnoticesupport_HLD.md` — system architecture and locked decisions
5. `docs/architecture/gstnoticesupport_LLD.md` — implementation specifics
6. `docs/architecture/platform_interaction_flows.md` — user and admin journeys
7. `.claude/rules/RULES.md` → `frontend.md` → `backend.md` → `database.md` — coding standards
8. The skill file for the area you are about to work in

> **Conflict resolution:** KB2 > KB1 > HLD > LLD > everything else. A decision in `docs/tracking/decisions.md` overrides HLD/KB only if it explicitly states so.
