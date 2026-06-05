---
name: scaffold
description: >
  Scaffolds any new artifact in the gstnoticesupport.in project — Express
  endpoint, Next.js page, Prisma model, Resend email template, or React
  component. Reads the artifact type from the argument, loads the correct
  skill conventions, and generates all related files together in one pass.
  Usage: /scaffold <type> <name>
  Types: endpoint | page | model | email | component
  Examples:
    /scaffold endpoint POST /admin/bookings/:id/mark-complete
    /scaffold page dashboard/payments
    /scaffold model BookingDocument
    /scaffold email draft-ready
    /scaffold component BookingStatusBadge
---

# /scaffold

Generates a complete, convention-compliant artifact for the gstnoticesupport.in
project. Never generates a partial stub — every scaffold produces all the files
that artifact requires to function.

---

## Step 1 — Parse the argument

Extract two things from the input:
- **type**: one of `endpoint`, `page`, `model`, `email`, `component`
- **name/description**: what the artifact is

If the type is missing or ambiguous, ask once before proceeding.

---

## Step 2 — Load the relevant skill

| Type | Primary skill | Supporting skills |
|---|---|---|
| `endpoint` | `backend-core` | `auth-and-security` (if auth-gated), `data-and-storage` (if DB/S3), `integrations` (if payment/email) |
| `page` | `frontend-core` | `status-machine` (if booking-related) |
| `model` | `data-and-storage` | `backend-core` (for companion repository) |
| `email` | `integrations` | `status-machine` (to verify event is in notification matrix) |
| `component` | `frontend-core` | `status-machine` (if rendering booking status) |

Apply the locked conventions from those skills. Do not invent conventions.

---

## Step 3 — Scaffold by type

### `endpoint`

Generate all four layers together. Never generate just a route without the rest.

**Files to generate:**

1. **Route entry** in `server/src/routes/<domain>.routes.ts`
   - Correct surface prefix (`/api/v1/public/`, `/api/v1/user/`, `/api/v1/admin/`)
   - Middleware chain: `rateLimit?` → `authMiddleware?` → `adminGuard?` → `validateBody(schema)` → `controller.method`
   - No middleware applied that is not needed

2. **Zod schema** in `server/src/schemas/<domain>.schema.ts`
   - Named `<Action><Entity>Schema`
   - Exports the inferred TypeScript type
   - Uses `.strict()` on object schemas
   - Reuses primitives from `schemas/common.ts` where applicable

3. **Controller method** in `server/src/controllers/<domain>.controller.ts`
   - Reads from `req.validated` — never from raw `req.body`
   - Calls the service, returns `{ success: true, data: ... }`
   - Throws typed errors — never returns error responses directly
   - Wrapped with `asyncHandler`

4. **Service method** in `server/src/services/<domain>.service.ts`
   - Business logic only — no HTTP concerns
   - Ownership check if user-scoped
   - Status gate check if booking-related (reference `status-machine` skill)
   - Calls repository or external lib as needed

5. **Repository method** (if DB access) in `server/src/repositories/<domain>.repository.ts`
   - Includes ownership filter: `WHERE userId = requesterId` unless admin
   - Uses the shared `prisma` instance from `lib/prisma.ts`

**Print a summary** of what was generated and which middleware was applied and why.

---

### `page`

**Determine rendering strategy first** (from `frontend-core` skill):
- Route group `(public)` → SSG
- Route group `(auth)`, `(dashboard)`, `(admin)` → SSR

**Files to generate:**

1. **Page file** in `client/app/<route-group>/<path>/page.tsx`
   - Correct rendering export (`export const dynamic`, `export const revalidate`, or none for SSG)
   - Server Component by default
   - JWT cookie forwarding if auth-gated (`cookies()` from `next/headers`)
   - `fetch()` to the backend with `cache: 'no-store'` for dashboard/admin
   - TypeScript return type

2. **Metadata export** (public pages only)
   - `title` in format: `<Page Title> — GST Notice Support`
   - `description` (150–160 chars, unique)
   - `alternates.canonical` using `NEXT_PUBLIC_SITE_URL`
   - `openGraph` + `twitter` blocks

