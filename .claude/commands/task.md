---
name: task
description: >
  Manages the development task list for gstnoticesupport.in in
  docs/tracking/tasks.md — adding new tasks with phase, layer, and
  priority metadata, and listing tasks filtered by any combination
  of those dimensions. Tasks are the bridge between the project timeline
  (KB1 §1 — Phase 1 by June 15, Phase 2 by July 5) and the day-to-day
  work tracked in Git branches and changelogs.
  Usage: /task <action> [args]
  Actions: add | list
  Examples:
    /task add "implement Razorpay webhook handler" --phase p2 --layer server --priority p1
    /task list --phase p2 --priority p1
    /task list --layer server
    /task list
---

# /task

Manages `docs/tracking/tasks.md` — the living task board for
gstnoticesupport.in. Lightweight by design: no external tools, no
dependencies, just a structured markdown file that Claude Code and the
developer can both read and write.

---

## File header (if creating new)

```markdown
# Task Board

> Development tasks for gstnoticesupport.in.
> Phases: p1 (Phase 1 — marketing site, launch June 15)
>         p2 (Phase 2 — full platform, launch July 5)
>         shared (both phases / infrastructure)
> Layers: server | client | both
> Priority: p1 (launch blocker) | p2 (important, not blocking) | p3 (nice to have)
> Status: todo | in-progress | done | blocked

---
```

---

## Task schema

Each task is one markdown block:

```markdown
### T<N> — <title>

| Field | Value |
|---|---|
| Phase | p1 / p2 / shared |
| Layer | server / client / both |
| Priority | p1 / p2 / p3 |
| Status | todo / in-progress / done / blocked |
| Branch | `<branch-name>` (set when work starts) |
| Added | YYYY-MM-DD |
| Completed | YYYY-MM-DD (set when done) |

**Description:** <1–3 sentences of what needs to be built and why.
Reference the HLD section or skill if relevant.>

**Blocked by:** <O<N> open question or T<N> dependency — omit if not blocked>
```

---

## Action: `add`

### Steps

1. Parse the task title from the argument.
2. If `--phase`, `--layer`, `--priority` flags are not provided, infer them
   from the title using this logic:
   - If the title mentions routes, controllers, services, Prisma, S3, Razorpay,
     Resend, webhook → `layer: server`
   - If the title mentions page, component, form, SEO, metadata, Tailwind → `layer: client`
   - If the title mentions both sides or config/infra → `layer: both`
   - If the title mentions anything in Phase 1 scope (marketing site, Calendly,
     contact form, public pages) → `phase: p1`
   - If the title mentions anything in Phase 2 scope (auth, booking, payment,
     dashboard, admin, S3 docs) → `phase: p2`
   - Priority defaults to `p2` unless the task is explicitly a launch blocker

3. Assign the next sequential task number (T1, T2, T3...).
4. Generate the task block.
5. Append to `docs/tracking/tasks.md`.
6. Print the added task and its assigned number.

**Example:**
```
/task add "implement Razorpay webhook idempotency check"
```

Inferred: phase = p2 (Razorpay = Phase 2), layer = server, priority = p1
(payment reliability is a launch blocker).

```markdown
### T14 — Implement Razorpay webhook idempotency check

| Field | Value |
|---|---|
| Phase | p2 |
| Layer | server |
| Priority | p1 |
| Status | todo |
| Branch | — |
| Added | 2026-06-10 |
| Completed | — |

**Description:** Add unique constraint on `payment_records.razorpay_payment_id`
and check for existing record before processing webhook. Prevents double-billing
and double-emails on webhook retries. Reference: `integrations` skill
(Three-Layer Reliability), HLD §10.
```

---

## Action: `list`

### Steps

1. Read `docs/tracking/tasks.md`.
2. Apply filters from flags:
   - `--phase p1 / p2 / shared` — show only tasks for that phase
   - `--layer server / client / both` — show only tasks for that layer
   - `--priority p1 / p2 / p3` — show only tasks at that priority
   - `--status todo / in-progress / done / blocked` — show only tasks at that status
   - No flags → show all non-done tasks grouped by priority

3. Output format:

```
Open tasks — Phase 2, Server layer
─────────────────────────────────────────────────

P1 (Launch blockers)
  T14  Implement Razorpay webhook idempotency check         [todo]
  T08  Wire authMiddleware to all user routes               [in-progress]  feature/p2/auth-middleware

P2 (Important)
  T21  Add bookings list pagination to admin dashboard      [todo]
  T19  Write Draft Ready email template                     [todo]

P3 (Nice to have)
  T23  Add CSV export to admin overview page                [todo]

Blocked
  T17  Implement admin notes rich text editor               [blocked → O11: admin notes format]

─────────────────────────────────────────────────
Total: 6 open  (3 × p1, 2 × p2, 1 × p3)  |  1 blocked
```

4. If `--status todo` or no status filter is applied and there are blocked tasks:
   print a notice at the bottom:

   ```
   ⚑ Blocked tasks have unresolved open questions.
     Run `/log question` to add context or `/context` to review open questions.
   ```

5. If `--phase p1` is used and today's date is within 7 days of June 15, 2026
   (Phase 1 launch target), add a header:

   ```
   ⚑ Phase 1 launch target: June 15, 2026
     P1 priority tasks remaining: <count>
   ```

   Same logic for Phase 2 and July 5, 2026.
