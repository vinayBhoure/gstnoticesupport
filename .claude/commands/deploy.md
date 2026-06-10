---
name: deploy
description: >
  Runs the full deployment workflow for gstnoticesupport.in — pre-deployment
  checklist (env vars, migrations, Razorpay mode, Cloudflare WAF, cookie
  domain, CORS) and post-deployment smoke tests (frontend, auth flow, booking
  flow, payment modal, email delivery). Takes the target environment as the
  argument. Prevents broken deploys by surfacing every project-specific
  configuration requirement before and after each promotion.
  Usage: /deploy <environment> <mode>
  Environments: staging | production
  Modes: pre | post | both (default: both)
  Examples:
    /deploy staging
    /deploy production pre
    /deploy production post
---

# /deploy

Deployment checklist for gstnoticesupport.in. Every item is project-specific —
not a generic deployment guide.

The promotion path is locked (HLD §18.4):
```
feature branch → PR to staging → staging deploy → /deploy staging post
→ PR to main → production deploy → /deploy production post
```
No code reaches production without passing staging first.

---

## PRE-DEPLOY checklist

Run before merging a PR or triggering a deploy.

---

### Section 1 — Database migrations

- [ ] `git status` in `server/prisma/migrations/` — confirm no uncommitted
  migration files
- [ ] If new migrations exist: confirm they were tested against the NeonDB
  **dev branch** first (not directly against staging or production)
- [ ] For **staging**: migrations will auto-apply on deploy via
  `prisma migrate deploy` — confirm the migration does not have a destructive
  operation (DROP COLUMN, DROP TABLE) without a prior data-copy step
- [ ] For **production**: migration is identical to what ran on staging —
  no manual edits to migration SQL

---

### Section 2 — Environment variables

Check the target environment's variable store (Vercel for frontend,
Render/Railway for backend).

**Backend — required vars:**

