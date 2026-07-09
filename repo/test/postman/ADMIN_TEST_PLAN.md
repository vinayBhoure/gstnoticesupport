# EP13 Admin Surface — API Test Plan

Automated coverage of the 8 admin endpoints (`/api/v1/admin`) via Newman, plus the paths that
require a real captured Razorpay payment (deferred to manual, per D77).

## Auth & fixture strategy

- **Admin token** — the seeded admin (`POST /auth/login`); creds read from `server/.env` at runtime, never committed.
- **Non-admin token** — a verified `role=user` account minted by the fixture (`admin-suite-user@example.com`), used only for the RBAC 403 folder.
- **State fixtures** — `server/scripts/setup-admin-fixtures.mjs` mints 8 bookings, each pinned to the exact state a test needs, and emits one JSON line (`ADMIN_FIXTURES_JSON`). The runner injects it as `adminFixturesJson`; the collection parses it in its pre-request. Order-independent — no test depends on another mutating shared state.
- **Cookie jar order** — unauth (401) → user login → RBAC (403) → admin login (overwrites cookie) → functional.

## Coverage matrix (50 assertions, 12 folders)

| Endpoint | Cases covered |
|---|---|
| **Cross-cutting** | 401 (no cookie) on list/mark-paid/stats; 403 (user token) on **all 8** routes |
| `GET /admin/bookings` | default shape (`data[]` + `meta`, user joined, no PII contact fields); `limit=5` echo + length; filter `status`; filter `serviceType`; `limit=200` → 400; `page=0` → 400; `status=bogus` → 400 |
| `GET /admin/bookings/:id` | valid (user, documents[], **all** paymentRecords[], `hasDraft` bool, **no** `draftS3Key`, **no** doc `s3Key`); invalid uuid → 400; non-existent → 404 |
| `PATCH .../status` | `document_upload→in_review` 200; `in_review→complete` 409; `draft_ready→in_review` 409; `draft_ready→complete` 409; enum `draft_ready` → 400; missing body → 400; `filing→complete` 200 |
| `POST .../draft-upload-url` | non-PDF → 400 `INVALID_FILE_TYPE`; >20 MB → 400 `FILE_TOO_LARGE`; missing field → 400; `document_upload` → 409 `DRAFT_LOCKED`; `filing` → 409 `DRAFT_LOCKED`; `in_review` valid → 200 (https url, key `drafts/<id>-`, expiresAt) |
| `POST .../draft-confirm` | foreign `s3Key` → 400; `filing` → 409 `DRAFT_LOCKED`; `in_review` first draft → 200 `draft_ready` + `hasDraft:true`; `draft_ready` re-upload → 200 stays `draft_ready` |
| `PATCH .../note` | set → 200 (echoed); update → 200; clear `""` → 200; >5000 chars → 400 |
| `POST .../mark-paid` | missing id → 400; non-existent → 404; not `draft_ready` → 409 `INVALID_STATUS`; already paid → 409; `draft_ready` + unknown id → 502 `RAZORPAY_ERROR` |
| `GET /admin/stats` | 200; `byStatus` all 6 keys; `byServiceType` all 4 keys; `totalRevenuePaise` ≥ 0; `Σ byStatus == totalBookings` |

## Deferred to manual (needs a real captured Razorpay TEST payment — D77)

These cannot be produced by an API-only run because Razorpay exposes no way to fabricate a
captured payment with a valid order linkage:

1. **`mark-paid` 200 success** — a genuinely `captured` payment whose order belongs to a `draft_ready` booking → booking `filing`/`paid`, `source=admin_override`, `performed_by_admin_id` set.
2. **`mark-paid` 422 `PAYMENT_NOT_CAPTURED`** — a real payment id Razorpay reports as not captured, **or** a captured payment whose order belongs to a *different* booking (cross-booking guard).
3. **`mark-paid` idempotency** — repeat with the same id → rejected at the `assertPayable` gate (`PAYMENT_ALREADY_CAPTURED`); confirm no double transition/email.
4. **Real browser→S3 PUT** — PUT a PDF to the signed `uploadUrl` (needs valid AWS creds + bucket CORS), then `draft-confirm`. The suite asserts the signed-URL *shape* only (signing is local, no S3 round-trip).
5. **Email delivery** — draft-ready / draft-updated / in_review / complete land in the inbox; **pre-deposit disclosure present** in draft emails for `commissioner_appeal` / `gstat_appeal` (KB2 §7). Emails are best-effort/fire-and-forget, so the API run can't assert them.
6. **Rate limit** — `draft-upload-url` 16th call in an hour → 429 (not automated to avoid burning the limiter).

To run #1–#3: complete one Razorpay TEST Checkout (Netbanking → Success) for a `draft_ready`
booking via `test/manual/checkout.html`, then call `mark-paid` with the resulting `pay_…` id.

## Prerequisites (developer side)

1. Backend running: `cd server && npm run dev` (fresh boot).
2. Seeded admin: `cd server && npx prisma db seed` — needs `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env`.
3. Valid `server/.env`: `DATABASE_URL` (NeonDB) + Razorpay keys present (env loader requires them; the 502 test works with any keys).
4. Newman installed: `cd test/postman && npm install`.

## Run

```bash
bash test/postman/run-admin-newman.sh
```

## Files

- `Admin.postman_collection.json` — the collection (import into Postman directly).
- `admin-local.postman_environment.json` — placeholders only, no secrets.
- `run-admin-newman.sh` — loads admin creds from `server/.env`, mints fixtures, runs Newman.
- `../../server/scripts/setup-admin-fixtures.mjs` — fixture (test user + 8 state-pinned bookings).
