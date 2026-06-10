---
name: review
description: >
  Audits any code in the gstnoticesupport.in project against all locked
  architectural conventions. Runs a full review of a file, directory, or the
  current git diff — checking endpoint security, Zod validation, middleware
  chain, ownership checks, status gate correctness, email notification
  coverage, frontend rendering strategy, SEO completeness, and anti-patterns
  from all six skills. Use before every commit, PR, or deploy.
  Usage: /review [target]
  Targets: (blank = current git diff) | <file path> | <directory> | pr
  Examples:
    /review
    /review server/src/services/booking.service.ts
    /review server/src/routes/
    /review pr
---

# /review

Audits gstnoticesupport.in code against every locked convention. The review
is structured in passes — each pass checks one concern independently so
nothing is missed due to context switching.

---

## Step 1 — Determine the target

| Input | What to read |
|---|---|
| No argument | `git diff --staged` (pre-commit review) |
| File path | Read that file |
| Directory path | Read all `.ts` and `.tsx` files in the directory |
| `pr` | `git diff origin/staging...HEAD` (full branch diff) |

If the target is empty and `git diff --staged` is also empty, check
`git diff HEAD` (unstaged changes) and notify the developer.

---

## Pass 1 — Backend endpoint audit

Skip this pass if the target contains no files from `server/src/routes/`,
`server/src/controllers/`, or `server/src/services/`.

Check each endpoint against the `backend-core` skill:

**Middleware chain**
- [ ] Public endpoints have no auth middleware
- [ ] User endpoints have `authMiddleware`
- [ ] Admin endpoints have both `authMiddleware` and `adminGuard`
- [ ] Rate limiting applied only to the 5 locked endpoints (send-otp, forgot-password, login, contact, draft-url) — not globally, not on webhook
- [ ] Razorpay webhook route uses `express.raw()` not `express.json()`

**Validation**
- [ ] Every route has a `validateBody`, `validateQuery`, or `validateParams` middleware — no inline `if (!req.body.x)` checks
- [ ] Controller reads from `req.validated` — not from `req.body` directly
- [ ] Zod schema uses `.strict()` on object shapes
- [ ] Schema named `<Action><Entity>Schema` and exports inferred type

**Controller**
- [ ] Controller is thin — no Prisma calls, no email sends, no S3 calls
- [ ] Errors are thrown as typed `AppError` subclasses — not returned as `res.json({ error: ... })`
- [ ] Wrapped with `asyncHandler`
- [ ] Response shape: `{ success: true, data: ... }` or throws

**Service / Repository**
- [ ] Business logic in service — not in controller
- [ ] Prisma calls in repository — not in service or controller
- [ ] Ownership check present for user-scoped resources (`WHERE userId = requesterId`)
- [ ] Ownership check is in the repository layer — not in the controller

**Response safety**
- [ ] No raw Prisma rows returned (no `passwordHash`, `otpCodeHash`, internal flags)
- [ ] No PII in URL params or query strings

Flag each failure with: file, line reference, the violated rule, and the correct pattern.

---

## Pass 2 — Status machine audit

Skip this pass if the target contains no booking-related logic.

Check against the `status-machine` skill:

- [ ] Every booking action service method checks the predecessor state before proceeding
- [ ] Invalid state transitions throw `ConflictError` — not silently fail
- [ ] Auto-transitions (`In Review → Draft Ready`, `Draft Ready → Filing`) happen inside the correct service method, not in the controller
- [ ] Emails fire from inside the transition service method — not from the controller
- [ ] Email fires are try/catch wrapped — email failure does not roll back the DB transaction
- [ ] Forbidden transitions (`Filing → Draft Ready`, cancellation from `Document Upload` / `In Review`) are explicitly blocked
- [ ] Admin-initiated cancellation is not implemented (Phase 2 scope removal — KB2)
- [ ] Pre-deposit disclosure logic present for Services 1 and 2 (GSTAT Appeal, Commissioner Appeal) wherever it is required (pricing, booking step 1, Draft Ready email, Pay to Unlock screen)

---

## Pass 3 — Auth and security audit

Skip this pass if the target contains no auth-related files.

Check against the `auth-and-security` skill:

- [ ] JWT never stored in `localStorage` or `sessionStorage`
- [ ] Cookie set with: `httpOnly: true`, `secure: true` (production), `sameSite: 'lax'`
- [ ] Cookie domain uses leading dot (`.gstnoticesupport.in`) in production/staging
- [ ] Cookie domain unset in development
- [ ] CORS not using wildcard `*` — explicit `FRONTEND_ORIGIN` env var
- [ ] CORS has `credentials: true`
- [ ] `process.env` not read directly outside `config/env.ts`
- [ ] OTP not logged, not in URL params, not in error responses
- [ ] Forgot-password endpoint does not reveal whether email is registered
- [ ] JWTs not issued to unverified accounts

