# GST Notice Support — Project Knowledge Base 2

> **Document Type:** Authoritative project memory for AI context loading and engineering onboarding
> **Version:** 1.0
> **Status:** Decisions locked. Tech stack discussion pending.
> **Last Updated:** Based on technical design discussion, June 2026
> **Depends On:** gstnoticesupport_project_knowledge_base_1.md (read that first)
> **Read this first:** This document records all decisions made in the second requirement and technical design session. If anything in a future conversation contradicts this document, this document wins until explicitly updated.

---

## Table of Contents

1. Session Context
2. Content & Launch Gap Resolutions
3. Phase 1 Structural Decisions
4. PDF Gating Mechanic — Final Design
5. Razorpay Payment Flow — Final Design
6. Payment Verification Page Specification
7. Pre-Deposit Disclosure Strategy
8. Admin Scope Boundary Changes
9. Updated Out of Scope
10. Updated Open Questions & Pending Decisions
11. Decision Log
12. Final Context Summary

---

## 1. Session Context

This knowledge base captures decisions made in the second project discussion session (June 2026), focused on:

- Resolving content and launch blockers identified during knowledge base 1 analysis
- Finalising the PDF gating mechanic
- Finalising the Razorpay payment flow including edge cases, failure handling, and the payment verification page
- Finalising the pre-deposit disclosure strategy
- Updating scope boundaries

All decisions in this document supplement and partially override knowledge base 1 where explicitly noted. Knowledge base 1 remains the source of truth for everything not covered here.

---

## 2. Content & Launch Gap Resolutions

### 2.1 Dummy Content Approved for Launch

The following items were confirmed as placeholder/dummy content for Phase 1 launch. They will be replaced with real content once available.

| Item | Decision |
|---|---|
| Company legal name / registered firm name | Use dummy placeholder for launch |
| Physical office address | Use dummy placeholder for launch |
| Primary mobile numbers (A and B) | Use dummy placeholder for launch |
| Inquiry email address | Use dummy placeholder for launch |
| Testimonials | Use dummy testimonials for launch; replace with real ones later |
| Case outcomes | Use dummy case outcomes for launch; replace with real ones later |

### 2.2 Items Permanently Deferred (Not Dummy — Absent)

The following items will not appear on the website at launch and are not to be substituted with placeholders.

