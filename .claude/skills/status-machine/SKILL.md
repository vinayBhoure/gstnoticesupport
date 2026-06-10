---
name: status-machine
description: >
  Encodes the complete booking lifecycle state machine for gstnoticesupport.in —
  the six statuses, every allowed transition, who triggers each transition,
  side effects (status reflection on both dashboards, emails per matrix,
  status gates blocking actions like account deletion or document re-upload),
  and explicit forbidden transitions. Use this for any work involving booking
  status changes, status-gated actions, status displays, status filters in
  admin dashboard, cancel buttons, or anything reading or writing
  `Booking.status`. Triggers on "status", "lifecycle", "state", "transition",
  "Document Upload", "In Review", "Draft Ready", "Filing", "Complete",
  "Cancelled", "cancel booking", "status change".
---

# Booking Status Machine

## Purpose

The booking status lifecycle is the spine of the entire platform. Every status change has a defined trigger, allowed predecessor states, side effects (email + dashboard reflection), and downstream consequences (what becomes possible or blocked). This skill is the single reference for any code touching `Booking.status`.

This skill is intentionally tech-agnostic — it describes domain rules, not implementation. Backend implementers see `backend-core` + `data-and-storage` skills for the how; frontend implementers see `frontend-core`. This skill is the *what* and *why*.

**Source of truth:**
- HLD §11 (Service Status State Machine)
- KB1 §10 (State Machine), §11 (Draft & Payment Flow)
- KB1 §12 (Cancellation), §13 (Account Deletion)
- KB2 §3 (Admin actions, Mark-as-Paid impact)
- `platform_interaction_flows.md` §3 (Shared State Machine)

---

## The Six States

| State | Meaning | Active? | Terminal? |
|---|---|---|---|
| `Document Upload` | User just submitted booking, can still add documents | Yes | No |
| `In Review` | Admin has started work | Yes | No |
| `Draft Ready` | Admin has uploaded a draft PDF, user can pay or cancel | Yes | No |
| `Filing` | Payment confirmed, admin is filing on government portal | Yes | No |
| `Complete` | Admin has finished government portal work | No | Yes |
| `Cancelled` | User or admin cancelled before payment | No | Yes |

**Active states** (`Document Upload`, `In Review`, `Draft Ready`, `Filing`) block account deletion (KB1 §13).

**Terminal states** (`Complete`, `Cancelled`) allow account deletion and do not transition further.

---

## The Allowed Transitions

```
[Document Upload]
       │  (admin manually starts work)
       ▼
   [In Review]
       │  (admin uploads draft PDF — automatic on upload)
       ▼
  [Draft Ready] ──── user cancels ────► [Cancelled]
       │
       │  (payment confirmed via webhook / verify page / Mark-as-Paid)
       ▼
    [Filing]
       │  (admin marks complete — manual)
       ▼
  [Complete]
```

### Transition table

| From | To | Trigger | Type |
|---|---|---|---|
| `Document Upload` | `In Review` | Admin opens case to start work | Manual (admin) |
| `In Review` | `Draft Ready` | Admin uploads draft PDF | Automatic (on upload) |
| `Draft Ready` | `Filing` | Razorpay payment confirmed | Automatic (webhook/verify/admin override) |
| `Draft Ready` | `Cancelled` | User clicks Cancel | Manual (user) |
| `Filing` | `Complete` | Admin marks complete | Manual (admin) |

### Auto-transition vs manual

Three transitions are **automatic** — triggered by a side effect, not a direct status update:

1. `In Review → Draft Ready` happens the moment the admin's draft upload is confirmed (S3 PUT + `confirm-draft` API). No separate status-change button.
2. `Draft Ready → Filing` happens when the Razorpay webhook (or verify page, or admin Mark-as-Paid) processes a captured payment. No manual status change here.
3. `Document Upload` is the *initial* status — set automatically when the booking is created.

The other two transitions (`Document Upload → In Review`, `Filing → Complete`) are manual admin actions with explicit buttons.

---

## Forbidden Transitions (Phase 2 — Locked)

Per HLD §11.2 and KB2 §9:

- **No admin-initiated cancellation from any state.** Removed from Phase 2 scope. Deferred to future. Do not implement.
- **No cancellation from `Document Upload` or `In Review`.** User can only cancel at `Draft Ready`. This is deliberate — it deters non-serious users who would otherwise abandon mid-process.
- **No reverting from `Filing` to `Draft Ready`.** The draft is final at the moment of payment. Even if admin re-uploads at `Draft Ready` (allowed), once payment confirms and status becomes `Filing`, the draft is locked.
- **No transition to `Filing` without Razorpay confirmation.** Admin Mark-as-Paid (KB2 §8.2) is permitted but **requires Razorpay Fetch Payment API confirmation** — never a blind override.
- **No transition from `Complete` or `Cancelled`.** Terminal means terminal.

---

## Side Effects per Transition

Each transition has three side effects: dashboard reflection, emails, and downstream availability changes.

### 1. Dashboard reflection

Every status change is reflected immediately on **both** the user dashboard and the admin dashboard (HLD §11.3). There is no eventual consistency — the same query against the database returns the same status to both surfaces.

### 2. Email dispatch

Per the Notification Matrix (HLD §12.2):

| Transition | User email | Admin email |
|---|---|---|
| Booking created (sets `Document Upload`) | ✅ | ✅ |
| `Document Upload → In Review` | ✅ | — |
| `In Review → Draft Ready` (initial) | ✅ | — |
| Draft re-uploaded (stays at `Draft Ready`) | ✅ ("Draft updated") | — |
| `Draft Ready → Filing` (payment confirmed) | ✅ | ✅ |
| `Draft Ready → Cancelled` (user-initiated) | ✅ | ✅ |
| `Filing → Complete` | ✅ | — |

