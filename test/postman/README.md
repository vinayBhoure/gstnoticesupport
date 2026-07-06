# GST Notice Support — Postman / Newman API Tests

Automated API tests for gstnoticesupport.in, runnable headlessly with [Newman](https://github.com/postmanlabs/newman).

## Scope

Phase 3 **Booking Lifecycle** (4 endpoints) plus the admin login required to reach them:

| # | Request | Expect |
|---|---------|--------|
| 1 | Create booking (no auth) | 401 `UNAUTHORIZED` |
| 2 | Login (admin) | 200 + `access_token` cookie |
| 3 | Create booking — invalid GSTN | 400 `VALIDATION_ERROR` |
| 4 | Create booking — consent not accepted | 400 `VALIDATION_ERROR` |
| 5 | Create booking — success | 201, `document_upload`/`pending`, price stripped, no `draftS3Key` |
| 6 | List bookings | 200, newest-first, summary shape |
| 7 | Get booking detail | 200, `documents[]` + `latestPayment` |
| 8 | Get detail — invalid uuid | 400 `VALIDATION_ERROR` |
| 9 | Get detail — non-existent | 404 `NOT_FOUND` |
| 10 | Cancel booking (document_upload) | 409 `INVALID_TRANSITION` |
| 11 | Cancel — non-existent | 404 `NOT_FOUND` |

**Out of scope (until later phases):** OTP success-path (OTP is bcrypt-hashed, no plaintext read);
cancel **success** path (needs a booking in `draft_ready`, which requires admin draft upload — Phase 6);
Documents/Payments/Admin endpoints (Phases 4–6, not yet built).

## Auth strategy

The collection logs in as the **seeded admin** (`POST /auth/login`). Admin credentials are read from
`server/.env` at runtime by `run-newman.sh` and injected as Newman `--env-var` values — they are
**never** committed to `gst-local.postman_environment.json`. Booking routes are `authenticate`-gated
(not role-gated), so the admin token exercises them correctly. Newman's cookie jar carries the
`access_token` cookie across requests automatically.

## Prerequisites

1. Backend running: `cd server && npm run dev` (listens on `http://localhost:4000`).
2. Seeded admin: `cd server && npx prisma db seed` (uses `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env`).
3. Newman installed: `cd test/postman && npm install`.

## Run

```bash
cd test/postman
npm install        # first time only
npm test           # → bash run-newman.sh
```

Or directly:

```bash
bash test/postman/run-newman.sh
```

## Files

- `GST Notice Support.postman_collection.json` — the collection (import into Postman directly).
- `gst-local.postman_environment.json` — environment (placeholders only; no secrets).
- `run-newman.sh` — loads admin creds from `server/.env` and runs Newman.
- `package.json` — pins Newman; `npm test` entry point.

## Other suites

- **Payments (EP12):** `Payments.postman_collection.json` + `run-payments-newman.sh`. See the collection description and `decisions.md` D76–D77.
- **Admin Surface (EP13):** `Admin.postman_collection.json` + `run-admin-newman.sh` (`bash run-admin-newman.sh`). 50 assertions across the 8 `/api/v1/admin` endpoints — RBAC, list/detail, status transitions, draft upload/confirm, notes, mark-paid gates, and stats. Full coverage matrix and the manual/deferred paths (real captured Razorpay payment, S3 PUT, email) are in **`ADMIN_TEST_PLAN.md`**.