| Item | Reason | Status |
|---|---|---|
| CIN (Company Identification Number) | Client company not yet officially registered | Will be added once company is registered |
| GSTIN (Company's own GST number) | Same as above | Will be added once company is registered |
| Social media URLs (Facebook, Instagram, LinkedIn) | Client has not provided URLs | Will be added once provided |
| Team names, photos, ICAI/Bar Council registration numbers | CA rules and regulations prohibit public disclosure | Permanently absent — team section to be handled without individual credentials |

> **Design implication:** The team section of the homepage cannot follow the Trust Blueprint's ideal pattern (photo + name + ICAI registration number + LinkedIn) due to regulatory constraints. The section must be redesigned to convey team credibility without individual identifiable details. This is a Phase 1 design task.

### 2.3 Terms & Conditions

Client does not have existing T&Cs. They are to be drafted by the developer based on the service model and the disclaimers provided in the client questionnaire. T&C drafting is in scope.

### 2.4 Privacy Policy

Client does not have an existing Privacy Policy. To be drafted based on industry standards. In scope.

---

## 3. Phase 1 Structural Decisions

### 3.1 Service Card CTAs ("File Now / Reply Now")

**Decision:** These CTAs on service cards redirect to the **Contact page** (not login/signup, not a coming soon page).

**Rationale:** Phase 1 has no authentication. Redirecting to contact page allows the user to initiate contact for the service they expressed interest in. This is better than a dead end or a coming soon page.

### 3.2 Calendly Integration Style

**Decision:** Calendly will be integrated as a **popup widget** (not inline embed, not redirect).

**Rationale:** Popup widget preserves page context, does not require dedicated page real estate, and is the lightest integration option for Phase 1.

### 3.3 Company Registration Details in Footer

**Decision:** CIN and GSTIN will be added to the footer once the client's company is officially registered. Until then, the footer will not display these fields (no placeholder, no blank field — the field simply does not appear until real data is available).

---

## 4. PDF Gating Mechanic — Final Design

### 4.1 Storage Architecture

- Draft PDFs are stored in a **private AWS S3 bucket** with no public access.
- No S3 object has a public URL at any point.
- The only mechanism to serve a draft to a user is through the application backend.

### 4.2 Draft Delivery — Signed URLs

**Decision:** Signed URL approach.

- When a user with a paid booking (`Filing` status or beyond) requests to view the draft, the backend:
  1. Verifies the user's session and booking ownership.
  2. Verifies the booking status is `Filing` or `Complete`.
  3. Generates a time-limited S3 pre-signed URL (expiry: **15 minutes**).
  4. Returns the signed URL to the frontend.
- The frontend opens the draft viewer page (`/dashboard/services/[id]/draft`) using this URL.
- The draft PDF is served directly from S3 to the browser via the signed URL.
- The S3 URL itself is never stored on the client or exposed in a shareable form beyond the 15-minute window.

**Security model:** A 15-minute expiry is acceptable for this audience (professional services users, not adversarial). Sharing the URL within 15 minutes gives access; after expiry, the link is dead and a new one must be generated.

### 4.3 Draft Viewer Page

- Route: `/dashboard/services/[id]/draft`
- Opens in a **separate blank page** (no navbar, no dashboard chrome).
- In-browser PDF viewer (no download forced — download button also available).
- Page generates a fresh signed URL on load — it does not accept a URL as a query parameter.
- Accessing this route while booking is in `Draft Ready` or earlier status returns a 403 / redirect to service detail page.

### 4.4 Admin Draft Upload and Re-Upload

**On first upload:**
- Admin uploads draft PDF from the booking detail page (admin dashboard).
- System stores the file in S3, saves the S3 object reference in the database.
- Booking status auto-transitions to `Draft Ready`.
- Email sent to user: "Your draft is ready for review."

**On re-upload (replacement before payment):**
- Admin can re-upload a replacement draft **only while status is `Draft Ready`** (user has not paid).
- Re-upload replaces the S3 object and updates the database reference.
- A brief notification email is sent to the user: "Your draft has been updated. Please review the latest version."
- Status remains `Draft Ready`. No status change triggered.

**Re-upload lock:**
- Once booking transitions to `Filing` (payment confirmed), the admin re-upload option is **disabled**.
- The draft is considered final at the point of payment.

### 4.5 Draft Access — Status Gate Summary

| Booking Status | User Can View Draft | Admin Can Upload / Replace Draft |
|---|---|---|
| Document Upload | ❌ | ❌ |
| In Review | ❌ | ❌ |
| Draft Ready | ❌ (locked, blocked view) | ✅ (replace allowed) |
| Filing | ✅ (signed URL, 15 min) | ❌ (locked) |
| Complete | ✅ (signed URL, 15 min) | ❌ (locked) |
| Cancelled | ❌ | ❌ |

---

## 5. Razorpay Payment Flow — Final Design

### 5.1 Razorpay Orders Flow (Not Payment Links)

**Decision:** Use **Razorpay Orders** flow.

**Why:** Razorpay Orders create an unambiguous link between your internal booking record and the Razorpay payment. This enables reliable idempotency, signature verification, and payment status polling. Payment link approaches do not provide this clean linkage.

**Flow:**
1. User clicks "Pay to Unlock" on the service detail page.
2. Backend creates a Razorpay Order via API (amount = service fee, currency = INR, receipt = booking ID).
3. Razorpay returns an `order_id`.
4. Backend stores `order_id` against the booking's payment record (status: `pending`).
5. Frontend opens Razorpay payment modal with `order_id`, amount, and prefilled user details.
6. User completes or abandons payment.
7. Razorpay redirects user to `/payment/verify` (see Section 6).

### 5.2 Three-Layer Payment Reliability Architecture

#### Layer 1 — Webhook with Signature Verification and Idempotency (Primary)

- Razorpay fires a webhook to your backend on payment capture.
- Backend **verifies the webhook signature** using the Razorpay webhook secret before processing anything. Unverified webhooks are rejected immediately.
- Backend checks if the `razorpay_payment_id` already exists in the payment records table. If it does, return HTTP 200 and exit — no reprocessing.
- If new, backend transitions booking to `Filing`, records payment details, sends emails to user and admin.
- Covers: normal case, Razorpay retries of a webhook already processed.
- Does not cover: server downtime during webhook delivery, user returning before webhook fires.

#### Layer 2 — Payment Verification on Redirect (Fallback)

- When Razorpay redirects the user to `/payment/verify`, the backend receives `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` as query parameters.
- Backend verifies the `razorpay_signature` first. If invalid, aborts.
- Backend calls **Razorpay Fetch Payment API** synchronously to confirm payment status.
- If status is `captured` and payment not already processed (idempotency check): transition booking to `Filing`, send emails.
- If status is `captured` and already processed by webhook: skip transition, redirect to success.
- If status is `failed` or `cancelled`: redirect to service detail with failed state.
- If API call fails or status is inconclusive: show inconclusive state (see Section 6.3).
- Covers: webhook delayed, user returns before webhook fires. Also covers webhook failure when user is redirected back normally.

#### Layer 3 — Admin Manual Override (Safety Net)

- Admin has a **"Mark as Paid"** action on the booking detail page (admin dashboard).
- Visible only when: booking status is `Draft Ready` AND payment record status is `pending` or `failed`.
- Admin enters the `razorpay_payment_id` from the Razorpay dashboard manually.
- Backend calls Razorpay Fetch Payment API to verify the payment ID is genuinely `captured`.
- If verified: transition booking to `Filing`, send emails.
- If not verified: show error — "This payment ID could not be confirmed with Razorpay."
- Admin cannot trigger this action arbitrarily — Razorpay API confirmation is mandatory.
- Covers: webhook failed persistently, user browser crashed before redirect, all residual edge cases.

### 5.3 Signature Verification — Mandatory

- All incoming Razorpay webhooks must have their HMAC-SHA256 signature verified against the webhook secret before any processing.
- The redirect from Razorpay to `/payment/verify` carries a `razorpay_signature` that must be verified before calling Razorpay API or processing any transition.
- Tampered or unsigned payloads are rejected with no processing and no information leak.

### 5.4 Idempotency — Implementation Rule

- Payment records table has a unique constraint on `razorpay_payment_id`.
- Before processing any payment confirmation (from webhook or from Layer 2), check if the `razorpay_payment_id` already exists.
- If it exists: return success / redirect to success. Do not process again.
- If it does not exist: process and insert atomically.
- This prevents double-transition and double-email regardless of which layer processes first.

### 5.5 Complete Payment Journey (State Diagram)

```
User clicks "Pay to Unlock"
        │
        ▼
Backend creates Razorpay Order
Order linked to booking_id in DB (payment record: pending)
        │
        ▼
Frontend opens Razorpay modal
        │
        ├── User completes payment
        │         │
        │         ├── [LAYER 1] Razorpay webhook fires
        │         │   → Verify signature
        │         │   → Idempotency check
        │         │   → Transition to Filing
        │         │   → Send emails
        │         │   → Return HTTP 200
        │         │
        │         └── Razorpay redirects to /payment/verify
        │             ?booking_id=X&order_id=Y
        │             &payment_id=Z&razorpay_signature=ABC
        │
        └── User closes modal / payment fails
                  └── Razorpay redirects to /payment/verify
                      with failed/cancelled status

On /payment/verify [LAYER 2]:
        │
        ├── Verify razorpay_signature
        │     └── Invalid → show tampered link error, no redirect
        │
        ├── Call Razorpay Fetch Payment API
        │     │
        │     ├── Status: captured
        │     │     ├── Idempotency check: already processed
        │     │     │     └── Redirect → /dashboard/services/[id]?payment=success
        │     │     └── Not processed → transition to Filing
        │     │           → send emails
        │     │           → Redirect → /dashboard/services/[id]?payment=success
        │     │
        │     ├── Status: failed / cancelled
        │     │     └── Redirect → /dashboard/services/[id]?payment=failed
        │     │
        │     └── API error / inconclusive
        │           └── Show inconclusive state on /payment/verify
        │               (WhatsApp contact + booking reference)
        │               No auto-redirect
        │
Admin Manual Override [LAYER 3]:
        └── Admin enters razorpay_payment_id
            → Backend calls Razorpay Fetch Payment API
            → If captured → transition to Filing → send emails
            → If not captured → show error, no transition
```

---

## 6. Payment Verification Page Specification

### 6.1 Route

`/payment/verify`

Query parameters received from Razorpay redirect:
- `razorpay_payment_id`
- `razorpay_order_id`
- `razorpay_signature`
- Internal: `booking_id` (appended by your backend when creating the Razorpay Order)

### 6.2 Page Design

- **No navbar. No footer. No dashboard chrome.**
- Centered layout. Logo at top.
- Loading state shown immediately on page load while verification runs in background.

**Loading state content:**
- Spinner / animated progress indicator
- Heading: "Verifying your payment."
- Subtext: "Please do not close this window. This usually takes a few seconds."

**Timeout rule:** If verification takes more than 10 seconds, the page transitions to the inconclusive state (Section 6.5). The loading state must never persist indefinitely.

### 6.3 Outcome 1 — Payment Verified Successfully

Booking transitions to `Filing`. Emails sent.

**User is redirected to:**
`/dashboard/services/[booking_id]?payment=success`

**On the service detail page:**
- Green confirmation banner at top: "Payment confirmed. Your draft is now available."
- Draft is unlocked. "Confirm Draft" button visible.
- The `?payment=success` query parameter triggers the banner on first load only. Removed from URL cleanly after display (no persistent query param on refresh).

### 6.4 Outcome 2 — Payment Failed or Abandoned

User closed the modal, card declined, UPI timed out.

**User is redirected to:**
`/dashboard/services/[booking_id]?payment=failed`

**On the service detail page:**
- Neutral informational banner: "Payment was not completed. Your draft is still available to unlock when you're ready."
- "Pay to Unlock" button remains visible and active.
- No alarming language. No error framing.

### 6.5 Outcome 3 — Verification Inconclusive

Razorpay API call failed or returned unexpected status. Backend cannot confirm or deny payment.

**User stays on `/payment/verify`.** No auto-redirect.

**Page content:**
- Heading: "We're having trouble confirming your payment right now."
- Body: "If your payment was deducted, it will be reflected in your service status within a few minutes. Please check your dashboard shortly."
- WhatsApp link with pre-filled message: "Payment verification issue — Booking ID: [X]" (booking ID visible to user on this page)
- Link: "Go to my dashboard" (manual escape)
- No spinner. Clear, calm, actionable.

### 6.6 Outcome 4 — Tampered or Invalid Signature

Signature verification fails.

**User stays on `/payment/verify`.** No redirect. No processing.

**Page content:**
- "This payment link is invalid or has expired."
- "Please check your service status in your dashboard."
- Link to dashboard.
- No technical error details shown to user.

### 6.7 Edge Cases on the Verification Page

| Edge Case | Behaviour |
|---|---|
| User refreshes the verification page | Check booking status first. If already `Filing` or beyond → show success, redirect immediately. Re-processing is prevented by idempotency. |
| User navigates back from browser history | Same as refresh — check status, redirect appropriately. |
| Webhook processed payment before user arrived on verify page | Idempotency check skips re-processing. User sees success outcome and is redirected. |
| User lands with tampered query parameters | Signature check fails. Show invalid link message. No processing. |
| Webhook + verify page race (both arrive simultaneously) | Unique constraint on `razorpay_payment_id` ensures only one write succeeds. Second attempt is a no-op. |

---

## 7. Pre-Deposit Disclosure Strategy

### 7.1 Context

Services 1 (GSTAT Appeal, ₹14,999) and 2 (Commissioner Appeal, ₹9,999) require a statutory government pre-deposit paid directly by the user to the government. This is entirely separate from the platform's professional fee. Failure to communicate this clearly before payment creates a trust collapse risk.

### 7.2 Disclosure Points — Confirmed

Pre-deposit disclosure must appear at all four of the following points. None of these is optional.

| # | Location | Format |
|---|---|---|
| 1 | Pricing page / service cards for Services 1 and 2 | Visible callout on the card — not a footnote, not an asterisk |
| 2 | Booking flow Step 1 (service selection) — only when Service 1 or 2 is selected | Inline contextual info block in the booking form |
| 3 | Draft Ready email (for Services 1 and 2 only) | Standard paragraph in the email template |
| 4 | "Pay to Unlock" screen — summary shown before Razorpay modal opens | Explicit line: "You are paying ₹[X] as professional fee. Government statutory pre-deposit is separate and will be coordinated during the filing stage." |

### 7.3 Pre-Deposit Copy Rule

- **Do not state the percentage** (25% for GSTAT, 10% for Commissioner Appeal) anywhere on the website or in emails.
- Reference only as: "as applicable under the GST Act" or "as per statutory requirements under the CGST Act."
- **Rationale:** Stating a percentage creates a specific financial expectation against the disputed amount. The disputed amount varies per case. Stating the percentage without the disputed amount context could mislead users into underestimating or overestimating the pre-deposit. The admin's notes field is the appropriate place to communicate the actual pre-deposit amount for a specific case.

### 7.4 Admin Responsibility for Pre-Deposit Communication

- Admin must communicate the specific pre-deposit amount applicable to the user's case in the **booking notes/summary field** before the user pays.
- This is an operational responsibility, not a platform-enforced one.
- The notes field is visible to the user on the service detail page before they click "Pay to Unlock."

---

## 8. Admin Scope Boundary Changes

### 8.1 Admin Cannot Cancel Bookings — Deferred to Future Scope

**Decision:** Admin-initiated cancellation of bookings is **removed from Phase 2 scope** and deferred to future phases.

**Impact on state machine:** The `Cancelled` terminal state remains in the system (user can still cancel at `Draft Ready` before payment). However, admin has no cancel action in Phase 2.

**Updated state machine transitions:**

| Transition | Triggered By | Phase 2 |
|---|---|---|
| → Document Upload | Booking submission | Automatic ✅ |
| → In Review | Admin manually sets | Manual (admin) ✅ |
| → Draft Ready | Admin uploads draft PDF | Automatic on upload ✅ |
| → Filing | Razorpay webhook / Layer 2 verify | Automatic ✅ |
| → Complete | Admin manually sets | Manual (admin) ✅ |
| → Cancelled | User cancels at Draft Ready stage | Manual (user) ✅ |
| → Cancelled by Admin | Admin action | ❌ Future scope |

> **Note for knowledge base 1:** Section 10 (Service Status Lifecycle) in KB1 listed "Admin can cancel at any stage." This is now superseded. Admin cancellation is out of Phase 2 scope.

### 8.2 Admin "Mark as Paid" — Added to Phase 2 Scope

This is a new admin capability added as Layer 3 of the payment reliability architecture.

- Visible on booking detail page only when: status is `Draft Ready` AND payment record is `pending` or `failed`.
- Requires manual entry of `razorpay_payment_id`.
- Backend verifies payment ID with Razorpay API before processing.
- See Section 5.2 Layer 3 for full specification.

---

## 9. Updated Out of Scope

Items added to out-of-scope list from this session, supplementing KB1 Section 19.

| Feature | Decision | Notes |
|---|---|---|
| Admin-initiated booking cancellation | Future scope | Removed from Phase 2 |
| Automatic pre-deposit amount calculation | Not in scope | Admin communicates via notes field |
| In-platform pre-deposit payment or tracking | Not in scope | Fully external, user pays government directly |
| Team section with individual names and credentials | Not in scope (regulatory) | CA rules prohibit public disclosure |
| CIN / GSTIN in footer | Deferred until company registered | Not a placeholder — field absent until real data available |

---

## 10. Updated Open Questions & Pending Decisions

Items carried forward or added from this session.

### O1 — Tech Stack
Unchanged from KB1. Explicitly undecided. Discussion pending in next session.

### O2 — Data Handling on Account Deletion
Unchanged from KB1. Hard-delete vs soft-delete. Document retention for legal/compliance. No decision yet.

### O3 — Admin Notes Format
Unchanged from KB1. Plain text vs rich text. Length limit. TBD.

### O4 — Overview Page Granularity (Admin)
Unchanged from KB1. Time filters, CSV export, KPIs. TBD.

### O5 — Team Section Redesign (New)
The team section cannot follow the Trust Blueprint ideal pattern due to CA regulatory constraints on public disclosure of individual credentials.
- What format replaces it?
- Options: aggregate credential statement ("Our team includes ICAI-registered CAs and Bar Council-enrolled Advocates"), team photo without names, or section removed entirely.
- **Decision pending design phase.**

### O6 — Webhook Endpoint URL
The Razorpay webhook must be registered with a specific URL. This URL is determined by the backend framework and hosting setup — both TBD. Confirm during tech stack discussion.

### O7 — Payment Record Schema
The idempotency implementation requires a payment records table with at minimum: `booking_id`, `razorpay_order_id`, `razorpay_payment_id` (unique), `amount`, `status`, `created_at`, `processed_at`. Exact schema to be finalised during Phase 2 design.

### O8 — Draft Ready Email Template for Services 1 and 2
The email template for Draft Ready status must include the pre-deposit disclosure paragraph for Services 1 and 2 only. Conditional email logic required. Template content to be written during Phase 2 design.

### O9 — "Mark as Paid" UI Placement (Admin)
Confirmed as a feature. Exact UI placement on admin booking detail page — button position, confirmation dialog content — TBD during design.

### O10 — Signed URL Generation — Auth Check Depth
When generating a signed URL for draft access, the backend must verify: (a) user session is valid, (b) booking belongs to that user, (c) booking status is `Filing` or `Complete`. The exact middleware chain depends on the auth library chosen. TBD during tech stack discussion.

---

## 11. Decision Log

Chronological log of confirmed decisions made in this session.

| # | Decision | Rationale |
|---|---|---|
| D34 | Dummy placeholders approved for: company name, address, phone numbers, email, testimonials, case outcomes | Content not available at launch; real content to replace later |
| D35 | CIN, GSTIN, social media URLs, team credentials — absent (not placeholder) until real data available | Regulatory constraints (CA rules) and company not yet registered |
| D36 | T&C and Privacy Policy to be drafted by developer based on service model and client-provided disclaimers | Client has no existing documents |
| D37 | Service card CTAs ("File Now / Reply Now") redirect to Contact page in Phase 1 | No auth in Phase 1; contact page is best alternative to dead end |
| D38 | Calendly integrated as popup widget | Lightweight, preserves page context |
| D39 | CIN/GSTIN footer fields absent until company registered — not placeholder | Placeholder would be misleading for a trust signal |
| D40 | Draft PDFs stored in private S3 bucket, no public URLs | Security requirement |
| D41 | Draft delivery via S3 pre-signed URLs, 15-minute expiry | Simpler than proxy, acceptable security model for this audience |
| D42 | Draft viewer at `/dashboard/services/[id]/draft` — separate blank page, no dashboard chrome | Per KB1 decision D26; generates fresh signed URL on load |
| D43 | Admin can re-upload draft while status is `Draft Ready` — replaces S3 object, sends "updated draft available" email, status unchanged | Admin needs error correction mechanism before user pays |
| D44 | Admin re-upload locked once booking reaches `Filing` status | Draft is final at point of payment |
| D45 | Razorpay Orders flow used (not payment links) | Clean booking-to-payment linkage for idempotency and verification |
| D46 | Three-layer payment reliability: Webhook (L1) + Verification page (L2) + Admin override (L3) | Covers all webhook failure scenarios without relying on single point |
| D47 | All webhooks verified via HMAC-SHA256 signature before processing | Security — prevents fake payment confirmations |
| D48 | Idempotency enforced via unique constraint on `razorpay_payment_id` in payment records table | Prevents double-processing from webhook retries and L2 race |
| D49 | Payment verification page at `/payment/verify` — dedicated page, no navbar/footer | Cleaner UX; explicit confirmation state; clean place for inconclusive handling |
| D50 | Verification page: four outcomes — success redirect, failed redirect, inconclusive with WhatsApp, tampered link error | Every payment outcome has a defined, non-broken user experience |
| D51 | Success redirect: `/dashboard/services/[id]?payment=success` with green banner, query param removed after display | Clean confirmation without persistent query params |
| D52 | Failed redirect: `/dashboard/services/[id]?payment=failed` with neutral informational banner | No panic language; CTA to retry remains visible |
| D53 | Inconclusive: user stays on verify page, sees WhatsApp link with pre-filled booking reference | User has clear next step; no dead end |
| D54 | Admin "Mark as Paid" added as Layer 3 — visible only at Draft Ready + pending/failed payment, requires Razorpay API verification | Safety net for residual cases; prevents arbitrary misuse |
| D55 | Admin-initiated cancellation deferred to future scope | Removed from Phase 2 |
| D56 | Pre-deposit disclosure at four mandatory points: pricing cards, booking Step 1, Draft Ready email, Pay to Unlock screen | Trust protection — user must understand platform fee ≠ total cost |
| D57 | Pre-deposit percentage not stated on website — referenced as "as per GST Act / CGST Act" | Avoids specific financial expectations against unknown disputed amounts |
| D58 | Admin communicates specific pre-deposit amount via booking notes field before user pays | Operational responsibility, not platform-enforced |

---

## 12. Final Context Summary

> **For a new AI session or new engineer: read KB1 first, then this section.**

This document records the second layer of project decisions for gstnoticesupport.in, building on KB1.

**Content gaps resolved:** Dummy content approved for company name, address, phone, email, testimonials, and case outcomes at launch. CIN, GSTIN, social URLs, and team credentials are absent (not placeholders) due to company registration status and CA regulatory constraints. T&C and Privacy Policy to be drafted by developer.

**Phase 1 structural decisions locked:** Service card CTAs go to Contact page. Calendly is a popup widget. CIN/GSTIN footer fields are absent until company is registered.

**PDF gating — locked:** Private S3 bucket. Signed URLs with 15-minute expiry for draft delivery. Draft viewer at `/dashboard/services/[id]/draft` generates fresh signed URL on load. Admin can re-upload draft while at `Draft Ready` status — replaces S3 object, sends update email, status unchanged. Re-upload locked at `Filing`.

**Razorpay — locked:** Razorpay Orders flow. Three-layer reliability: webhook with signature verification and idempotency (L1), payment verification page at `/payment/verify` (L2), admin "Mark as Paid" with Razorpay API confirmation (L3). Four outcomes from verification page: success, failed, inconclusive, tampered. Admin "Mark as Paid" is a new Phase 2 admin capability.

**Pre-deposit — locked:** Disclosure at four mandatory points. No percentage stated — referenced as "as per GST Act." Admin communicates specific amount via notes.

**Scope change:** Admin-initiated cancellation removed from Phase 2, deferred to future.

**Next discussion:** Tech stack selection — frontend framework, backend framework, database, auth strategy, hosting, ORM, PDF handling, deployment pipeline.

---

## Document Maintenance

- **Owner:** Project Lead / Technical Architect.
- **Update triggers:** When tech stack is decided; when Phase 2 design begins; when any locked decision is revised.
- **Versioning:** Bump version on every material change. Prepend a changelog at the top in future versions.
- **Relationship to KB1:** This document supplements KB1. Where decisions conflict, this document takes precedence. Both documents should be loaded together for full project context.

*End of document.*
