---
name: context
description: >
  Orients any Claude Code session for gstnoticesupport.in — loads the full
  project context, explains a specific platform flow end-to-end, or evaluates
  whether a feature idea is in scope for Phase 1 or Phase 2. Use at the start
  of every new session, when switching between client and server work, or
  when validating a proposed change against the locked architecture.
  Usage: /context [focus]
  Focus options: (blank = full summary) | flow:<name> | scope:<feature>
  Examples:
    /context
    /context flow:payment
    /context flow:auth
    /context flow:file-upload
    /context flow:booking
    /context flow:status-change
    /context scope:"add WhatsApp notifications"
    /context scope:"allow user to re-upload documents"
---

# /context

Project orientation command for gstnoticesupport.in. Every Claude Code
session should start here — it loads the minimum context needed to make
correct decisions without re-reading all six skills from scratch.

---

## Mode: full summary (no argument)

Print the following sections in order. Keep each section concise —
this is a fast-load summary, not a re-read of the HLD.

---

### Project identity

```
Project : gstnoticesupport.in
Client  : Vishal Srivastava, Jabalpur, MP
Dev     : Vinay Bhoure
Status  : Phase 1 target June 15 / Phase 2 target July 5, 2026
Domain  : gstnoticesupport.in (FE) + api.gstnoticesupport.in (BE)
```

---

### What this platform does

A GST litigation services platform. Users book one of four services
(GSTAT Appeal ₹14,999 / Commissioner Appeal ₹9,999 / SCN Reply ₹5,999 /
ASMT-10 Reply ₹2,999), upload documents, and the admin prepares a draft.
The draft is locked behind payment — users see admin notes and a blocked
placeholder, then pay via Razorpay to unlock the PDF. Admin then files
on the government portal off-platform.

---

### Locked stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind |
| Backend | Node.js + Express.js + TypeScript |
| Database | PostgreSQL on NeonDB + Prisma ORM |
| Auth | JWT in HTTP-only cookies |
| Validation | Zod (shared FE + BE) |
| File storage | AWS S3 (private, Mumbai) |
| Payments | Razorpay (Orders API + webhook) |
| Email | Resend (transactional) |
| FE hosting | Vercel |
| BE hosting | Render or Railway |

---

### Folder structure

```
project-root/
  .claude/
    skills/      ← 6 master skills
    commands/    ← 9 commands
    rules/
      CLAUDE.md
  client/        ← Next.js (independent package.json)
  server/        ← Express.js (independent package.json)
  docs/
    architecture/   ← HLD, LLD, KB1, KB2
    tracking/       ← tasks.md, decisions.md, CHANGELOG.md, open-questions.md
    ui-ux/
  resources/
    ui/             ← HTML/CSS/JS design references
```

---

### The 6 master skills (when each applies)

| Skill | Load when working on |
|---|---|
| `backend-core` | Any Express route, controller, service, Zod schema, error handling |
| `auth-and-security` | Auth endpoints, JWT/cookies, CORS, env config, password/OTP |
| `data-and-storage` | Prisma models, migrations, S3 uploads, file handling, repositories |
| `integrations` | Razorpay, Resend, webhook, email templates, notification matrix |
| `frontend-core` | Next.js pages, Server/Client Components, forms, TanStack Query, SEO |
| `status-machine` | Booking status transitions, status-gated actions, anywhere touching `Booking.status` |

---

### Phase 1 scope (June 15)

Marketing website only. No authentication, no booking flow, no payment.
Public pages: homepage, service pages, pricing, about, contact, FAQ,
T&C, privacy. Calendly popup for demo booking. Contact Us form → Resend
email to admin. WhatsApp redirect button. All built with SSG.

---

### Phase 2 scope (July 5)

Full platform on top of Phase 1. User signup (OTP via Resend), 4 bookable
services, document upload to S3, admin dashboard, draft upload, Razorpay
payment, webhook three-layer reliability, draft PDF delivery via signed
URLs, booking status machine, notification emails for all lifecycle events.

---

### Current open tasks

Read `docs/tracking/tasks.md` and print:
- Count of open p1 tasks per phase
- Any blocked tasks with their blocking question number
- The branch currently checked out (from `git branch --show-current`)

If `docs/tracking/tasks.md` does not exist, print:
```
No task board found. Run `/task add` to create the first task.
```

---

### Recent decisions

