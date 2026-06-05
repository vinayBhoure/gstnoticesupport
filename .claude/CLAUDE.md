# gstnoticesupport.in — Agent Configuration

A two-phase GST litigation services platform for Indian businesses, CAs, and Advocates. Phase 1 is a trust-first marketing site (launch: 15 June 2026). Phase 2 is a full booking platform with document upload, draft-gated payment, and admin workflow (launch: 5 July 2026).

---

## Documentation Map

### Product & Requirements
| Document | What it covers |
|---|---|
| `docs/architecture/gstnoticesupport_project_knowledge_base_1.md` | Services, pricing, personas, user flows, booking mechanics, state machine, admin scope, notification matrix, design constraints. **Primary source of truth for product requirements.** |
| `docs/architecture/gstnoticesupport_project_knowledge_base_2.md` | Payment flow, PDF gating mechanic, Razorpay verify page, pre-deposit disclosure strategy, scope updates. **Supplements and partially overrides KB1 where noted.** |
| `docs/architecture/platform_interaction_flows.md` | Step-by-step user and admin journeys across both phases. Reference when reasoning about state transitions or user touchpoints. |
| `docs/architecture/service_workflow.md` | Admin workflow detail for the booking lifecycle. |

### Architecture & Technical Design
| Document | What it covers |
|---|---|
| `docs/architecture/gstnoticesupport_HLD.md` | Full system architecture: tech stack, deployment topology, frontend/backend structure, auth, file handling, payment architecture, state machine, security, SEO, error handling, environment strategy, locked decisions appendix. |
| `docs/architecture/gstnoticesupport_LLD.md` | Implementation-level detail: Prisma schema, endpoint contracts, key decisions per layer. Read after HLD for build-time specifics. |

### UI/UX & Design System
| Document | What it covers |
|---|---|
| `docs/ui-ux/design.md` | Design principles, layout rules, interaction patterns. |
| `docs/ui-ux/components.md` | Component specifications and usage patterns. |
| `resources/ui/css/tokens.css` | Locked CSS design tokens — colour palette, spacing, typography. Use these; never hardcode hex values. |
| `resources/ui/CLAUDE.md` | Agent instructions specific to the UI resources directory. |
| `resources/ui/design-system/design.md` | Extended design system documentation. |

### Tracking
| Document | What it covers |
|---|---|
| `docs/tracking/TASKS.md` | Active development task board. Check at session start; update when starting or completing work. |
| `docs/tracking/CHANGELOG.md` | User-facing changes log. Update via `/log change` after every shipped feature or fix. |
| `docs/tracking/TRACKING.md` | Project progress and phase tracking. |
| `docs/tracking/ERROR.md` | Known errors and resolutions. Check before debugging a recurring issue. |

---

## Coding Rules

Rules apply to every file written or modified in this project. Domain-specific rules take precedence over universal rules when they conflict.

| File | Scope |
|---|---|
| `.claude/rules/RULES.md` | **Universal** — TypeScript, naming conventions, shared Zod schemas, security non-negotiables, Git & PR conventions. Read this first. |
| `.claude/rules/frontend.md` | `client/` — Server vs Client Components, TanStack Query, React Hook Form + Zod, SSG/SSR strategy, routing, images, component structure, design system constraints. |
| `.claude/rules/backend.md` | `server/` — Controller-service-repository layering, `asyncHandler`, `ApiError`, middleware order, Zod validation, webhook handling, response envelope, file upload pattern. |
| `.claude/rules/database.md` | `server/src/repositories/`, `server/prisma/` — Repository-only Prisma calls, no raw SQL, soft-delete, migration conventions, DTO type exposure, pagination, query safety. |

---

## Skills

Load the relevant skill before writing code in that domain. Skills encode the locked implementation patterns — they are not suggestions.