---

## Pass 4 — Data and storage audit

Skip this pass if the target contains no file-handling or Prisma logic.

Check against the `data-and-storage` skill:

- [ ] No Multer or server-side file buffering — files go direct browser → S3
- [ ] Pre-signed URLs have Content-Type and Content-Length constraints
- [ ] Pre-signed GET URLs not stored in DB or returned with lifetimes > 15 minutes
- [ ] S3 keys use generated UUIDs — never raw user input filenames
- [ ] Draft-url endpoint only succeeds when status is `Filing` or `Complete`
- [ ] Upload endpoint only succeeds when status is `Document Upload`
- [ ] File count (≤ 8), size (≤ 5 MB each), total (≤ 40 MB) enforced in the service layer
- [ ] Prisma transactions used where read-then-write operations exist

---

## Pass 5 — Integration audit

Skip this pass if the target contains no Razorpay or Resend logic.

Check against the `integrations` skill:

**Razorpay**
- [ ] Webhook signature comparison uses timing-safe method (`crypto.timingSafeEqual`)
- [ ] Idempotency check on `razorpay_payment_id` before processing webhook
- [ ] Webhook processing inside a Prisma transaction
- [ ] Email sends inside the transaction are try/catch wrapped
- [ ] Mark-as-Paid calls Razorpay Fetch Payment API before updating DB — never blind override
- [ ] Verify page checks idempotency before calling Razorpay API

**Resend**
- [ ] Every new email event exists in the Notification Matrix
- [ ] OTP emails throw on failure (synchronous)
- [ ] All other emails are fire-and-forget (do not throw)
- [ ] No WhatsApp automation — redirect button only
- [ ] Draft Ready email for GSTAT Appeal / Commissioner Appeal has pre-deposit block

---

## Pass 6 — Frontend audit

Skip this pass if the target contains no `client/` files.

Check against the `frontend-core` skill:

- [ ] No Pages Router usage — App Router only
- [ ] Server Components do not have `'use client'` unnecessarily
- [ ] Client Components exist only where browser APIs or interactivity are needed
- [ ] Dashboard Server Components forward the cookie to backend fetch calls
- [ ] Dashboard pages use `cache: 'no-store'`
- [ ] No `useEffect + fetch` for server state — TanStack Query used in Client Components
- [ ] No Redux or global state library
- [ ] Forms use React Hook Form + Zod — no uncontrolled inputs, no manual `if (!value)` checks
- [ ] Zod schemas imported from the shared path — not duplicated
- [ ] No direct `fetch()` from components — all calls through `lib/apiClient.ts`
- [ ] No hardcoded colors outside Tailwind tokens — navy/green/neutral palette only

**Public pages (SEO)**
- [ ] `metadata` export or `generateMetadata` function present
- [ ] Canonical URL set via `alternates.canonical`
- [ ] OG + Twitter tags present
- [ ] Schema.org JSON-LD block correct for page type
- [ ] Route present in `app/sitemap.ts`
- [ ] Route not accidentally blocked in `app/robots.ts`

---

## Pass 7 — General code quality

Run regardless of file type:

- [ ] No `any` TypeScript types without a comment explaining why
- [ ] No `console.log` left in production paths (development-only logging is acceptable)
- [ ] No hardcoded URLs, secrets, or environment values in source files
- [ ] No `TODO` comments that were supposed to be resolved before this PR
- [ ] Enum values used for booking status, user role, OTP purpose — no magic strings

---

## Output format

Group findings by pass. For each finding:

```
[PASS 1 — Backend] server/src/controllers/booking.controller.ts
  ✗ Line 42: Controller calls prisma.booking.findMany() directly.
    Rule: Prisma calls belong in repositories, not controllers.
    Fix: Move to bookingRepository.findAll() and call that from the service.
```

End with a summary:

```
Review complete.
  Passes with issues : 2 (Pass 1, Pass 3)
  Clean passes       : 5
  Total findings     : 4 (3 errors, 1 warning)

Errors block merge. Warnings are advisory.
```

Classify as **error** anything that would cause a runtime bug, security hole,
or violate a locked decision. Classify as **warning** anything that is a
convention violation with no immediate harm (naming, structure, clarity).
