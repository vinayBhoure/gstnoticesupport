---
name: log
description: >
  Writes structured entries to the docs/tracking/ directory for
  gstnoticesupport.in — architectural decisions, changelog entries,
  and open questions. Each entry type follows a locked format consistent
  with the existing KB1/KB2 decision log and HLD open-gaps structure.
  Keeps project memory current as the codebase evolves beyond the
  initial documentation.
  Usage: /log <type> [description]
  Types: decision | change | question
  Examples:
    /log decision "soft-delete users on account deletion, retain S3 docs for 90 days"
    /log change "added admin Mark-as-Paid endpoint"
    /log question "should admin notes support markdown or plain text only?"
---

# /log

Maintains structured project memory in `docs/tracking/`. Every significant
decision, change, or unresolved question gets logged so future Claude sessions,
new engineers, and the developer themselves can reconstruct why things are
the way they are.

---

## Step 1 — Determine the target file

| Type | File | Format |
|---|---|---|
| `decision` | `docs/tracking/decisions.md` | Decision log table (mirrors KB1/KB2 format) |
| `change` | `docs/tracking/CHANGELOG.md` | Keep a Changelog format |
| `question` | `docs/tracking/open-questions.md` | Open questions list (mirrors KB1 §20 format) |

If the file does not exist yet, create it with the correct header before
appending the entry.

---

## Type: `decision`

### When to use

An architectural or product decision was made that is not yet documented
in the HLD or knowledge bases. This includes: resolving an open question,
choosing between two implementation approaches, scope changes, locked
conventions that emerged during build.

### File header (if creating new)

```markdown
# Decision Log

> Tracks architectural and product decisions made during development.
> Supplements KB1, KB2, and HLD. Where this document conflicts with
> HLD/KB, HLD/KB takes precedence unless the decision here explicitly
> supersedes it (note that in the rationale).

---
```

### Entry format

Assign the next sequential decision number continuing from where KB2 left off
(last entry in KB2 is D58 — start at D59).

```markdown
| D<N> | <Decision — one sentence, specific and actionable> | <Rationale — why this was chosen over alternatives> | <Date YYYY-MM-DD> |
```

Append to the decisions table in `docs/tracking/decisions.md`.

**Before appending**, check if a similar decision already exists in KB1, KB2,
or HLD. If it does, note the existing reference rather than duplicating.

**Example entry:**
```markdown
| D59 | User records are soft-deleted on account deletion; S3 documents retained for 90 days then purged via lifecycle rule | Legal/audit requirement; hard delete creates unrecoverable data loss risk | 2026-06-10 |
```

---

## Type: `change`

### When to use

A user-facing or API-visible change was shipped: new feature, bug fix,
behaviour change, deprecation, security patch. NOT for internal refactors
or chores (those go in commit history only).

### File header (if creating new)

```markdown
# Changelog

All notable changes to gstnoticesupport.in are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---
```

### Entry format

Group under the current unreleased version or the appropriate phase version.
Use the standard Keep a Changelog categories:

```markdown
## [Unreleased]

### Added
- <new feature or capability>

### Changed
- <modification to existing behaviour>

### Fixed
- <bug that was resolved>

### Removed
- <feature or behaviour that no longer exists>

### Security
- <security-relevant fix or hardening>
```

**Rules:**
- One line per change, written from the user's or developer's perspective
  (not from the file's perspective — "Added Mark-as-Paid for admin" not
  "Added markAsPaid() to BookingService")
- Link to the relevant decision log entry if the change resolves a decision
- When Phase 1 launches, move `[Unreleased]` entries under `## [1.0.0] - YYYY-MM-DD`
- When Phase 2 launches, move under `## [2.0.0] - YYYY-MM-DD`

**Example entry:**
```markdown
## [Unreleased]

### Added
- Admin can manually confirm payment via Mark-as-Paid when webhook fails (D54)
- Pre-deposit disclosure shown at four mandatory points for GSTAT Appeal
  and Commissioner Appeal services (D56)

### Fixed
- Razorpay webhook now correctly uses express.raw() middleware preventing
  HMAC signature failures
```

---

## Type: `question`

### When to use

An implementation question arose that cannot be resolved immediately —
requires client input, further research, or a future decision. Captures
it so it is not forgotten and appears in the next project review.

### File header (if creating new)

```markdown
# Open Questions

> Unresolved questions tracked during development.
> Mirrors the format from KB1 §20 and KB2 §10.
> When a question is resolved, move it to decisions.md and mark it closed here.

---
```

### Entry format

Assign the next open question number continuing from where KB2 left off
(last entry in KB2 is O10 — start at O11).

```markdown
### O<N> — <Short title>

**Question:** <The specific unresolved question — one or two sentences>

**Context:** <Why this matters, what decision it blocks>

**Options considered:**
- Option A: <description>
- Option B: <description>

**Blocking:** Yes / No — <what is blocked until this is resolved>

**Status:** Open — <date logged>
```

When the question is resolved, append to the entry:

```markdown
**Resolution:** <What was decided>
**Decision logged:** D<N> in decisions.md
**Status:** Closed — <date closed>
```

**Example entry:**
```markdown
### O11 — Admin notes format

**Question:** Should admin notes support markdown formatting or plain text only?

**Context:** Admin notes are visible to the user on the service detail page.
Markdown would allow structured summaries; plain text is simpler to implement.

**Options considered:**
- Plain text: simpler, no rendering library needed, no XSS risk
- Markdown with sanitization: richer output, small additional complexity

**Blocking:** No — can launch with plain text and upgrade later

**Status:** Open — 2026-06-10
```

---

## Step 2 — After writing the entry

1. Print the exact entry that was appended.
2. If type is `question` and it is marked **blocking**, suggest also adding
   a `p1` priority task via `/task add` to track resolution.
3. If type is `decision` and it changes something in the HLD or KB, note:
   > "This decision updates a locked HLD/KB item. Consider running `/sync-hld`
   > to flag the drift between the documentation and the new decision."
