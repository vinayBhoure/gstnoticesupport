# Feature Test Plan — Final Draft · Representation · Admin Notifications

Covers the three features shipped on `development`:
- `feature/phase-2/final-draft` — post-payment final draft (D90)
- `feature/phase-2/representation-service` — bookable representation with custom pricing (D91)
- `feature/phase-2/admin-notification-delivery` + `fix/admin-notification-recipient-decouple` — admin email delivery (D89, D92)

Three layers, matching the project's Newman + `tsx`-fixture conventions. Layers 1–2 are fully automated; Layer 3 is interactive (browser + Gmail MCP) for the bits Newman cannot reach (real S3 PUT/GET, real Razorpay capture, real inbox receipt).

## Prerequisites
- Backend on `http://localhost:4000` — fresh boot recommended (`cd server && npm run dev`).
- Seeded admin (`cd server && npx prisma db seed`) with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env`.
  `ADMIN_EMAIL` is the **login identity** (`admin@gstnoticesupport.in`); `ADMIN_NOTIFICATION_EMAIL` is the **delivery inbox** (D92).
- Newman deps installed (`cd test/postman && npm install`).
- Client on `http://localhost:3000` for Layer 3 (`cd client && npm run dev`).

Test rows are tagged `organizationName='__TEST__ …'`. Bookings are never deleted (database.md §3.3); re-runs create fresh rows.

---

## Layer 1 — Newman (API contract & gating)

### Final Draft — `run-finaldraft-newman.sh` → **53 assertions / 24 requests / 0 failures**
Fixture `server/scripts/setup-final-draft-fixtures.mjs` pins draft_ready/filing/complete bookings (each with a placeholder original `draftS3Key`) + a role=user account. The pre-signed GET URL embeds the object key, so variant resolution is asserted by checking `/drafts/` vs `/final-drafts/` in the returned URL.

| Area | Scenarios |
|---|---|
| Unauth / RBAC | upload-url & confirm → 401 no-auth, 403 non-admin |
| Upload-url gates | non-PDF → `INVALID_FILE_TYPE`; >20 MB → `FILE_TOO_LARGE`; draft_ready → `DRAFT_LOCKED`; filing & complete → 200 + `final-drafts/<id>-` key |
| Confirm | forged `drafts/…` key → `VALIDATION_ERROR`; filing first → 200 `hasFinalDraft=true`, status unchanged; replace → 200; complete → 200; `finalDraftS3Key` never exposed |
| Draft-url variants | `variant=final` before upload → 404; `variant=original` → `/drafts/`; no-param before → original; `variant=bogus` → 400; draft_ready booking → 403 `DRAFT_NOT_ACCESSIBLE`; after upload: no-param & `variant=final` → `/final-drafts/`; `variant=original` still `/drafts/` |
| DTO | admin detail exposes `hasFinalDraft`, hides `finalDraftS3Key` + `draftS3Key` |

### Representation — `run-representation-newman.sh` → **33 assertions / 14 requests / 0 failures**
Self-contained (no fixture): admin creates its own representation + asmt_10 bookings via the API.

| Area | Scenarios |
|---|---|
| Bookable | `POST /bookings serviceType=representation` → 201, `quotedAmountPaise` null |
| Quote gating | draft-confirm without quote → `QUOTE_REQUIRED`; below ₹500 / above ₹1,00,000 → `VALIDATION_ERROR`; quote 750000 → 200 draft_ready, stored & reflected in detail |
| Non-rep | quote on asmt_10 draft-confirm → `VALIDATION_ERROR` |
| Pricing | `POST /payments/:id/initiate` → order `amountPaise === 750000` (the quote, not a fixed price) |
| Stats/list | `stats.byServiceType.representation` is a number ≥1; `?serviceType=representation` filter returns only representation |

> Note: the existing `Admin.postman_collection.json` stats test checks the original 4 service keys exist (not "exactly 4"), so it is unaffected by the new `representation` key.

---

## Layer 2 — Scripts (`tsx`, run from `server/`)

- `assert-admin-email-config.mjs` → **4/4 checks pass**: recipient resolves, is a valid email, is **not** on the sender's domain (deliverability), and matches client `CONTACT_TO_EMAIL`.
- `test-notifications.mjs` → **3/3 sends accepted**: exercises the real Resend transport through `emailService`; asserts the D89 change returns `{ok:true,id}` and logs `Email sent {event,resendId}` instead of swallowing. Confirms Resend *accepted* the send (inbox receipt = Layer 3).

---

## Layer 3 — MCP end-to-end (interactive)

**Browser-free (done):** the public representation service + pricing pages were fetched over HTTP and assert the new copy ("Book This Service", "Custom Quote", "quoted in your dashboard") renders and the stale offline/WhatsApp copy is gone (0 occurrences).

**Needs enablement:**
- **Gmail MCP** (`/mcp` → "claude.ai Gmail"): confirm the `[TEST] Admin notification …` emails (Resend ids logged by `test-notifications.mjs`) actually arrived in the recipient inbox — closes Feature 3 end-to-end.
- **claude-in-chrome** (Chrome extension connected): 
  - Booking wizard shows the 5th "Representation Before Authority — Custom Quote" card; book it.
  - Admin booking detail: Draft card shows the "Quoted fee (₹)" input for representation; Final Draft card is locked pre-payment, a dropzone post-payment (real S3 PUT).
  - User draft viewer: Final/Original toggle appears once a final draft exists (real S3 GET).
  - Razorpay **test checkout** (Netbanking → Success, per D77) at the quoted amount → booking → `filing` → download. This is the only path that produces a genuinely captured payment.

## What stays manual (not assertable in Newman)
Real Razorpay capture, real S3 object upload/download, and true inbox receipt — all covered by Layer 3.

## Run everything
```bash
cd test/postman && npm install
bash run-finaldraft-newman.sh
bash run-representation-newman.sh
cd ../../server
npx tsx scripts/assert-admin-email-config.mjs
npx tsx scripts/test-notifications.mjs
```
