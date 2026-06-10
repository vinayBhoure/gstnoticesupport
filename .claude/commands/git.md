---
name: git
description: >
  Manages the Git workflow for gstnoticesupport.in — branch creation with
  correct naming conventions, Conventional Commits message generation from
  the staged diff, and pull request description drafting. All three sub-actions
  are project-aware: branch names encode phase and layer, commit messages
  include the correct scope, PR descriptions reference the task, skills used,
  and deployment checklist items.
  Usage: /git <action> [args]
  Actions: start | commit | pr
  Examples:
    /git start "add admin mark-as-paid endpoint"
    /git commit
    /git pr
---

# /git

Project-aware Git workflow for gstnoticesupport.in.
Handles the three steps where convention and context matter most —
everything else (push, pull, merge) the developer runs directly.

---

## Action: `start`

Creates a correctly named branch for a new piece of work.

### Branch naming convention

```
<type>/<phase>/<short-description>
```

| Segment | Values | Rules |
|---|---|---|
| `type` | `feature`, `fix`, `chore`, `docs`, `refactor` | `feature` = new user-visible functionality. `fix` = bug or broken behaviour. `chore` = tooling, deps, config. `docs` = documentation only. `refactor` = restructure without behaviour change |
| `phase` | `p1`, `p2`, `shared` | `p1` = Phase 1 marketing site. `p2` = Phase 2 platform. `shared` = config, tooling, docs affecting both |
| `short-description` | kebab-case, max 5 words | Describes *what*, not *how* |

**Examples:**
```
feature/p2/admin-mark-as-paid
fix/p2/webhook-raw-body-middleware
chore/shared/update-prisma-dependencies
docs/shared/update-hld-status-machine
refactor/p2/booking-repository-ownership-filter
```

### Steps

1. Parse the argument into type + phase + description.
   - If phase is ambiguous (the work touches both), use `shared`.
   - If type is ambiguous, ask once.
2. Print the branch name for the developer to confirm.
3. Output the command to run:
   ```bash
   git checkout -b <branch-name>
   ```
4. Remind: all branches target `staging` as the base, not `main`.
   Pull latest staging first:
   ```bash
   git fetch origin
   git checkout -b <branch-name> origin/staging
   ```

---

## Action: `commit`

Generates a Conventional Commits–formatted message from the staged diff.

### Conventional Commits format for this project

```
<type>(<scope>): <short summary>

[optional body — what changed and why, not how]

[optional footer — breaking changes, issue refs]
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`

**Scopes** — use the domain or layer the change lives in:

| Scope | When to use |
|---|---|
| `auth` | Login, OTP, JWT, cookies, password |
| `booking` | Booking CRUD, status transitions, intake form |
| `payment` | Razorpay, webhook, verify page, Mark-as-Paid |
| `document` | S3 upload, pre-signed URLs, file constraints |
| `notification` | Resend, email templates, notification service |
| `admin` | Admin dashboard, admin-only endpoints |
| `public` | Marketing pages, contact form, Calendly |
| `db` | Prisma schema, migrations, repositories |
| `config` | Env vars, middleware setup, CORS, Helmet |
| `deps` | Dependency updates |

**Summary rules:**
- Present tense, lowercase, no period at the end
- Max 72 characters total on the first line
- Describes the *change*, not the *file*

### Steps

1. Read `git diff --staged`.
2. If nothing is staged, read `git diff HEAD` and warn the developer to
   stage files before committing.
3. Analyse the diff:
   - Determine the correct `type` from the nature of the change.
   - Determine the correct `scope` from which domain/layer the files belong to.
   - Write a summary that describes what the change does, not which files were touched.
4. If the diff spans multiple unrelated concerns (e.g. a bug fix + a new feature),
   flag this: "This diff contains changes that should be separate commits."
   List what should be split and how.
5. Print the full commit message:
   ```
   feat(booking): add admin Mark-as-Paid endpoint with Razorpay verification

   Admin can now manually confirm payment for bookings stuck at Draft Ready
   with a pending or failed payment record. Requires Razorpay Fetch Payment
   API confirmation before processing — no blind override.

   Implements Layer 3 of the three-layer payment reliability pattern (KB2 §8.2).
   ```
6. Output the command to run:
   ```bash
   git commit -m "<first line>" -m "<body>"
   ```
   Or suggest using `git commit` (no `-m`) to open the editor if the body is long.

---

## Action: `pr`

Drafts a pull request description from the current branch diff against `staging`.

### PR description structure

```markdown
## What this PR does

<2–3 sentences describing the change at a product level, not a code level>

## Changes

- <bullet per logical change — not per file>
- <group related changes together>

## Skills applied

- <list which of the six master skills governed this work>
- <note any skill conventions that were explicitly followed>

## Checklist

### All PRs
- [ ] `/review` run and all errors resolved
- [ ] No `console.log` in production paths
- [ ] No hardcoded secrets or URLs
- [ ] TypeScript compiles without errors

### If backend changed
- [ ] Zod schema added/updated
- [ ] Controller reads from `req.validated`
- [ ] Ownership check in repository layer
- [ ] Error thrown as typed AppError subclass

### If Prisma schema changed
- [ ] Migration created (`npx prisma migrate dev --name <name>`)
- [ ] Migration tested on dev NeonDB branch
- [ ] Migration to be applied on staging before this PR merges

### If email template added/changed
- [ ] Event exists in Notification Matrix
- [ ] Pre-deposit disclosure block present for GSTAT/Commissioner Appeal (if Draft Ready email)
- [ ] Tested with Resend test endpoint

### If public page added/changed
- [ ] Metadata export present
- [ ] Schema.org JSON-LD correct
- [ ] Added to `app/sitemap.ts`
- [ ] Not blocked in `app/robots.ts`

### If deploying to production
- [ ] Razorpay mode is `live` (not test)
- [ ] Sentry DSN configured
- [ ] Cookie domain set to `.gstnoticesupport.in`
- [ ] CORS origin matches production URL

## Screenshots / evidence

<attach if UI changed or if a bug fix — before/after>
```

### Steps

1. Run `git diff origin/staging...HEAD` to get the full branch diff.
2. Identify the nature of the changes (feature, fix, chore, etc.).
3. Fill in the PR template above. Only include checklist sections that
   are relevant to what changed — remove inapplicable sections.
4. For the "Skills applied" section: name only the skills that genuinely
   governed decisions in this diff, not all six by default.
5. Print the complete PR description ready to paste into GitHub.
6. Remind the developer of the promotion path:
   - Branch → PR to `staging` → merge → staging deploy → test → PR to `main` → production deploy
   - No code reaches `main` without passing staging first (HLD §18.4)