3. **Schema.org JSON-LD** (public pages only)
   - Correct schema type for the page (`Service`, `Organization`, `FAQPage`, `BreadcrumbList`)
   - Injected via `<script type="application/ld+json">`

4. **Client Component stubs** for any interactive elements the page needs
   - Marked `'use client'`
   - Placed in `client/components/<domain>/`
   - Empty placeholder with typed props — developer fills logic

**Remind** to add the route to `app/sitemap.ts` if it's a public page.

---

### `model`

**Files to generate:**

1. **Prisma model block** to append to `server/prisma/schema.prisma`
   - `id` as UUID with `@default(uuid())`
   - `createdAt DateTime @default(now())`
   - `updatedAt DateTime @updatedAt`
   - All passed fields with correct types
   - `@@index([...])` for every foreign key and hot-path filter field
   - `@@map("snake_case_table_name")` for DB naming
   - Enum references if applicable

2. **Repository file** `server/src/repositories/<entity>.repository.ts`
   - `findById(id, requesterId, isAdmin)` — includes ownership filter when not admin
   - `findAll(filters, requesterId, isAdmin)` — paginated, filtered
   - `create(data)` — returns created entity
   - `update(id, data, requesterId, isAdmin)` — ownership-gated
   - `softDelete(id, requesterId, isAdmin)` — sets `deletedAt` if the entity supports it

3. **Print migration command** to run:
   ```
   npx prisma migrate dev --name add_<entity_snake_case>
   ```
   Do not run it — print it for the developer to execute and verify.

---

### `email`

**Before generating**, verify the event exists in the Notification Matrix
(`integrations` skill §Notification Matrix). If the event is not in the matrix,
flag it as a new addition and ask the developer to confirm.

**Files to generate:**

1. **Template component** in `server/src/lib/email/templates/<event-name>.email.tsx`
   - Named `<EventName>Email`
   - Typed props interface: `<EventName>EmailProps`
   - Navy + green + neutral palette only — no red, no neon
   - If the event is for `Draft Ready` on GSTAT Appeal or Commissioner Appeal:
     include the pre-deposit disclosure conditional block
   - Basic HTML structure acceptable for Phase 2 — no complex layout library

2. **Service method** in `server/src/services/notification.service.ts`
   - Named `send<EventName>`
   - Accepts typed props
   - Calls `resend.emails.send({ from, to, subject, html })`
   - Fire-and-forget pattern (try/catch, log on failure, do not throw)
   - Exception: OTP emails are synchronous — they throw on failure

3. **Print** which existing service method should call the new notification
   method and at which point in its execution.

---

### `component`

**Determine Server vs Client first:**
- No interactivity, no browser APIs, no state → Server Component
- Form, dialog, button handler, upload, Razorpay trigger → Client Component

**Files to generate:**

1. **Component file** in `client/components/<domain>/<ComponentName>.tsx`
   - `'use client'` directive if Client Component
   - TypeScript props interface: `<ComponentName>Props`
   - Tailwind classes only — navy/green/neutral palette
   - Lucide React icons (outline only, tree-shaken import)
   - If the component renders booking status: use the `BookingStatus` enum,
     never hardcode status strings

2. **Barrel export** — append to `client/components/<domain>/index.ts`

---

## Step 4 — Print a file tree of what was generated

After generating all files, print a compact tree showing every file created
or modified, and which skill conventions were applied.

```
Generated:
  server/src/routes/admin.routes.ts         (modified — added route entry)
  server/src/schemas/booking.schema.ts      (modified — added MarkCompleteSchema)
  server/src/controllers/booking.controller.ts  (modified — added markComplete)
  server/src/services/booking.service.ts    (modified — added markComplete)
  server/src/repositories/booking.repository.ts (modified — added findByIdAdmin)

Skills applied: backend-core, status-machine
Middleware: authMiddleware + adminGuard (admin surface)
Status gate: Filing → Complete transition checked in service
```
