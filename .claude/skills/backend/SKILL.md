---
name: backend-core
description: >
  Guides building any Express.js endpoint in the gstnoticesupport.in backend —
  route definition, controller, service, Zod validation, and error handling.
  Use this whenever creating a new API route, adding a new controller method,
  writing a Zod schema, modifying the error response shape, or wiring any
  HTTP handler. Triggers on "add endpoint", "new route", "validate request",
  "controller", "service method", "error handling", "Zod schema", or any
  task that exposes new backend functionality.
---

# Backend Core — Express Endpoints, Validation & Error Handling

## Purpose

This skill encodes the locked architectural pattern for every HTTP endpoint in the gstnoticesupport.in backend. One endpoint = route + controller + service + Zod schema + consistent error handling. These five concerns are inseparable; this skill covers all of them together.

**Source of truth:**
- HLD §6 (Backend Architecture)
- HLD §6.2 (Request Flow)
- HLD §6.4 (Error Handling)
- HLD §6.6 (Rate Limiting)
- LLD (Auth Service, Booking Service, Document Service, Payment Service)

---

## Locked Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + Express.js + TypeScript |
| ORM | Prisma (PostgreSQL on NeonDB) |
| Validation | Zod |
| Auth | JWT in HTTP-only cookies |
| Security | Helmet.js, CORS (credentials: true, explicit origin), express-rate-limit |

Do not introduce NestJS, Fastify, Joi, Yup, class-validator, or any alternative — the stack is locked in HLD §3.2.

---

## Folder Structure (server/)

```
server/
  src/
    routes/         # Express Router files, one per domain
    controllers/    # Request handlers (thin — parse, validate, delegate)
    services/       # Business logic (thick — DB calls, side effects)
    repositories/   # Prisma queries
    middleware/     # auth, validation, rateLimit, errorHandler
    schemas/        # Zod schemas (shared structure with frontend)
    lib/            # JWT, bcrypt, S3, Razorpay, Resend wrappers
    config/         # env loading, constants
    index.ts        # entry point
```

A new endpoint always touches: `routes/` → `controllers/` → `services/` → (`repositories/` or `lib/`) plus a `schemas/` entry.

---

## Step 1 — Decide the Endpoint Surface

Every endpoint belongs to one of three surfaces. The surface determines middleware, path prefix, and access control.

| Surface | Path prefix | Auth | Examples |
|---|---|---|---|
| Public | `/api/v1/public/...` | None | Contact form, signup, login, OTP, webhooks |
| User (authenticated) | `/api/v1/user/...` | `authMiddleware` (role: any) | Bookings, uploads, payments, account |
| Admin | `/api/v1/admin/...` | `authMiddleware` + `adminGuard` | All admin dashboard endpoints |

**Critical:** The Razorpay webhook (`/api/v1/webhooks/razorpay`) is public but uses `express.raw({ type: 'application/json' })` instead of `express.json()`. HMAC signature verification fails permanently if the body is JSON-parsed first.

---

## Step 2 — Write the Zod Schema First

Schema-first prevents validation drift. Place every request schema in `src/schemas/` grouped by domain (e.g. `schemas/booking.schema.ts`, `schemas/auth.schema.ts`).

**Conventions:**
- Each schema is exported as `<Action><Entity>Schema` (e.g. `createBookingSchema`, `verifyOtpSchema`).
- Each schema also exports its inferred TypeScript type using `z.infer<typeof Schema>`.
- Validation runs in middleware (`validateBody`, `validateQuery`, `validateParams`) — never inline inside controllers.
- Reject unknown keys with `.strict()` on object schemas.
- Centralize reusable primitives (email, password, GSTN regex, UUID) in `schemas/common.ts`.

**Validation surfaces:**
- Request body → `validateBody(schema)` middleware
- Query params → `validateQuery(schema)` middleware
- URL params → `validateParams(schema)` middleware

The validation middleware attaches the parsed, typed result to `req.validated.body / query / params`. Controllers read from there, never from raw `req.body`.

---

## Step 3 — Define the Route

Each domain has its own router file. Routers wire middleware in this fixed order:

```
router.<method>(path,
  rateLimit?,         // only on the 5 endpoints listed in HLD §6.6
  authMiddleware?,    // user routes and above
  adminGuard?,        // admin routes only
  validateBody(...),  // or validateQuery / validateParams
  controller.method
)
```

**Rate-limited endpoints (HLD §6.6):**