| Variable | Staging check | Production check |
|---|---|---|
| `NODE_ENV` | `staging` | `production` |
| `DATABASE_URL` | Points to NeonDB staging branch | Points to NeonDB main branch |
| `JWT_SECRET` | Set, min 32 chars | Set, different from staging |
| `FRONTEND_ORIGIN` | `https://staging.gstnoticesupport.in` | `https://gstnoticesupport.in` |
| `COOKIE_DOMAIN` | `.gstnoticesupport.in` (leading dot) | `.gstnoticesupport.in` (leading dot) |
| `RESEND_API_KEY` | Set | Set |
| `RESEND_FROM_EMAIL` | `support@gstnoticesupport.in` | Same |
| `AWS_REGION` | `ap-south-1` | `ap-south-1` |
| `AWS_ACCESS_KEY_ID` | Set | Set |
| `AWS_SECRET_ACCESS_KEY` | Set | Set |
| `S3_BUCKET_NAME` | Staging bucket name | Production bucket name |
| `RAZORPAY_KEY_ID` | **Test** key (`rzp_test_...`) | **Live** key (`rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | Test secret | Live secret |
| `RAZORPAY_WEBHOOK_SECRET` | Set (registered in Razorpay test dashboard) | Set (registered in Razorpay live dashboard) |
| `SENTRY_DSN` | Optional | **Required before launch** |

**Frontend — required vars:**

| Variable | Staging | Production |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `https://api-staging.gstnoticesupport.in` | `https://api.gstnoticesupport.in` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Test key | Live key |
| `NEXT_PUBLIC_SITE_URL` | `https://staging.gstnoticesupport.in` | `https://gstnoticesupport.in` |
| `NEXT_PUBLIC_CALENDLY_URL` | Set | Set |
| `NEXT_PUBLIC_GA_ID` | Optional | Set before launch |

**Critical production-specific checks:**
- [ ] `RAZORPAY_KEY_ID` starts with `rzp_live_` — NOT `rzp_test_`
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` matches the live key ID (public key)
- [ ] `SENTRY_DSN` is set — errors must be captured in production

---

### Section 3 — CORS and cookie domain

- [ ] `FRONTEND_ORIGIN` is the exact origin including `https://` and no
  trailing slash — a mismatch silently breaks all authenticated requests
- [ ] `COOKIE_DOMAIN` starts with a dot: `.gstnoticesupport.in` — without
  the leading dot, cookies do not cross from `gstnoticesupport.in` to
  `api.gstnoticesupport.in`

---

### Section 4 — Cloudflare WAF (production only)

- [ ] Log into Cloudflare dashboard for `gstnoticesupport.in`
- [ ] Security → WAF → Custom Rules — confirm a rule exists allowing
  Razorpay's IP ranges to reach `api.gstnoticesupport.in/api/v1/webhooks/*`
  before any blocking rules
- [ ] SSL/TLS mode is "Full (strict)" for both the apex and the api subdomain
- [ ] `api.gstnoticesupport.in` is proxied through Cloudflare (orange cloud)

---

### Section 5 — Razorpay webhook URL (production only)

- [ ] Log into Razorpay live dashboard → Settings → Webhooks
- [ ] Confirm webhook URL is `https://api.gstnoticesupport.in/api/v1/webhooks/razorpay`
- [ ] `payment.captured` event is checked
- [ ] Webhook secret matches `RAZORPAY_WEBHOOK_SECRET` env var

---

### Section 6 — Resend sending domain (first production deploy only)

- [ ] `gstnoticesupport.in` is verified in Resend dashboard
- [ ] SPF record present at the domain registrar
- [ ] DKIM record present at the domain registrar
- [ ] DMARC record present at the domain registrar

---

## POST-DEPLOY smoke tests

Run after a deploy completes. Work through each test in order — a failure
in an early test often explains failures in later ones.

---

### Test 1 — Frontend loads

- [ ] `https://staging.gstnoticesupport.in` (or production) returns 200
- [ ] Homepage renders without console errors
- [ ] Calendly popup widget fires when the CTA is clicked (Phase 1+)
- [ ] Contact form submits and admin receives the email

---

### Test 2 — Auth flow (Phase 2+)

- [ ] Signup: new email + password → OTP email arrives in < 2 minutes
- [ ] OTP verify: correct OTP transitions to profile completion
- [ ] Profile completion: phone + services interested → lands on dashboard
- [ ] Login: correct credentials → dashboard loads, JWT cookie set
- [ ] Login: wrong password → error message, no cookie
- [ ] Logout: cookie cleared, redirect to login

---

### Test 3 — Booking flow (Phase 2+ — staging only with test data)

- [ ] Service selection → booking form loads
- [ ] Booking form: submit with valid data → status `Document Upload`
- [ ] Document upload: PDF under 5 MB uploads successfully
- [ ] Document upload: file over 5 MB is rejected with a clear error
- [ ] Admin dashboard: new booking appears
- [ ] Admin: set status to `In Review` → user receives email

---

### Test 4 — Payment flow (Phase 2+ — staging with Razorpay test card)

- [ ] Admin: upload draft PDF → status auto-transitions to `Draft Ready`
- [ ] User: service detail page shows locked draft placeholder + admin notes
- [ ] User: click "Pay to Unlock" → Razorpay modal opens
- [ ] Use Razorpay test card `4111 1111 1111 1111` → payment succeeds
- [ ] `/payment/verify` shows success state
- [ ] Booking transitions to `Filing`
- [ ] User and admin both receive payment confirmation email
- [ ] Draft PDF is now accessible at `/dashboard/services/[id]/draft`
- [ ] Pre-signed URL expires after 15 minutes (verify by waiting or checking
  URL expiry parameter)

---

### Test 5 — Email delivery

- [ ] All emails in Test 2–4 arrived (check inbox + spam)
- [ ] Sender address is `support@gstnoticesupport.in`
- [ ] Email subject lines match the templates
- [ ] No emails landed in spam (if they did, check Resend dashboard for
  DKIM/SPF pass/fail)

---

### Test 6 — Admin dashboard (Phase 2+)

- [ ] Admin login works (admin role is set in DB for the admin email)
- [ ] Bookings list shows all test bookings
- [ ] Booking detail page loads all documents and status history
- [ ] Status change buttons are visible for the correct states only
- [ ] Mark-as-Paid button is hidden when booking is at `Filing` or `Complete`

---

## Output format

After running either pre or post checks, print a summary:

```
Pre-deploy checklist — staging
─────────────────────────────────────────────────
✓ Migrations: no uncommitted migrations
✓ Backend env vars: all 14 required vars present
✗ FRONTEND_ORIGIN: set to 'https://staging.gstnoticesupport.in/' (trailing slash)
  Fix: remove trailing slash — must be exact origin
✓ COOKIE_DOMAIN: '.gstnoticesupport.in' (leading dot present)
✓ Razorpay: test keys confirmed for staging
─────────────────────────────────────────────────
1 issue found. Fix before deploying.
```

For items that cannot be verified automatically (Cloudflare WAF, Razorpay
dashboard, DNS records), prompt the developer to check manually and confirm.