Read `docs/tracking/decisions.md` and print the last 3 entries.
If the file does not exist, skip this section.

---

## Mode: `flow:<name>`

Explains a specific platform flow end-to-end across both client and server.

Available flows and what each covers:

---

### `flow:auth`

Step-by-step: Signup → OTP verify → Profile completion → Login → Logout →
Forgot password → Reset password.

For each step: which page/endpoint is involved, what the JWT/cookie state
is at that point, which emails fire, what error states exist.

Reference: `auth-and-security` skill §OTP Flow, HLD §8.

---

### `flow:booking`

Step-by-step: User clicks "Book Service" → Multi-step booking form (3 steps)
→ Document upload → Submission → `Document Upload` status set → Emails to
user and admin.

For each step: which page, which API endpoint, what Zod schema validates,
what DB write happens, what email fires.

Reference: `status-machine` skill, `data-and-storage` skill, KB1 §9.

---

### `flow:file-upload`

Step-by-step: User selects PDF → Frontend sends metadata to backend →
Backend validates (size, count, type, booking state) → Backend generates
pre-signed PUT URL → Frontend uploads directly to S3 → Frontend confirms
with backend → Backend creates `BookingDocument` row.

Include: file constraints table, what happens when each constraint is violated,
why files never pass through Express.

Reference: `data-and-storage` skill §File Upload Flow, HLD §9.2.

---

### `flow:payment`

Step-by-step: User at `Draft Ready` → "Pay to Unlock" → Backend creates
Razorpay Order → Frontend opens Razorpay modal → Payment → Three-layer
reliability (webhook L1, verify page L2, Mark-as-Paid L3) → Booking
transitions to `Filing` → Draft PDF unlocked.

Include: what each layer does, what happens when each layer fails, the
idempotency mechanism, the four verify-page outcomes, the pre-deposit
disclosure requirement for Services 1 and 2.

Reference: `integrations` skill §Razorpay, `status-machine` skill,
HLD §10, KB2 §5.

---

### `flow:status-change`

Walk through every state transition in the booking lifecycle with the
trigger, who initiates it, what the auto vs manual distinction is, which
emails fire, and what becomes available or blocked after each transition.

Include the forbidden transitions and why each is locked.

Reference: `status-machine` skill (full document), HLD §11.

---

### `flow:draft-delivery`

Step-by-step: Admin uploads draft PDF → Backend generates pre-signed PUT
URL → Admin uploads to S3 → Backend sets `draft_s3_key`, auto-transitions
to `Draft Ready`, sends email → User at `Filing` navigates to `/draft` page
→ Server Component requests pre-signed GET URL → URL valid 15 minutes →
User views/downloads.

Include: re-upload behaviour at `Draft Ready`, why re-upload is locked at
`Filing`, the rate limit on draft-url endpoint.

Reference: `data-and-storage` skill §Draft Delivery, `status-machine` skill,
HLD §9.4.

---

## Mode: `scope:<feature>`

Evaluates whether a described feature belongs in Phase 1, Phase 2, or is
explicitly out of scope.

### Steps

1. Read the feature description from the argument.
2. Check it against three sources in order:
   - HLD §19 (Out of Scope list) — if it's there, it's deferred
   - KB1 §3 (Phase 1 vs Phase 2 boundaries)
   - The locked decisions in KB2 and `docs/tracking/decisions.md`
3. Return one of four verdicts:

**In scope — Phase 1:**
The feature is part of the marketing site scope. It should be built
before June 15.

**In scope — Phase 2:**
The feature is part of the platform scope. It should be built before July 5.

**Explicitly out of scope (deferred):**
The feature appears in HLD §19. Quote the exact entry and the reason it
was deferred. Do not build it without an explicit client decision.

**Not addressed — needs decision:**
The feature is not in any document. Recommend `/log question` to record
it as an open question before building.

**Example:**
```
/context scope:"let users re-upload documents after booking is submitted"
```

Output:
```
Verdict: Explicitly out of scope (deferred to future phase)

HLD §19: "Mid-service document re-upload by user — Must create new
booking or share externally"

This was deliberately excluded from Phase 2 because it adds complexity
to the status machine (re-upload must be locked during In Review and
beyond) and the admin workflow.

If the client has requested this, log it as a decision change:
  /log decision "mid-service re-upload now in scope for Phase 2"
and update HLD §19 accordingly before building.
```