Emails fire from the service method that performs the transition, **inside the same transaction** as the DB update. Email failure must not roll back the transition — log and continue (see `integrations` skill).

### 3. Downstream availability

| At state | User can | User cannot | Admin can |
|---|---|---|---|
| `Document Upload` | Add/remove documents | Cancel, pay | Open to start work |
| `In Review` | View status | Cancel, pay, modify docs | Upload draft, edit notes |
| `Draft Ready` | Read notes, pay, cancel | Modify docs, view PDF | Re-upload draft, edit notes |
| `Filing` | View paid draft PDF, confirm draft | Cancel, modify anything | Mark complete |
| `Complete` | View final draft PDF | Modify anything | View only |
| `Cancelled` | View record only | Modify anything | View only |

---

## Status Gates

Certain actions are gated by status. Implement these checks in the service layer (per `backend-core` skill).

### Document upload gate

User document uploads are allowed **only** when `status === 'Document Upload'`. Re-upload during In Review or later is **not supported in Phase 2** (KB1 §9 — Re-upload / Mid-Service Document Sharing). If admin needs more documents, user does so via WhatsApp/email or by booking a fresh service.

### Draft upload gate (admin)

Admin draft upload is allowed when `status` is `In Review` or `Draft Ready`. The first upload transitions `In Review → Draft Ready`. Subsequent uploads at `Draft Ready` are re-uploads (replace the S3 object, send "Draft updated" email, status unchanged). Once status is `Filing` or beyond, draft re-upload is **blocked**.

### Payment gate

`POST /api/v1/user/bookings/:id/create-order` only succeeds when `status === 'Draft Ready'`. Other states reject with `ConflictError`.

### Cancel gate

User-initiated cancellation only allowed at `Draft Ready`. The Cancel button is hidden in the UI for other states; the backend additionally rejects with `ConflictError` to defend against direct API calls.

### Account deletion gate

User account deletion is blocked if **any** booking is in an active state (`Document Upload`, `In Review`, `Draft Ready`, `Filing`). The UI shows the delete button as disabled with a reason message (KB1 §13).

Deletion confirmation requires typing the user's own email — simple string match, no OTP, no password (KB1 §13).

### Draft viewer gate

`GET /api/v1/user/bookings/:id/draft-url` (pre-signed GET URL for the draft PDF) only succeeds when `status` is `Filing` or `Complete`. Earlier states return 403 — the PDF exists in S3 but is gated.

---

## Pre-deposit Disclosure (Services 1 & 2)

For **GSTAT Appeal** and **Commissioner Appeal**, a statutory government pre-deposit is required. This pre-deposit is paid directly by the user to the government, outside the platform — the platform does not track it.

Per HLD §10.5, pre-deposit disclosure appears at **four mandatory points**:

1. Pricing page and service cards for Services 1 and 2.
2. Booking flow Step 1 when Service 1 or 2 is selected.
3. Draft Ready email for these services (conditional block in the email template).
4. Pay-to-Unlock screen before the Razorpay modal opens.

Never state a percentage. Always reference "as per GST Act." The specific amount is communicated by the admin in booking notes per case.

---

## Concurrency & Race Conditions

KB1 §22 (Risks) notes open race conditions. Resolve them as follows:

| Race | Resolution |
|---|---|
| Admin uploads draft just as user cancels | The transaction that commits first wins. The other operation returns `ConflictError`. |
| Webhook arrives while user is on verify page | Idempotency on `payment_records.razorpay_payment_id` ensures single processing (see `integrations` skill). |
| Two webhook deliveries for same payment | Same idempotency mechanism. |
| Admin tries to mark Complete while booking is at Draft Ready | Service-layer guard rejects: only `Filing → Complete` is allowed. |

Use Prisma transactions for any read-then-write status change. Pessimistic locking is not needed at expected scale.

---

## Anti-patterns

Do not:

- Allow admin-initiated cancellation. Removed from Phase 2.
- Allow user cancellation from `Document Upload` or `In Review`.
- Implement a "revert" or "undo" button for status. Forward-only.
- Manually set status to `Draft Ready` without uploading a draft. The upload triggers the status.
- Manually set status to `Filing` without Razorpay confirmation. Never blind-override.
- Send the user email and the admin email separately if both should fire (e.g. on user cancel) — they belong to the same transaction, atomic.
- Check status gates in the controller. Service layer only.
- Show the Cancel button in the UI when status is not `Draft Ready` even though the backend would reject — UI and backend must agree.
- Use string comparison on status across the codebase. Use the Prisma-generated enum type everywhere.
- Cache the user's bookings list when status could have changed (after any action that mutates a booking, invalidate the TanStack Query cache).
- Forget the pre-deposit block in the Draft Ready email for GSTAT Appeal or Commissioner Appeal.

---

## Quick Reference

**Need to display the status somewhere:** Use a single `<StatusBadge status={...} />` component with consistent colors per state (navy/green palette, no red). Define color mapping once.

**Need to gate a UI action by status:** Compute the gate from the booking object client-side, but also enforce on the backend. Both sides must agree.

**Need to add a new status:** This is a major design change. The state machine is locked at six states. Do not add states without explicit project decision.

**Need to change the transition rules:** Same — locked. Refer back to HLD §11 before proposing changes.
