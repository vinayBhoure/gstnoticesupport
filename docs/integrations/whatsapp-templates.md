# WhatsApp Cloud API — Setup & Template Manifest

> **Status:** Integration code is shipped but **inert** until `WHATSAPP_ENABLED=true`
> and the credentials below are set. Do not enable until every template listed here
> is **APPROVED** in WhatsApp Manager.
>
> **Provider:** Meta WhatsApp Cloud API (Graph API, called directly — no third-party BSP).
> **Overrides KB1 §16** ("no WhatsApp automation") by explicit decision — see D101 in
> `docs/tracking/decisions.md`.

WhatsApp notifications are sent **alongside** the existing emails, never instead of
them. If a WhatsApp send fails or the user has no phone on file, the email still goes out.

---

## 1. One-time Meta setup (portal owner)

All steps are on Meta's side and must be completed before enabling the feature. Facts
below are from Meta's official Cloud API docs (developers.facebook.com), current as of
this writing.

1. **Create a Meta app** with the *"Connect with customers through WhatsApp"* use case
   at [developers.facebook.com/apps](https://developers.facebook.com/apps).
2. **Create/connect a WhatsApp Business Account (WABA)** and note the **WhatsApp
   Business Account ID**.
3. **Add the sender business phone number** (the number messages are sent *from*) and
   note its **phone-number-id** (shown in the API Setup panel). → `WHATSAPP_PHONE_NUMBER_ID`
4. **Create a System User** in Business Settings → **generate a permanent access token**
   with these permissions: `whatsapp_business_messaging`, `whatsapp_business_management`,
   `business_management`. → `WHATSAPP_ACCESS_TOKEN`
   *(The dashboard "Generate access token" button produces a temporary token — do not
   use it for production.)*
5. **Verify the business** (Business Settings → Security Center). Until verified, the
   portfolio is capped at **250 unique recipients / 24h** and **250 templates**;
   verification raises the messaging limit to **2,000/24h** (then auto-scales) and the
   template cap to 6,000. 250/day is sufficient for launch volume.
6. **Create and submit each template** in the manifest below (§5). Templates are
   auto-reviewed, usually **within 24 hours**; only `APPROVED` templates can be sent.
7. **Configure the webhook** (§2) — this can be done anytime, independent of the
   above, and does not require `WHATSAPP_ENABLED=true`.
8. **Fill the send env vars** (§3), set `WHATSAPP_ENABLED=true`, and restart the server.

### Opt-in
WhatsApp policy requires users to opt in to receive business messages. The account
holder provides their number on the **Complete Profile** step (now mandatory before
dashboard access — see D100); that screen should state that booking updates are sent on
WhatsApp, which serves as the opt-in. All templates here are transactional **utility**
messages about the user's own booking/account.

---

## 2. Webhook setup (inbound events)

The server exposes an inbound webhook at **`/api/v1/webhooks/whatsapp`** for Meta to
call. This is separate from the outbound send path (§3) and uses its own credentials —
configuring it does **not** require `WHATSAPP_ENABLED=true`.

### 2.1 What it does today

- **`GET /api/v1/webhooks/whatsapp`** — the one-time verification handshake Meta performs
  when you save the Callback URL in the dashboard. Confirms `hub.verify_token` matches
  `WHATSAPP_VERIFY_TOKEN` and echoes back `hub.challenge`.
- **`POST /api/v1/webhooks/whatsapp`** — receives event deliveries (inbound messages,
  delivery/read status updates, template status changes). Verifies the
  `X-Hub-Signature-256` header against `WHATSAPP_APP_SECRET`, returns 200 immediately,
  and — **only while `WHATSAPP_ENABLED=true`** — logs the event type and message ID for
  observability. **It does not process events**: no reply is sent, no delivery status is
  stored, no database is touched. See §7 for what's intentionally not built yet.

### 2.2 Dashboard configuration

1. In the Meta App Dashboard → WhatsApp → Configuration, set:
   - **Callback URL**: `https://<your-api-domain>/api/v1/webhooks/whatsapp`
   - **Verify Token**: any string you choose — put the same value in `WHATSAPP_VERIFY_TOKEN`
2. Click **Verify and Save** — Meta calls the GET endpoint immediately; it must return
   200 with the exact challenge value, or the save is rejected.
3. Under **Webhook fields**, subscribe to at least `messages` (delivery/read status and
   inbound replies). Subscribing to more fields is harmless — unrecognized event shapes
   are simply not logged (the parser returns nothing rather than erroring).
4. **`WHATSAPP_APP_SECRET`** is the App Secret from App Dashboard → App Settings →
   Basic — **not** the System User access token used for sending (§3). Get this before
   step 2.3, since POST deliveries will 401 (and Meta will eventually disable the
   webhook after repeated failures) without it.

### 2.3 Local/staging testing

Meta requires a publicly reachable HTTPS URL — a local `http://localhost` server cannot
receive webhook calls directly. Use a tunnel (e.g. ngrok) pointed at the dev server's
`/api/v1/webhooks/whatsapp` during setup, or configure the callback URL only once a
staging/production domain is live.

## 3. Environment variables (`server/.env`)

| Variable | Required | Notes |
|---|---|---|
| `WHATSAPP_ENABLED` | to turn on | Only the literal `true` enables sending; anything else = off |
| `WHATSAPP_API_VERSION` | default `v23.0` | Graph API version |
| `WHATSAPP_PHONE_NUMBER_ID` | yes (when on) | Sender number's phone-number-id |
| `WHATSAPP_ACCESS_TOKEN` | yes (when on) | Permanent System User token |
| `WHATSAPP_TEMPLATE_LANG` | default `en` | Must match the language templates were created in |
| `WHATSAPP_ADMIN_NUMBER` | for admin alerts | E.164 with country code (e.g. `+9198XXXXXXXX`); admin sends skipped if unset |
| `WHATSAPP_APP_SECRET` | yes (for webhook) | Meta App Secret — signs inbound webhook payloads. Different from `WHATSAPP_ACCESS_TOKEN`. POST 401s without it |
| `WHATSAPP_VERIFY_TOKEN` | yes (for webhook) | Any string; must match the Meta dashboard's Callback URL "Verify Token" field. GET 403s without it |

---

## 4. Template rules (apply to every template below)

- **Category:** `utility` (transactional account/order updates). Not marketing.
- **Parameter format:** **positional / numbered** — WhatsApp Manager's dashboard
  composer only allows numbered variables (`{{1}}`, `{{2}}`, …), not named ones.
  **The Parameters column's left-to-right order IS the `{{1}}, {{2}}, …` mapping** —
  e.g. for `booking_created_user`: `name`→`{{1}}`, `service`→`{{2}}`,
  `booking_id`→`{{3}}`, `filed_for`→`{{4}}`. The server sends values in exactly this
  order (`whatsapp/templates.ts` emits them positionally); creating a template with the
  variables in a different order silently swaps values inside the delivered message.
- **Language:** create each in the language set by `WHATSAPP_TEMPLATE_LANG` (default `en`).
- **Name:** must match the manifest name **exactly** (lowercase + underscores).
- Parameter values are injected at send time from booking/account data. The `service`
  value is the raw service key (`asmt_10`, `scn`, `commissioner_appeal`, `gstat_appeal`,
  `representation`) — write body copy that reads acceptably with that value.

Body text below is a **suggested** starting point (written with descriptive placeholder
names for readability — substitute `{{1}}, {{2}}, …` in the listed order when creating);
wording can be adjusted at creation time as long as the **parameter count and order are
preserved**.

---

## 5. Template manifest

### User-facing (sent to the account holder's WhatsApp number)

| Template name | Parameters | Suggested body |
|---|---|---|
| `welcome_user` | `name` | Hi {{name}}, welcome to GST Notice Support. Your account is ready — you can book a service, upload documents, and track your case from your dashboard. |
| `login_alert_user` | `name` | Hi {{name}}, a new sign-in to your GST Notice Support account was just detected. If this wasn't you, please secure your account and contact us. |
| `booking_created_user` | `name`, `service`, `booking_id`, `filed_for` | Hi {{name}}, your booking for {{service}} (ref {{booking_id}}, filed for {{filed_for}}) has been received. Please upload your supporting documents so our team can begin the review. |
| `booking_cancelled_user` | `name`, `service`, `booking_id` | Hi {{name}}, your booking for {{service}} (ref {{booking_id}}) has been cancelled as requested. You can create a new booking any time. |
| `payment_confirmed_user` | `name`, `amount`, `service`, `booking_id`, `payment_id` | Hi {{name}}, we've received your payment of {{amount}} for {{service}} (ref {{booking_id}}). Payment ID: {{payment_id}}. Your draft is now unlocked in your dashboard. |
| `status_in_review_user` | `name`, `service`, `booking_id` | Hi {{name}}, our team has started reviewing your {{service}} case (ref {{booking_id}}). We'll notify you the moment your draft is ready. |
| `draft_ready_user` | `name`, `service`, `booking_id` | Hi {{name}}, your draft for {{service}} (ref {{booking_id}}) is ready. Complete the payment in your dashboard to unlock and view the full document. |
| `draft_ready_predeposit_user` | `name`, `service`, `booking_id` | Hi {{name}}, your draft for {{service}} (ref {{booking_id}}) is ready. Note: a pre-deposit as per the GST Act is required before this service is filed — our team will advise the exact amount. Complete the payment in your dashboard to unlock the draft. |
| `draft_updated_user` | `name`, `service`, `booking_id` | Hi {{name}}, our team has updated your draft for {{service}} (ref {{booking_id}}). Complete the payment in your dashboard to view the latest version. |
| `draft_updated_predeposit_user` | `name`, `service`, `booking_id` | Hi {{name}}, our team has updated your draft for {{service}} (ref {{booking_id}}). Note: a pre-deposit as per the GST Act is required before filing — our team will advise the exact amount. Complete the payment in your dashboard to view the latest version. |
| `final_draft_ready_user` | `name`, `service`, `booking_id` | Hi {{name}}, your final draft for {{service}} (ref {{booking_id}}) is now available in your dashboard to view and download. |
| `final_draft_updated_user` | `name`, `service`, `booking_id` | Hi {{name}}, our team has updated your final draft for {{service}} (ref {{booking_id}}). The latest version is available in your dashboard. |
| `status_complete_user` | `name`, `service`, `booking_id` | Hi {{name}}, your {{service}} filing (ref {{booking_id}}) is now complete. Thank you for trusting GST Notice Support with your case. |
| `account_deleted_user` | `name` | Hi {{name}}, your GST Notice Support account has been closed as requested. Your booking and payment records are retained as required by law. If this wasn't you, contact us immediately. |

### Admin-facing (sent to `WHATSAPP_ADMIN_NUMBER`)

| Template name | Parameters | Suggested body |
|---|---|---|
| `account_created_admin` | `email` | New account created: {{email}}. |
| `booking_created_admin` | `service`, `booking_id`, `contact`, `gstn` | New booking: {{service}} (ref {{booking_id}}). Contact: {{contact}}. GSTN: {{gstn}}. |
| `booking_cancelled_admin` | `service`, `booking_id`, `contact` | Booking cancelled by user: {{service}} (ref {{booking_id}}). Contact: {{contact}}. |
| `documents_uploaded_admin` | `service`, `booking_id`, `contact` | Documents uploaded for {{service}} (ref {{booking_id}}). Contact: {{contact}}. Ready to review. |
| `payment_confirmed_admin` | `service`, `booking_id`, `amount`, `contact` | Payment received: {{amount}} for {{service}} (ref {{booking_id}}). Contact: {{contact}}. Booking moved to filing. |
| `payment_failed_admin` | `service`, `booking_id`, `contact`, `phone` | Payment attempt failed for {{service}} (ref {{booking_id}}). Contact: {{contact}} ({{phone}}). Booking remains at draft stage. |
| `status_complete_admin` | `service`, `booking_id`, `contact` | Booking marked complete: {{service}} (ref {{booking_id}}). Contact: {{contact}}. |
| `account_deleted_admin` | `email` | User account closed: {{email}}. |

---

## 6. Event → template map (what fires when)

Mirrors the notification matrix. **OTP / password-reset emails are email-only** (no phone
exists at signup, and one-time codes stay on the verified channel).

| Event | User template | Admin template |
|---|---|---|
| Registration | `welcome_user` (fires at **Complete Profile**, when the phone first exists — not at OTP verify) | `account_created_admin` (at signup) |
| Login | `login_alert_user` | — |
| Booking created | `booking_created_user` | `booking_created_admin` |
| Booking cancelled | `booking_cancelled_user` | `booking_cancelled_admin` |
| Documents uploaded (first) | — | `documents_uploaded_admin` |
| Status → In Review | `status_in_review_user` | — |
| Draft ready | `draft_ready_user` / `draft_ready_predeposit_user`¹ | — |
| Draft updated | `draft_updated_user` / `draft_updated_predeposit_user`¹ | — |
| Payment confirmed | `payment_confirmed_user` | `payment_confirmed_admin` |
| Payment failed | — | `payment_failed_admin` |
| Final draft ready | `final_draft_ready_user` | — |
| Final draft updated | `final_draft_updated_user` | — |
| Status → Complete | `status_complete_user` | `status_complete_admin` |
| Account deleted | `account_deleted_user` | `account_deleted_admin` |

¹ The `_predeposit_` variant is used automatically for **Commissioner Appeal** and
**GSTAT Appeal** (KB2 §7). A WhatsApp template body is fixed at approval, so the
disclosure needs a separate approved template rather than an inline conditional.

---

## 7. Phone number handling

- Stored numbers may be a bare 10-digit Indian mobile (the signup schema allows an
  optional `+`/country code). The server normalizes to `+<countrycode><number>` before
  sending: a leading `+` is preserved; a bare 10-digit number is treated as Indian
  (`+91`); anything it can't confidently normalize is **skipped** (email still sends).
- Meta strongly recommends the full international format with a leading `+`. If `+` is
  omitted, Meta prepends the *sender* number's country code, which can misdeliver — the
  normalization above exists to avoid that.

## 8. Not included at launch (documented gaps, per project decision)

- **Delivery-status processing/persistence** — the inbound webhook (§2) exists and
  logs `sent`/`delivered`/`read`/`failed` events (event type + message ID only), but
  nothing is stored or acted on: no DB table, no per-message status tracking, no
  auto-replies to inbound messages. Meta retries send delivery internally within its
  TTL regardless. Turning the log-only receipt into persisted status is a future
  enhancement.
- **URL buttons** (e.g. a "View draft" button on the draft-ready message) — templates are
  body-text only for v1 to keep approval simple; buttons can be added later.
- **OTP over WhatsApp** — out of scope; OTP stays email-only.
