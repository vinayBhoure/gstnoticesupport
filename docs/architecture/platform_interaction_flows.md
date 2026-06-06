# gstnoticesupport.in — Platform Interaction Flows

> **Document Type:** Flow reference for LLM context  
> **Purpose:** Describes the complete user and admin journeys on the platform to enable accurate reasoning about state transitions, responsibilities, and touchpoints.  
> **Depends On:** `gstnoticesupport_HLD.md`, `gstnoticesupport_project_knowledge_base_1.md`

---

## Overview

The platform has two actors: **User** (client seeking GST litigation help) and **Admin** (the CA firm operating the platform). Their flows are tightly coupled — every user action triggers an admin notification and vice versa. The central mechanic is a **draft-gated payment model**: the admin prepares a draft reply, the user pays to unlock it, and the admin then files it on the government portal.

---

## 1. User Flow

### Phase 1 — Discovery

| Step | Action | Notes |
|---|---|---|
| 1 | Visit public website | SEO/AI-driven or direct |
| 2 | Choose action | "Request Callback" → Calendly call, OR "Book Service" → direct to auth |
| 2a | *(Callback path)* Book Calendly consultation | Admin reaches out; invite link sent after call |
| 2b | *(Direct path)* Proceed to sign up | No auto-account from Calendly |

### Phase 2 — Authentication

| Step | Action | Notes |
|---|---|---|
| 3 | Sign up or log in | Email-only accounts |
| 4 | OTP email verification | Required to activate account |
| 5 | Land on user dashboard | Services table visible |

### Phase 3 — Booking

| Step | Action | Notes |
|---|---|---|
| 6 | Click "Book Service" | Initiates multi-step booking flow |
| 7 | Step 1 — Select service | Choose from: ASMT-10 Reply, SCN Reply, Commissioner Appeal, GSTAT Appeal |
| 8 | Step 2 — Fill personal info | Name, email, contact, GSTN, org name, filing for (self/client) — re-entered every booking, no pre-fill |
| 9 | Step 3 — Upload documents | PDF only · max 8 files · 5 MB per file · 40 MB total |
| 10 | Submit booking | Status auto-set to `Document Upload` · email sent to user + admin |

### Phase 4 — Case Tracking (passive)

| Step | Action | Notes |
|---|---|---|
| 11 | Monitor status in dashboard | Statuses: Document Upload → In Review → Draft Ready |
| 12 | Receive email on each status change | Automated via Resend |

### Phase 5 — Draft Ready Decision

| Step | Action | Notes |
|---|---|---|
| 13 | Open service detail page | See locked draft placeholder + admin notes/summary (readable text) |
| 14a | **Pay to Unlock** | Razorpay modal opens → payment → status auto → `Filing` → draft PDF unlocked |
| 14b | **Cancel Service** | Confirmation dialog → status → `Cancelled` · email to user + admin · can re-book |

### Phase 6 — Post-Payment Completion

| Step | Action | Notes |
|---|---|---|
| 15 | View/download draft PDF | Opens on a separate page (`/dashboard/services/[id]/draft`) · pre-signed S3 URL valid 15 min |
| 16 | Click "Confirm Draft" | Notifies admin via email |
| 17 | Receive completion email | Admin marks service `Complete` after portal filing |

---

### User Flow — State Machine (text)

```
[Visit Website]
     │
     ├── Request Callback → Calendly → Invite Link → [Sign Up]
     │
     └── Book Service → [Sign Up / Log In]
                              │
                        [Dashboard]
                              │
                      [Booking — 3 steps]
                              │
                   [Document Upload — status]
                              │
                      [In Review — status]
                              │
                     [Draft Ready — status]
                         /         \
                   Cancel          Pay to Unlock
                     │                   │
               [Cancelled]          [Filing — status]
                                         │
                                  [View Draft PDF]
                                         │
                                  [Confirm Draft]
                                         │
                                  [Complete — status]
```

---

### User Cancellation Rules

- Cancellation is **only allowed at `Draft Ready` stage** (before payment).
- NOT allowed at `Document Upload` or `In Review`.
- Post-cancellation: booking remains visible in services table; user can re-book immediately.

### Account Deletion Rules

- Allowed only if: no bookings ever made, OR all bookings are `Complete`/`Cancelled`.
- Blocked if any booking is in an active state.
- Confirmation requires typing own email address (string match — no OTP or password re-entry).

---

## 2. Admin Flow

### Phase 1 — Access

| Step | Action | Notes |
|---|---|---|
| 1 | Receive new booking email | Triggered automatically on user submission |
| 2 | Log in to admin panel | Role = `admin`, assigned directly via DB — no self-registration |
| 3 | View Bookings List | Master table of all bookings · filter/sort by status |

