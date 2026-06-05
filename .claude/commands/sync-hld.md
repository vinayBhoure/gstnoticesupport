---
name: sync-hld
description: >
  Detects drift between the gstnoticesupport.in codebase and the locked HLD/KB
  documentation — routes that exist in code but not in the HLD, status
  transitions that differ from the state machine spec, Prisma models that
  have drifted from the data model description, env vars that changed, or
  decisions in docs/tracking/decisions.md that contradict HLD locked decisions.
  Run when the codebase has grown ahead of the docs, after a significant
  feature is completed, or before a phase launch.
  Usage: /sync-hld [section]
  Sections: (blank = full audit) | routes | status | models | decisions | env
  Examples:
    /sync-hld
    /sync-hld routes
    /sync-hld status
    /sync-hld decisions
---

# /sync-hld

Audits the gap between what the HLD/KB documents say and what the codebase
actually does. The HLD is the source of truth — drift means either the code
is wrong, or the HLD needs updating (because a locked decision changed).
This command surfaces both.

---

## Section: `routes`

**What to check:** Every Express route registered in `server/src/routes/`
against the API surface documented in the HLD.

### Step 1 — Extract routes from code

Read all files in `server/src/routes/`. For each file, extract:
- HTTP method
- Full path (including the base prefix from `index.ts`)
- Auth level (public / user / admin — from the middleware chain)

### Step 2 — Extract routes from HLD

The HLD documents the API surface in:
- HLD §6.1 (structure)
- HLD §8 (auth endpoints)
- HLD §9 (file upload endpoints)
- HLD §10 (payment endpoints)
- LLD (full endpoint catalog if available)

### Step 3 — Compare and report

Flag three categories:

**In code, not in HLD:**
These may be new endpoints added during development that the HLD has not
caught up to. For each: print the route, ask whether it should be added
to the HLD or whether it was added in error.

**In HLD, not in code:**
These are endpoints that were specified but not yet built. For each:
print the HLD reference and note whether it is Phase 1 or Phase 2 scope.

**In both but with differences:**
Path has changed, auth level differs, method changed. For each: print
the HLD spec and the actual code and ask which is correct.

---

## Section: `status`

**What to check:** The booking status transition logic in
`server/src/services/booking.service.ts` (or equivalent) against the
state machine locked in the `status-machine` skill and HLD §11.

### Check each transition

For every state transition in the locked spec:

| Transition | HLD says | Code says | Drift? |
|---|---|---|---|
| `Document Upload → In Review` | Manual, admin | | |
| `In Review → Draft Ready` | Auto on draft upload | | |
| `Draft Ready → Filing` | Auto on payment confirmed | | |
| `Draft Ready → Cancelled` | Manual, user only | | |
| `Filing → Complete` | Manual, admin | | |
| Any state → `Cancelled` (admin) | **Forbidden in Phase 2** | | |

Also check:
- [ ] Is there any code path that transitions `Filing → Draft Ready`? (forbidden)
- [ ] Is there any code path that allows cancellation from `Document Upload` or `In Review`? (forbidden)
- [ ] Is admin-initiated cancellation implemented? (must NOT be — removed from Phase 2)

---

## Section: `models`

**What to check:** The Prisma schema in `server/prisma/schema.prisma`
against the data model in HLD §7.

### Step 1 — Extract entities from schema

List all models in the Prisma schema with their field names and types.

### Step 2 — Compare against HLD §7

HLD §7 specifies six core entities:
`User`, `Booking`, `BookingDocument`, `Draft`, `PaymentRecord`, `OtpCode`

For each entity, check:

**Missing entity:** A model exists in code but has no HLD §7 equivalent.
May be a legitimate new model — flag for documentation update.

**Missing model:** HLD §7 mentions an entity not yet in the schema.
Flag as unbuilt.

**Field drift:** Key fields that HLD §7 explicitly mentions are missing
from the Prisma model, or their types differ significantly. Examples:
- `Booking.status` should be an enum matching the six locked states
- `PaymentRecord.razorpayPaymentId` should have `@unique` (idempotency)
- `User.deletedAt` should be `DateTime?` (soft delete)

---

## Section: `decisions`

**What to check:** Entries in `docs/tracking/decisions.md` that may
contradict or supersede locked HLD/KB decisions.

### Steps

1. Read `docs/tracking/decisions.md`.
2. For each decision entry (D59 onward), check whether it conflicts with
   any locked decision in HLD Appendix §22 or KB2 §11.
3. Flag conflicts:

```
Decision D61 (decisions.md): "Admin can cancel bookings from any state"
Conflicts with: KB2 §9 "Admin-initiated cancellation deferred to future scope"

Resolution needed: Either D61 is an intentional scope change (update KB2
and HLD §19 to remove this from out-of-scope) or D61 was logged in error.
```

4. Flag decisions that reference HLD sections that no longer exist or
   have been renumbered.

---

## Section: `env`

**What to check:** The env vars actually used in `server/src/config/env.ts`
and `client/.env.local` (or `.env.example`) against the locked list in the
`auth-and-security` skill.

### Check 1 — Missing required vars

Any var in the locked list (auth-and-security skill §Backend env vars,
§Frontend env vars) that is not present in `config/env.ts` or the env
example file.

### Check 2 — Extra vars

Any var present in the code that is not in the locked list. May be a
legitimate addition — flag for documentation update.

### Check 3 — Exposure risk

Any var without `NEXT_PUBLIC_` prefix that is imported in a Client
Component or passed to the browser. This would expose a backend secret.

---

## Full audit output format

Run all sections. For each section, print a header and the findings:

```
/sync-hld — full audit
═══════════════════════════════════════════════

ROUTES
  ✓ All 12 HLD-documented routes present in code
  ⚑ 2 routes in code not in HLD:
    POST /api/v1/user/bookings/:id/confirm-draft  (add to HLD §10?)
    GET  /api/v1/user/profile                     (add to HLD §8?)

STATUS MACHINE
  ✓ All 5 allowed transitions implemented
  ✓ Forbidden transitions blocked
  ✗ Admin cancellation found in services/booking.service.ts line 87
    This was explicitly removed from Phase 2 scope (KB2 §9).
    Remove or flag with a TODO noting it is future scope.

MODELS
  ✓ All 6 HLD entities present in schema
  ⚑ PaymentRecord.razorpayPaymentId missing @unique constraint
    This is the idempotency key — must be unique (integrations skill §Idempotency)

DECISIONS
  ✓ No conflicts between decisions.md and HLD locked decisions

ENV
  ✓ All required backend vars present in config/env.ts
  ⚑ SENTRY_DSN not in env.ts — required before production launch (HLD §17.2)

═══════════════════════════════════════════════
Summary: 2 errors (must fix), 3 warnings (should document)
```

Classify as **error** anything that contradicts a locked decision or would
cause a runtime bug. Classify as **warning** anything that is undocumented
but may be intentional.
