---
name: auth-and-security
description: >
  Guides implementing authentication, authorization, and environment configuration
  for the gstnoticesupport.in backend and frontend — JWT signing, HTTP-only cookies,
  OTP via Resend, password hashing, role-based guards, CORS, and per-environment
  config (dev / staging / production). Use this for any auth endpoint (signup,
  OTP verify, login, logout, forgot password), middleware wiring, cookie config,
  CORS setup, environment variable changes, or anything touching security headers.
  Triggers on "auth", "JWT", "login", "logout", "cookie", "session", "OTP",
  "password", "CORS", "env", "environment", "Helmet", "rate limit", "middleware".
---

# Auth & Security — JWT, Cookies, OTP, and Environment Configuration

## Purpose

Authentication and environment configuration are tightly coupled in this project — cookie domains, JWT secrets, CORS origins, and Resend API keys all vary by environment. This skill covers the full auth lifecycle plus the env-config that makes it work in dev / staging / production.

**Source of truth:**
- HLD §4.3 (CORS Configuration)
- HLD §4.4 (Cookie Domain Strategy)
- HLD §8 (Authentication & Authorization)
- HLD §14 (Security Architecture)
- HLD §18 (Environment Strategy)
- HLD §22.4 (Locked Auth Decisions)
- LLD (Auth Service)

---

## Locked Decisions

| Decision | Value |
|---|---|
| Auth strategy | JWT in HTTP-only cookie, never localStorage |
| Token lifetime | 7 days |
| Refresh token | None at launch — user re-logs in after expiry |
| Password hashing | bcrypt |
| Email verification | OTP via Resend |
| Forgot password | OTP-based reset (not magic link) |
| Roles | `user` (default) and `admin` (set in DB only) |
| GSTN field | Collected per-booking, not per-user |

Do not add refresh tokens, social login, magic links, or 2FA — none are in scope.

---

## JWT Lifecycle

### Signing

The JWT payload contains the minimum needed for authorization:

```
{
  sub: <userId>,
  role: 'user' | 'admin',
  iat: <issuedAt>,
  exp: <iat + 7 days>
}
```

Sign with `JWT_SECRET` (env var). Never put email, name, or anything sensitive in the payload — JWTs are not encrypted, only signed.

### Setting the cookie

After successful signup-OTP / login / password reset, set the cookie with these flags:

| Flag | Production | Development |
|---|---|---|
| `httpOnly` | `true` | `true` |
| `secure` | `true` | `false` |
| `sameSite` | `'lax'` | `'lax'` |
| `domain` | `.gstnoticesupport.in` | unset (so it works on localhost) |
| `path` | `/` | `/` |
| `maxAge` | `7 * 24 * 60 * 60 * 1000` | same |

The `.gstnoticesupport.in` leading dot lets the cookie flow from `gstnoticesupport.in` (frontend) to `api.gstnoticesupport.in` (backend).

### Verifying