### Phase 2 — Case Review

| Step | Action | Notes |
|---|---|---|
| 4 | Open Booking Detail page | View user's personal info submitted at booking |
| 5 | Download user-uploaded documents | Each doc downloadable individually |
| 6 | Set status → `In Review` | **Manual action** · triggers email to user |

### Phase 3 — Draft Preparation

| Step | Action | Notes |
|---|---|---|
| 7 | Prepare draft offline | Done entirely outside the platform (CA's own tools) |
| 8 | Upload draft PDF + add notes/summary | PDF only · notes are visible to user on their service detail page |
| 9 | Status auto-set → `Draft Ready` | Triggered automatically on draft upload · email to user |
| 9a | *(Optional)* Re-upload draft | Admin can replace draft before user pays · email sent to user · status stays `Draft Ready` |

### Phase 4 — Post-Payment Actions

| Step | Action | Notes |
|---|---|---|
| 10 | Receive payment confirmation email | Triggered by Razorpay webhook · status auto → `Filing` |
| 11 | Receive "User confirmed draft" email | Triggered when user clicks "Confirm Draft" |

### Phase 5 — Filing & Completion

| Step | Action | Notes |
|---|---|---|
| 12 | File response on government portal | Done entirely outside the platform |
| 13 | Set status → `Complete` | **Manual action** · triggers email to user |

---

### Admin Flow — State Machine (text)

```
[New Booking Email Received]
          │
    [Log In → Bookings List]
          │
    [Open Booking Detail]
    [Download Documents]
          │
    [Set → In Review]  ◄── Manual
          │
    [Prepare Draft Offline]  ◄── Off-platform
          │
    [Upload Draft PDF + Notes]
          │
    [Auto → Draft Ready]  ◄── System
          │
    [Await User Decision]
         / \
      Cancel  Payment Confirmed (webhook)
        │               │
  [Cancelled]     [Auto → Filing]
                        │
               [User Confirms Draft]
                        │
               [File on Govt Portal]  ◄── Off-platform
                        │
               [Set → Complete]  ◄── Manual
```

---

### Admin Cancellation Rules

- Admin can cancel **at any stage** (unlike users, who can only cancel at `Draft Ready`).
- Cancellation always triggers an email to the user.
- Admin cannot: send in-platform messages, edit user data or uploaded docs, add sub-admins.

### Admin — What Cannot Be Done on Platform

| Action | Available |
|---|---|
| Send messages to user inside platform | ❌ — use WhatsApp/email |
| Edit user's submitted booking data | ❌ |
| Modify or delete user's uploaded documents | ❌ — download only |
| Add additional admin accounts | ❌ |
| Re-upload draft after payment | ❌ — draft is final at payment |
| Perform government portal filing | ❌ — fully off-platform |

---

## 3. Shared State Machine — Full Service Lifecycle

```
[Document Upload]
       │  admin starts work (manual)
       ▼
   [In Review]
       │  admin uploads draft PDF (triggers auto)
       ▼
  [Draft Ready] ──── user or admin cancels ────► [Cancelled]
       │
       │  user pays via Razorpay → webhook fires (auto)
       ▼
    [Filing]
       │  admin completes govt portal work → marks done (manual)
       ▼
  [Complete]
```

**Terminal states:** `Complete`, `Cancelled`  
**Active states (block account deletion):** `Document Upload`, `In Review`, `Draft Ready`, `Filing`

---

## 4. Notification Matrix (Email via Resend)

| Event | User notified | Admin notified |
|---|---|---|
| Booking submitted | ✅ | ✅ |
| Status → In Review | ✅ | ❌ |
| Status → Draft Ready | ✅ | ❌ |
| Draft re-uploaded by admin | ✅ | ❌ |
| Payment confirmed (Filing) | ✅ | ✅ |
| User cancels service | ✅ | ✅ |
| Admin cancels service | ✅ | ❌ |
| User confirms draft | ❌ | ✅ |
| Status → Complete | ✅ | ❌ |

---

## 5. Key Design Principles

1. **Draft-gated payment:** The user never pays before seeing proof of work. Admin notes summarise the draft; the PDF is locked until payment. This is the core trust mechanism.
2. **Consultation-first intake:** High-value services are gated behind a phone call, not open self-serve. This trades conversion speed for lead quality.
3. **Two-stage commitment:** Booking (free) → Payment (at Draft Ready). The booking signals intent; payment signals commitment.
4. **Off-platform filing:** The platform manages the document/draft workflow only. Actual government portal filing is fully manual and outside the system.
5. **Email-only communication:** No in-platform messaging. All admin↔user communication outside of status updates happens via WhatsApp or email.
