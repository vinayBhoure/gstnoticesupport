# GST Notice Support — Universal Coding Rules

> **Scope:** Applies to every file in the project — frontend and backend.
> **Supplements:** `frontend.md`, `backend.md`, `database.md`
> **Override policy:** Domain-specific rules in the supplement files take precedence over these universal rules when they conflict.

---

## 1. TypeScript

### 1.1 — Strict mode is always on. Never disable it.

**Why:** Catching type errors at compile time is cheaper than debugging production bugs.

Never add `// @ts-ignore`, `// @ts-expect-error`, or `// eslint-disable` without a comment explaining why it's unavoidable and a ticket to fix it.

```ts
// ❌ DON'T
// @ts-ignore
const result = someUntypedLibrary.doThing();

// ✅ DO — define a type or use unknown + narrowing
const result = someUntypedLibrary.doThing() as ExpectedShape;
```

---

### 1.2 — Never use `any`. Use `unknown` for truly unknown shapes and narrow before use.

**Why:** `any` silently disables type checking and defeats the purpose of TypeScript.

```ts
// ❌ DON'T
function parseWebhookBody(body: any) {
  return body.razorpay_payment_id;
}

// ✅ DO
function parseWebhookBody(body: unknown): string {
  if (typeof body !== 'object' || body === null || !('razorpay_payment_id' in body)) {
    throw new ApiError(400, 'Invalid webhook payload');
  }
  return String((body as Record<string, unknown>).razorpay_payment_id);
}
```

---

### 1.3 — Derive TypeScript types from Zod schemas. Never write them twice.

**Why:** A type and its schema falling out of sync causes silent runtime failures.

```ts
// ❌ DON'T — manually duplicating the type
interface CreateBookingInput {
  serviceType: ServiceType;
  name: string;
  email: string;
}

// ✅ DO — infer from the schema
import { createBookingSchema } from '@/schemas/booking.schema';
type CreateBookingInput = z.infer<typeof createBookingSchema>;
```

---

### 1.4 — Use `type` for API shapes and inferred Zod types. Use `interface` only when extension is the explicit intent.

**Why:** `type` aliases are more concise and work better with Zod's `z.infer<>`.

---

### 1.5 — Prefer `const`. Use `let` only when reassignment is required. Never use `var`.

---

### 1.6 — Prefer named exports over default exports.

**Why:** Named exports are refactor-safe — renaming doesn't silently break imports.

```ts
// ❌ DON'T
export default function BookingCard() { ... }

// ✅ DO
export function BookingCard() { ... }
```

---

### 1.7 — Type all function parameters and return values explicitly on public functions.

**Why:** Implicit return types make function contracts invisible to callers.

```ts
// ❌ DON'T
async function getBooking(id: string) {
  return prisma.booking.findUnique({ where: { id } });
}

// ✅ DO
async function getBooking(id: string): Promise<BookingDTO | null> {
  ...
}
```

---

## 2. Naming Conventions

| What | Convention | Example |
|---|---|---|
| Files (all) | `kebab-case` | `booking-service.ts`, `auth-controller.ts` |
| React component files | `PascalCase` | `BookingCard.tsx`, `DraftLockCard.tsx` |
| Variables & functions | `camelCase` | `getBookingById`, `isEmailVerified` |
| React components | `PascalCase` | `BookingCard`, `ServiceStatusBadge` |
| Types & type aliases | `PascalCase` | `BookingDTO`, `ServiceType` |
| Zod schemas | `camelCase` + `Schema` suffix | `createBookingSchema`, `loginSchema` |
| Environment constants | `SCREAMING_SNAKE_CASE` | `JWT_ACCESS_SECRET`, `AWS_S3_BUCKET_NAME` |
| Database columns (Prisma) | `snake_case` | `created_at`, `email_verified` |
| API route paths | `kebab-case` | `/auth/verify-otp`, `/bookings/:id/upload-url` |
| Boolean variables | `is` / `has` / `can` prefix | `isEmailVerified`, `hasActiveBooking`, `canDelete` |

---

### 2.1 — Name things by what they are, not how they are implemented.

```ts
// ❌ DON'T — implementation detail in the name
const prismaBooking = await bookingRepository.findById(id);

// ✅ DO — name the concept
const booking = await bookingRepository.findById(id);
```

---

### 2.2 — Boolean function names answer a yes/no question.

```ts
// ❌ DON'T
function activeBookings(userId: string): Promise<boolean> { ... }

// ✅ DO
function hasActiveBookings(userId: string): Promise<boolean> { ... }
```

---

## 3. Shared Zod Schema Rules

### 3.1 — Schemas live in `server/src/schemas/`. Both frontend and backend import from there.

**Why:** A single source of truth means validation can never drift between layers.

```
server/src/schemas/
  auth.schema.ts       # loginSchema, signupSchema, verifyOtpSchema, resetPasswordSchema
  booking.schema.ts    # createBookingSchema, bookingStatusSchema
  document.schema.ts   # uploadUrlRequestSchema, confirmUploadSchema
  payment.schema.ts    # createOrderSchema, verifyPaymentSchema
  user.schema.ts       # updateProfileSchema
```

---

### 3.2 — Never recreate a schema in the frontend. Import it.

```ts
// ❌ DON'T — recreating the schema in a form component
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

// ✅ DO — import from the shared location
import { loginSchema } from '@server/schemas/auth.schema';
```

---

### 3.3 — Schema names reflect the operation, not the entity.

```ts
// ❌ DON'T
const bookingSchema = z.object({ ... });

// ✅ DO — what operation does this validate?
const createBookingSchema = z.object({ ... });
const updateBookingStatusSchema = z.object({ ... });
```