| Skill | Directory | Load when working on |
|---|---|---|
| `backend-core` | `.claude/skills/backend/` | Any Express route, controller, service, Zod schema, error handling |
| `auth-and-security` | `.claude/skills/auth/` | Auth endpoints, JWT/cookies, CORS, env config, OTP, password handling |
| `data-storage` | `.claude/skills/data-storage/` | Prisma models, migrations, S3 uploads, file handling, repositories |
| `integration` | `.claude/skills/integration/` | Razorpay, Resend, webhook processing, email templates, notification matrix |
| `frontend` | `.claude/skills/frontend/` | Next.js pages, Server/Client Components, forms, TanStack Query, SEO metadata |
| `status-machine` | `.claude/skills/status-machine/` | Booking status transitions, status-gated actions — load whenever `Booking.status` is touched |

---

## Commands

| Command | When to use |
|---|---|
| `/context` | **Start of every session.** Loads a compact project summary, current open tasks, recent decisions, and the locked stack. Use `/context flow:<name>` to walk through a specific platform flow (auth, booking, file-upload, payment, status-change, draft-delivery). Use `/context scope:<feature>` to check if a feature is in scope. |
| `/scaffold <type> <name>` | Generate a complete, convention-compliant artifact. Types: `endpoint`, `page`, `model`, `email`, `component`. Never generates stubs — produces all required files. |
| `/review [target]` | Audit code against all locked conventions across 7 passes: backend endpoint, status machine, auth/security, data/storage, integrations, frontend, and general quality. Run before every commit and PR. Default target is the current git diff. |
| `/git start <description>` | Create a correctly named branch. |
| `/git commit` | Generate a Conventional Commits message from the staged diff. |
| `/git pr` | Draft a complete pull request description with the project-specific checklist. |
| `/log decision <text>` | Record an architectural or product decision in `docs/tracking/decisions.md`. |
| `/log change <text>` | Record a user-facing change in `docs/tracking/CHANGELOG.md`. |
| `/log question <text>` | Record an unresolved question in `docs/tracking/open-questions.md`. |
| `/task add <description>` | Add a task to `docs/tracking/TASKS.md` with phase, layer, and priority. |
| `/task list [filters]` | List open tasks filtered by phase, layer, priority, or status. |
| `/deploy staging` | Run the staging pre-deploy checklist and post-deploy smoke tests. |
| `/deploy production` | Run the production pre-deploy checklist (includes Razorpay live key check, Cloudflare WAF, CORS, cookie domain, Sentry DSN). |
| `/debug payment [bookingId]` | Diagnose a stuck payment across all three reliability layers. |
| `/debug webhook` | Diagnose Razorpay webhook signature failures, raw body middleware issues, Cloudflare WAF. |
| `/debug auth [symptom]` | Diagnose JWT rejection, cookie not sent, CORS failures. |
| `/sync-hld [section]` | Detect drift between the codebase and the HLD/KB documentation. Run after significant features are completed. |

---

## Session Workflow

**At the start of every session:**
1. Run `/context` to load the project state, open tasks, and recent decisions.
2. Check `docs/tracking/TASKS.md` for the current branch's task status.
3. If picking up work in a specific area, load the relevant skill file before writing code.

**While working:**
- Load the relevant skill before scaffolding or modifying any domain area.
- Run `/review` on staged changes before committing.
- Use `/git commit` to generate commit messages — do not write them freehand.
- If a decision is made that is not documented in HLD/KB, log it immediately with `/log decision`.

**Before opening a PR:**
1. Run `/review pr` on the full branch diff.
2. Resolve all errors (warnings are advisory).
3. Run `/git pr` to generate the PR description and checklist.
4. Confirm the PR targets `staging`, not `main`.

**After shipping a feature:**
- Run `/log change` for any user-facing or API-visible change.
- Update task status in `docs/tracking/TASKS.md`.
- If the feature changes anything in the HLD, run `/sync-hld` to surface drift.

---

## Hard Constraints