`authMiddleware` reads the cookie, verifies the JWT signature and expiry, fetches the user from DB (to confirm the account still exists and isn't soft-deleted), and attaches `req.user = { id, email, role }`. If any step fails, throw `UnauthorizedError` (401).

### Logout

Clearing the cookie is sufficient — there is no server-side session store. Use the same cookie options (domain, path, sameSite, secure) when clearing; mismatched options silently fail to clear in some browsers.

---

## OTP Flow (Signup + Forgot Password)

### Signup

1. `POST /auth/signup` — Accept email + password. Hash password with bcrypt (10 rounds). Create user row with `emailVerified=false`. Generate 6-digit OTP, hash it, store with 10-minute expiry in `otp_codes` table. Send OTP email via Resend. Return success (no JWT yet — user is not verified).
2. `POST /auth/verify-otp` — Accept email + OTP. Look up the OTP row, check expiry and attempt count (max 5), compare hashed value. On match: set `emailVerified=true`, delete OTP row, issue JWT cookie, return user object.
3. `POST /auth/resend-otp` — Rate-limited (5 per 15min per IP). Invalidate previous OTP, issue new one.

### Forgot Password

1. `POST /auth/forgot-password` — Accept email. If user exists, generate OTP and store. Always return success (do not reveal whether the email is registered — prevents enumeration).
2. `POST /auth/reset-password` — Accept email + OTP + new password. Verify OTP, hash new password, update user row, invalidate any active sessions (cookie clears on next request to /auth/me with old token — acceptable trade-off without refresh tokens).

### OTP Storage

| Field | Notes |
|---|---|
| `email` | indexed |
| `codeHash` | bcrypt of the 6-digit OTP |
| `purpose` | `signup` or `password_reset` |
| `attempts` | counter, locked at 5 |
| `expiresAt` | now + 10 minutes |
| `createdAt` | |

Never log OTPs. Never include them in error responses. Never accept them as query params.

---

## Authorization

### authMiddleware

Required on all `/api/v1/user/...` and `/api/v1/admin/...` routes. Attaches `req.user`. Throws `UnauthorizedError` if missing or invalid.

### adminGuard

Required after `authMiddleware` on all `/api/v1/admin/...` routes. Checks `req.user.role === 'admin'`. Throws `ForbiddenError` if not.

### Resource ownership

Enforced in the repository layer, never in the controller. Every read/update of a user-owned resource includes `WHERE userId = currentUserId` unless the requester is admin. This is the only correct place for ownership checks — controllers can be bypassed by route reordering, repositories cannot.

Example: `bookingRepository.findById(bookingId, requesterId, isAdmin)` — the repository decides whether to add the ownership filter based on `isAdmin`.

---

## CORS & Security Headers

### CORS

```
origin: <FRONTEND_ORIGIN env var>
credentials: true
methods: GET, POST, PATCH, DELETE
allowedHeaders: Content-Type, Authorization
```

Never use wildcard `origin: '*'` — incompatible with `credentials: true`, and unsafe regardless.

### Helmet

Apply with defaults. Override `contentSecurityPolicy` only if needed for embedded Razorpay scripts (Razorpay modal loads `checkout.razorpay.com`).

### Other locked security measures (HLD §14)

- All traffic over HTTPS (enforced by Vercel + Render).
- No PII in URL query params.
- bcrypt password hashing.
- Per-endpoint rate limiting (see `backend-core` skill).
- Razorpay webhook IP allowlist in Cloudflare WAF (post-launch).

---

## Environment Configuration

### Three environments

| Env | Frontend | Backend | DB |
|---|---|---|---|
| Development | localhost:3000 | localhost:4000 | NeonDB dev branch |
| Staging | staging.gstnoticesupport.in | api-staging.gstnoticesupport.in | NeonDB staging branch |
| Production | gstnoticesupport.in | api.gstnoticesupport.in | NeonDB main branch |

### Backend env vars (server/.env)

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` / `staging` / `production` |
| `PORT` | Backend listening port |
| `DATABASE_URL` | NeonDB connection string (branch-specific) |
| `JWT_SECRET` | Long random string, different per env |
| `FRONTEND_ORIGIN` | Exact frontend URL for CORS |
| `COOKIE_DOMAIN` | `.gstnoticesupport.in` in prod/staging, unset in dev |
| `RESEND_API_KEY` | From Resend dashboard |
| `RESEND_FROM_EMAIL` | `support@gstnoticesupport.in` |
| `AWS_REGION` | `ap-south-1` (Mumbai) |
| `AWS_ACCESS_KEY_ID` | IAM user with S3-only scope |
| `AWS_SECRET_ACCESS_KEY` | |
| `S3_BUCKET_NAME` | per-env bucket |
| `RAZORPAY_KEY_ID` | |
| `RAZORPAY_KEY_SECRET` | |
| `RAZORPAY_WEBHOOK_SECRET` | |
| `SENTRY_DSN` | Production only, before launch |

### Frontend env vars (client/.env.local)

Variables prefixed `NEXT_PUBLIC_` are exposed to the browser. Everything else stays server-side.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Backend base URL (api.gstnoticesupport.in) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key (safe in browser) |
| `NEXT_PUBLIC_CALENDLY_URL` | Calendly embed URL |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID |
| `NEXT_PUBLIC_SITE_URL` | Canonical frontend URL (for SEO, OG tags) |

Never put `RAZORPAY_KEY_SECRET`, `JWT_SECRET`, or any backend secret in the frontend env file — it leaks to the browser bundle.

### Env loading

Use a single `config/env.ts` module that loads, validates (with Zod), and exports all env vars as a typed object. Throw on startup if any required var is missing. Never read `process.env` directly anywhere else in the codebase.

---

## Anti-patterns

Do not:

- Store JWT in localStorage or sessionStorage — XSS-exploitable. Use HTTP-only cookies only.
- Use the same `JWT_SECRET` across environments. Rotate per env.
- Issue JWTs to unverified accounts. Verification must precede login.
- Reveal whether an email is registered in forgot-password responses.
- Put OTPs in URLs (query params, path segments). Body only.
- Log OTP values, JWT contents, or passwords.
- Use `cors({ origin: '*' })` with `credentials: true` — invalid combination.
- Hardcode environment-specific values. Always via env vars.
- Read `process.env` outside `config/env.ts`. Centralize env access.
- Set `secure: true` on cookies in development — they won't be sent over HTTP localhost.
- Forget the leading dot in `COOKIE_DOMAIN=.gstnoticesupport.in`. Without it, the cookie won't cross the subdomain boundary.
- Skip ownership checks in repositories. Controllers are not the right place.

---

## Quick Reference: Adding a New Auth Endpoint

1. Confirm it's not duplicating an existing flow (signup, verify, login, forgot, reset, logout — that's the complete list).
2. Write Zod schema in `schemas/auth.schema.ts`.
3. Add rate limiting if it sends OTP or accepts credentials.
4. Implement service logic in `services/auth.service.ts`.
5. Update cookie in controller (set or clear) using the locked options table above.
6. Add the route to `routes/auth.routes.ts` under `/api/v1/public/auth/...`.
7. Email templates go in `lib/email/templates/` (see `integrations` skill).