---

## 4. Security Non-Negotiables

These rules are absolute. No exceptions without explicit architectural discussion.

### 4.1 — Never log sensitive data.

The following must never appear in any log statement: passwords, OTPs, JWT tokens, Razorpay secrets, full email bodies, full S3 pre-signed URLs, or any PII (email, phone, GSTN).

```ts
// ❌ DON'T
console.log('User login attempt', { email, password });
console.error('Webhook received', JSON.stringify(req.body));

// ✅ DO
console.log('User login attempt', { email });
console.error('Webhook signature verification failed');
```

---

### 4.2 — Never put PII or tokens in URL parameters.

**Why:** URLs appear in server logs, browser history, and Referer headers.

```ts
// ❌ DON'T
redirect(`/payment/verify?email=${user.email}&token=${jwt}`);

// ✅ DO — use opaque IDs only
redirect(`/payment/verify?orderId=${razorpayOrderId}`);
```

---

### 4.3 — Never commit `.env` files. Always commit `.env.example` with placeholder values.

---

### 4.4 — Always verify Razorpay webhook HMAC-SHA256 signature before processing any payload.

**Why:** Without verification, any actor can spoof a payment confirmation and unlock a draft for free.

See `backend.md §6` for the implementation pattern.

---

### 4.5 — S3 files are private. Never generate public S3 URLs. Always use pre-signed URLs.

**Why:** Public S3 URLs bypass all access control — anyone with the URL can download any document.

---

### 4.6 — Never read user identity from `req.body`. Always read from `req.user` (set by auth middleware).

```ts
// ❌ DON'T
const booking = await bookingService.create(req.body.userId, data);

// ✅ DO
const booking = await bookingService.create(req.user.id, data);
```

---

## 5. Code Quality

### 5.1 — Prefer early returns to reduce nesting.

```ts
// ❌ DON'T
async function handleCancel(bookingId: string, userId: string) {
  const booking = await bookingRepository.findById(bookingId);
  if (booking) {
    if (booking.userId === userId) {
      if (booking.status === 'draft_ready') {
        await bookingRepository.updateStatus(bookingId, 'cancelled');
      } else {
        throw new ApiError(400, 'Cannot cancel at this stage');
      }
    } else {
      throw new ApiError(403, 'Forbidden');
    }
  } else {
    throw new ApiError(404, 'Booking not found');
  }
}

// ✅ DO
async function handleCancel(bookingId: string, userId: string) {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.userId !== userId) throw new ApiError(403, 'Forbidden');
  if (booking.status !== 'draft_ready') throw new ApiError(400, 'Cannot cancel at this stage');

  await bookingRepository.updateStatus(bookingId, 'cancelled');
}
```

---

### 5.2 — Write no comments by default. Add one only when the WHY is non-obvious.

Document hidden constraints, workarounds, or regulatory requirements — not what the code does.

```ts
// ❌ DON'T — explains the obvious
// Loop through bookings and check their status
for (const booking of bookings) { ... }

// ✅ DO — explains a non-obvious constraint
// Razorpay webhook route must receive the raw body before any JSON parsing.
// Signature verification is computed over the raw buffer.
app.post('/webhooks/razorpay', express.raw({ type: 'application/json' }), webhookController.handle);
```

---

### 5.3 — Don't add error handling, fallbacks, or validation for scenarios that cannot happen.

Trust Prisma's parameterised queries, Zod's validated inputs, and framework guarantees. Only validate at system boundaries (user input, external APIs, webhooks).

---

### 5.4 — No `console.log` in committed code.

Use structured logging utilities only. Remove all debug logs before opening a PR.

---

## 6. Git & PR Conventions

### 6.1 — Branch naming

```
phase-1/<feature>          # Phase 1 marketing site work
phase-2/<feature>          # Phase 2 platform work
fix/<short-description>    # Bug fixes (include phase if relevant)
chore/<short-description>  # Non-feature work (deps, config, docs)
```

Examples: `phase-1/contact-form`, `phase-2/booking-flow`, `fix/webhook-idempotency`, `chore/update-prisma`

---

### 6.2 — Commit message format

```
[Phase N] type: short description (imperative mood, ≤72 chars)
```

Types: `feat` · `fix` · `chore` · `docs` · `refactor` · `test`

```bash
# ✅ Examples
[Phase 1] feat: add Calendly popup widget to homepage
[Phase 2] feat: implement pre-signed S3 upload URL endpoint
[Phase 2] fix: verify Razorpay signature before status transition
[Phase 2] refactor: extract booking state machine to service layer
chore: update Prisma to 5.14
```

---

### 6.3 — PR target is always `staging`. Never open a PR directly to `main`.

**Why:** All code must pass manual testing in the staging environment before reaching production.

```
feature branch → PR to staging → manual QA → PR to main → production deploy
```

---

### 6.4 — PR checklist before requesting review

- [ ] No `console.log` statements left in
- [ ] All new environment variables added to `.env.example`
- [ ] Prisma migrations included if schema changed (`prisma/migrations/`)
- [ ] `docs/tracking/TASKS.md` updated to reflect completed work
- [ ] `docs/tracking/CHANGELOG.md` entry added for user-facing changes
- [ ] No `any` types introduced
- [ ] No secrets or `.env` files committed

---

### 6.5 — Never force-push to `staging` or `main`.

If a rebase or history rewrite is genuinely needed, discuss it first.

---

### 6.6 — One concern per commit. One concern per PR.

A PR that adds a feature AND refactors unrelated code is two PRs. Keep scope tight so rollback is clean if needed.