These are non-negotiable. They encode locked product and architectural decisions that cannot be changed without an explicit client discussion and a `/log decision` entry.

**Product scope**
- Admin-initiated booking cancellation is **not in Phase 2**. It is explicitly deferred. Do not implement it. (KB2 §9)
- Re-upload of documents mid-service is **not in Phase 2**. Users must create a new booking. (HLD §19)
- No in-platform messaging between admin and user. All admin↔user communication is via WhatsApp or email outside the platform. (KB1 §14)
- No WhatsApp API automation. The WhatsApp button is a redirect-only URL. (KB1 §16)
- Pre-deposit disclosure for GSTAT Appeal and Commissioner Appeal must appear at **four specific points**: pricing page, booking flow Step 1, Draft Ready email, Pay-to-Unlock screen. Never omit any of these four. (KB2 §7)

**Payment**
- Razorpay webhook route must use `express.raw({ type: 'application/json' })`, never `express.json()`. Register it before the global JSON parser. (HLD §6.3, backend.md §6.1)
- Always verify HMAC-SHA256 signature as the first operation on the webhook. Return 400 immediately on failure. No payload logging. (backend.md §6.2)
- Idempotency is enforced via the unique constraint on `payment_records.razorpay_payment_id`. Never remove this constraint. (HLD §10.4)
- Admin "Mark as Paid" must call the Razorpay Fetch Payment API before updating the DB. No blind override. (HLD §10.2)

**File handling**
- Files never pass through Express. Use pre-signed S3 PUT URLs for upload and pre-signed GET URLs for download. No Multer. (HLD §9.2, backend.md §9.1)
- All S3 objects are private. No public S3 URLs, ever. (RULES.md §4.5)
- Draft PDF pre-signed GET URLs are valid for 15 minutes and generated fresh per page load. Never store them in the DB. (HLD §9.4)

**Auth & security**
- JWT is stored in HTTP-only cookies only. Never `localStorage`, never `sessionStorage`. (HLD §8.1)
- User identity is always read from `req.user` (set by auth middleware). Never from `req.body`. (RULES.md §4.6)
- Never log passwords, OTPs, JWT tokens, Razorpay secrets, or PII. (RULES.md §4.1)
- Never put PII or tokens in URL query parameters. (RULES.md §4.2)

**Data**
- All Prisma queries live in `src/repositories/`. Controllers and services never import the Prisma client directly. (database.md §1.1)
- Users are soft-deleted (`deletedAt` timestamp). Bookings and payment records are never deleted. (database.md §3)
- Never return raw Prisma rows. Always map to a DTO before sending a response. (backend.md §7.3)

**Deployment**
- No code reaches `main` without passing through `staging` first. The promotion path is locked: `feature branch → PR to staging → staging deploy → test → PR to main → production deploy`. (HLD §18.4)
- Production Razorpay key must start with `rzp_live_`. Deploying with a test key to production is a critical error.

---

## Document Reading Order

For a new session or a new engineer — read in this order:

1. `README.md` — project overview, services, tech stack, roadmap
2. `docs/architecture/gstnoticesupport_project_knowledge_base_1.md` — full product requirements
3. `docs/architecture/gstnoticesupport_project_knowledge_base_2.md` — payment mechanic and scope updates
4. `docs/architecture/gstnoticesupport_HLD.md` — system architecture and locked decisions
5. `docs/architecture/gstnoticesupport_LLD.md` — implementation specifics
6. `docs/architecture/platform_interaction_flows.md` — user and admin journeys
7. `.claude/rules/RULES.md` → `frontend.md` → `backend.md` → `database.md` — coding standards
8. The skill file for the area you are about to work in

> **Conflict resolution:** If any document contradicts another, the order of precedence is: KB2 > KB1 > HLD > LLD > everything else. A later decision in `docs/tracking/decisions.md` overrides HLD/KB only if the decision entry explicitly states it supersedes the earlier document.