| Endpoint | Window | Max |
|---|---|---|
| `POST /auth/send-otp` | 15 min | 5 per IP |
| `POST /auth/forgot-password` | 15 min | 5 per IP |
| `POST /auth/login` | 15 min | 10 per IP |
| `POST /contact` | 60 min | 3 per IP |
| `POST /bookings/:id/draft-url` | 60 min | 20 per user |

Do not apply rate limiting globally. Do not apply it to the Razorpay webhook.

---

## Step 4 — Controller (thin)

Controllers are thin orchestrators. They:

1. Read validated input from `req.validated`.
2. Read the authenticated user from `req.user` (set by `authMiddleware`).
3. Call the appropriate service method.
4. Shape the response (status code + JSON body).
5. Throw on error — never return error responses directly.

Controllers must not:
- Call Prisma directly (use a service or repository).
- Send emails, call external APIs, or upload files (delegate to service).
- Contain `if/else` branches deeper than one level — that's business logic, push it down.

---

## Step 5 — Service (thick)

Services contain the business logic. They:

1. Accept typed input (the Zod-inferred type).
2. Coordinate repository calls, external SDKs (S3, Razorpay, Resend), and state transitions.
3. Enforce ownership checks (e.g. `booking.userId === currentUserId` unless admin).
4. Throw typed errors (see Step 6) when something is wrong.
5. Return typed output — never return raw Prisma rows that include sensitive fields.

Services compose other services. Cross-domain operations (booking + email + S3) live in the orchestrating service.

---

## Step 6 — Error Handling

A single centralized error middleware catches every thrown error. Errors are classified into two buckets:

**Operational errors** — expected failure modes (validation, not found, unauthorized, conflict). These extend a base `AppError` class with a known HTTP status and a user-safe message.

Required operational error types:
- `ValidationError` (400) — schema validation failed, malformed input.
- `UnauthorizedError` (401) — missing or invalid auth.
- `ForbiddenError` (403) — authenticated but not permitted (e.g. user accessing another user's booking).
- `NotFoundError` (404) — resource does not exist.
- `ConflictError` (409) — state transition not allowed, duplicate resource, idempotency hit.
- `RateLimitError` (429) — rate limit exceeded (auto-fires from express-rate-limit).

**Programmer errors** — bugs, unexpected exceptions. These return generic 500 with no detail and are logged.

**Response shape (locked):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [ { "field": "email", "issue": "required" } ]
  }
}
```

Success responses:

```json
{
  "success": true,
  "data": { ... }
}
```

The error middleware is the last `app.use()` call in `index.ts`. It accepts `(err, req, res, next)`. Async controllers wrap thrown errors via an `asyncHandler(fn)` utility so promise rejections reach the middleware.

---

## Step 7 — Middleware Chain Order (locked)

Per HLD §6.2, the global middleware order in `index.ts` is:

```
CORS → Helmet → cookieParser → express.json (or express.raw for webhooks) →
routers → 404 handler → errorHandler
```

CORS must set `credentials: true` and an explicit `origin` per environment — never wildcard `*`.

The webhook router is mounted before `express.json()`, with its own `express.raw({ type: 'application/json' })`. Reversing this breaks signature verification.

---

## Anti-patterns

Do not:

- Validate inside controllers with `if (!req.body.email)`. Use Zod middleware.
- Return error responses directly from controllers. Throw typed errors.
- Call Prisma from controllers. Go through a service.
- Use `try/catch` to swallow errors and return 500 manually. Let the error middleware handle it.
- Apply rate limiting globally. Per-endpoint only (HLD §6.6).
- Use `express.json()` on the Razorpay webhook route. Use `express.raw()`.
- Apply `cors({ origin: '*' })`. Use the explicit per-env origin with `credentials: true`.
- Return Prisma rows directly. Strip sensitive fields (`passwordHash`, internal flags).
- Mix HTTP concerns into services. HTTP belongs in controllers; services are transport-agnostic.

---

## Quick Reference: Adding a New Endpoint

1. Pick the surface (public / user / admin).
2. Write the Zod schema in `schemas/<domain>.schema.ts`.
3. Add the route in `routes/<domain>.routes.ts` with the correct middleware chain.
4. Add the controller method in `controllers/<domain>.controller.ts`.
5. Add the service method in `services/<domain>.service.ts`.
6. If new DB queries: add to `repositories/<domain>.repository.ts`.
7. If touching files, payments, or email: see `data-and-storage` and `integrations` skills.
8. If touching auth/cookies: see `auth-and-security` skill.
9. If touching booking status transitions: see `status-machine` skill.
