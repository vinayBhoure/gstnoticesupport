# GST Notice Support — Project Knowledge Base

> **Document Type:** Authoritative project memory for AI context loading and engineering onboarding
> **Version:** 1.0
> **Status:** Requirements locked. Tech stack discussion pending.
> **Last Updated:** Based on requirement analysis conversation, June 2026
> **Read this first:** This document is the single source of truth for the project. If anything in a future conversation contradicts this document, this document wins until explicitly updated.

---

## Table of Contents

1. Project Metadata
2. Product Vision & Business Context
3. Scope: Phase 1 vs Phase 2
4. Services Catalog & Pricing
5. User Roles & Permissions
6. Public Website Specification
7. Authentication Flow
8. User Dashboard Specification
9. Booking Flow
10. Service Status Lifecycle (State Machine)
11. Draft & Payment Flow
12. User-Initiated Cancellation
13. Account Deletion Rules
14. Admin Dashboard Specification
15. Notification Matrix
16. Confirmed Integrations
17. Design System (UI/UX Constraints)
18. Copy & Messaging Guidelines
19. Out of Scope (Future Phases)
20. Open Questions & Pending Decisions
21. Tech Stack Status
22. Risks & Edge Cases
23. Decision Log
24. Final Context Summary

---

## 1. Project Metadata

| Field | Value |
|---|---|
| Project Name | GST Notice Support |
| Domain | gstnoticesupport.in |
| Tagline | Your Trusted Partner for GST Litigation, Notices, Appeals & Tax Advisory Services |
| Client | Vishal Srivastava, Jabalpur, Madhya Pradesh |
| Developer / Vendor | Vinay Bhoure |
| Contract Date | 01-06-2026 |
| Total Project Cost | ₹40,000 |
| Amount Paid (at start) | ₹20,000 |
| Payment Schedule | 50% upfront / 25% at Phase 1 launch / 25% at Phase 2 launch |
| Payment Mode | UPI |
| Free Technical Support | 2 months post-launch |

### Project Timeline

| Phase | Dates |
|---|---|
| Requirement Analysis | 2 – 3 June 2026 |
| Website Designing | 3 – 6 June 2026 |
| Phase 1 Development | 7 – 12 June 2026 |
| Phase 1 Launch | 15 – 16 June 2026 |
| Phase 2 Development | 16 – 30 June 2026 |
| Testing | 1 – 4 July 2026 |
| Phase 2 Launch | 5 – 6 July 2026 |

### Validity & Terms (from quotation)
- Quotation valid for 30 days from contract date.
- Recurring third-party costs (AWS S3, email service, server after year 1, WhatsApp APIs) borne by the client.
- If project is cancelled between designing and testing phase, no refund of payment.
- 2 months free support after launch; paid maintenance available afterwards (6-month / yearly plans).

---

## 2. Product Vision & Business Context

### What Is GST Notice Support
A professional services platform that helps Indian businesses, CAs, and Advocates respond to GST notices, file appeals, and represent themselves before tax authorities. The platform is the digital front for an offline legal/CA practice.

### Mission (client-provided)
> To provide businesses with reliable, professional, and strategic GST litigation support while minimizing tax risks and ensuring complete compliance with evolving tax regulations.

### Vision (client-provided)
> To become India's most trusted GST litigation and tax advisory platform by delivering excellence, integrity, and value-driven professional services.

### Target Users (three personas)

| Persona | Mindset | Primary Fear | Decision Trigger |
|---|---|---|---|
| **Chartered Accountant (CA)** | Skeptical, trained to spot fake authority | "Will this platform embarrass me in front of my client?" | Visible credentials of experts + handled case volume |
| **Advocate** | Treats this as adjacent to their practice | "Is this team competent in GST tribunal procedure?" | Specialization claims + named experts with Bar registration |
| **Businessman / SME Owner** | Anxious, often non-technical, just received a notice | "Is this a scam? Will I lose more money?" | Process clarity + outcome proof + visible phone number |

### Audience Truths (design-relevant)
- Not impulse buyers — every conversion is a deliberate decision.
- They will Google the company. CIN, GSTIN, LinkedIn must be findable.
- They have been burned before — skepticism is the default.
- WhatsApp is their professional channel.
- They distrust startups — words like "revolutionary," "disrupt," "AI-powered" lower trust.

---

## 3. Scope: Phase 1 vs Phase 2

### Phase 1 — Marketing Website (Launch: 15-16 June 2026)
- Public marketing pages
- Calendly demo booking integration
- Contact Us form
- WhatsApp redirect button
- Email notifications for form/Calendly events
- SEO foundation
- Mobile responsive

**No authentication. No platform features. Pure lead generation site.**

### Phase 2 — Platform / Dashboard (Launch: 5-6 July 2026)
- User authentication (signup, login, OTP verification, forgot password)
- User dashboard
- Service booking workflow
- Document upload (PDF only, S3-backed)
- Admin dashboard
- Razorpay payment integration with webhook
- Email notifications across the booking lifecycle
- Account deletion mechanism

---

## 4. Services Catalog & Pricing

### Service List (4 platform-bookable + 1 consultation-only)

| # | Service Name | Price (INR) | Notes |
|---|---|---|---|
| 1 | GST Appellate Tribunal (GSTAT) Appeal | ₹14,999 | APL-05. Pre-deposit required (paid by client to government). |
| 2 | Commissioner Appeal | ₹9,999 | APL-01. Pre-deposit required (paid by client to government). |
| 3 | Show Cause Notice (SCN) Reply | ₹5,999 | DRC-01 / DRC-01A handling. |
| 4 | ASMT-10 Reply | ₹2,999 | Section 61 CGST Act scrutiny. |
| 5 | Representation before Tax Authority | Consultation-based | **Not bookable through platform.** Listed for awareness; handled offline. |

**Pricing display rule:** Exact pricing shown on the website (not "Fees from ₹X" indicative format).

### Pre-Deposit Charges (Government-Side)
- Applicable to **Service 1 (GSTAT Appeal)** and **Service 2 (Commissioner Appeal)**.
- Paid by user/client directly to the government.
- **Platform has zero involvement.** No tracking, no UI, no record on gstnoticesupport.in.
- Service fees shown on website are exclusively the professional fees — pre-deposit is separate.

### Documents Required per Service

#### Service 1 — GSTAT Appeal
- Show Cause Notice (SCN)
- SCN Reply
- Demand Order (OIO / Order of Adjudicating Authority)
- First Appeal & Order (OIA / Commissioner Appeal Order)
- Other relevant documents / Evidences

#### Service 2 — Commissioner Appeal
- Show Cause Notice (SCN)
- SCN Reply
- Demand Order (OIO / Order of Adjudicating Authority)
- Other relevant documents / Evidences

#### Service 3 — SCN Reply
- ASMT-10
- ASMT-10 Reply
- Show Cause Notice (DRC-01 & DRC-01A)
- Other relevant documents / Evidences

#### Service 4 — ASMT-10 Reply
- ASMT-10
- Other relevant documents / Evidences

### Service Delivery SLAs (client-stated)
| Metric | Commitment |
|---|---|
| Initial acknowledgment after document upload | Within 24 hours |
| Draft preparation and share | Within 48 hours |
| Full service completion | ~1 week |
| Callback/demo response | Within 24 hours |

> **CRITICAL:** Homepage must reflect what operations can actually deliver. If the team cannot consistently hit these SLAs, the SLA copy must be softened. Trust collapses faster than it is built.

### Payment & Refund Policy
- Full payment upfront. No EMI. No partial payment.
- **No refund policy.** Once paid, payment is non-refundable.
- Payment unlocks the prepared draft. No pay-before-document model.

---

## 5. User Roles & Permissions

### Role Model
- Two roles: `user` and `admin`.
- Default role on signup: `user`.
- Admin role is assigned **directly via the database** (no admin management UI).
- **Single admin only.** No multi-admin or sub-admin support.

### Permission Summary

| Action | User | Admin |
|---|---|---|
| Browse public website | ✅ | ✅ |
| Sign up / log in | ✅ | N/A |
| Book a service | ✅ | ❌ |
| Upload booking documents | ✅ | ❌ |
| Download own uploaded documents | ✅ | ❌ |
| View admin-added notes/summary | ✅ | ❌ |
| Pay for draft | ✅ | ❌ |
| Download/view paid draft PDF | ✅ | ❌ |
| Confirm draft after viewing | ✅ | ❌ |
| Cancel service (Draft Ready stage only) | ✅ | ❌ |
| Delete own account (with restrictions) | ✅ | ❌ |
| View all bookings (across users) | ❌ | ✅ |
| Download user-uploaded documents | ❌ | ✅ |a
| Upload prepared draft PDF | ❌ | ✅ |
| Add/edit notes on a booking | ❌ | ✅ |
| Change service status manually | ❌ | ✅ |
| Cancel any service | ❌ | ✅ |
| View dashboard analytics (overview page) | ❌ | ✅ |
| View all users (across users) | ❌ | ✅ |
| View user detail | ❌ | ✅ |
| Delete a user (soft; blocked on active booking) | ❌ | ✅ |
| Edit a user's profile | ❌ | ❌ (out of scope) |

---

## 6. Public Website Specification

### Page List (Phase 1)
1. Homepage
2. Service pages (one per service — at minimum 4)
3. Pricing page
4. About page
5. Contact page
6. FAQ page (or section on homepage)
7. Privacy Policy
8. Terms & Conditions

### Homepage Architecture (per Design Trust Blueprint v1.0)

| # | Section | Purpose |
|---|---|---|
| 1 | Sticky Navbar | Logo, services dropdown, About, Resources, Pricing, visible phone, Request Callback, Book Service |
| 2 | Hero (above the fold) | Headline naming the problem, subhead with solution + speed, dual CTA (Upload Notice / Request Callback), reassurance text |
| 3 | Notice Type Selector | 6-card grid (or 4 to match current services) of notice types |
| 4 | How It Works | 4-step horizontal flow |
| 5 | Expert Team | 3-card row with real photos + credentials |
| 6 | Case Outcomes / Results | Specific, anonymized case results |
| 7 | Trust & Security | 3-pillar layout (Encrypted, Regulated, Transparent) |
| 8 | Pricing | 3-tier card layout, "Most Popular" middle tier |
| 9 | Testimonials | Tabbed/segmented by audience (CA / Advocate / Business Owner) |
| 10 | FAQ | Accordion list, 8-10 questions |
| 11 | Final CTA Banner | Navy background, centered |
| 12 | Footer | Company details, CIN, GSTIN, address, links, grievance officer |

### Lead Capture Mechanisms (Phase 1)
1. **Calendly demo booking** — embedded. Both parties receive confirmation email. **No account is auto-created** from this flow.
2. **Contact Us form** — fields: name, email, phone, organization, question. Sends email notification to admin.
3. **WhatsApp button** — opens WhatsApp chat with the configured business number and a **predefined message**.
4. **"File Now / Reply Now" service card buttons** — redirect to login/signup page.

### Trust Signals to Display (mandatory)
- Company legal name in footer
- CIN in footer
- Company GSTIN in footer (your own business GSTIN — ironic but powerful)
- Full physical office address in footer
- Privacy Policy, Terms, (and the fact there is **no refund policy** must be disclosed transparently)
- Grievance officer name + email
- SSL certificate badge
- Phone number always visible (tap-to-call on mobile)

### Mobile-Specific Requirements
- Phone number visible in header or sticky bar at all times.
- WhatsApp floating button after first scroll.
- Sticky bottom bar with Call + Book Service buttons.
- "Take a Photo" upload option on mobile for documents.
- All tap targets ≥ 48px.
- Page load: FCP < 1.5s, LCP < 2.5s on 4G.

---

## 7. Authentication Flow

### Signup
1. User enters: **Name, Email, Password**.
2. Verification email sent via **Resend** with **OTP**.
3. User enters OTP to verify email.
4. User completes profile: **Phone Number, Services Interested**.
   - GSTN is **NOT** collected at signup.
   - Both fields are required.
5. User lands on dashboard (default role: `user`).

### Login
- Email + Password
- Lands on dashboard

### Forgot Password
- OTP-based reset (email)
- No password reset link approach

### Role Promotion
- Admin role is set **manually via direct database update**. No UI for role promotion or management.

### Security Notes
- Authentication should use industry-standard practices (TBD with stack decision).
- Sessions / JWT mechanism — TBD with stack decision.
- Password hashing — TBD with stack decision.

---

## 8. User Dashboard Specification

The dashboard has three logical areas:

### 8.1 Payment History
- Simple transaction table.
- Columns: Service Name, Amount, Payment Date, Transaction ID, Status.
- Only paid transactions appear. Cancelled or unpaid bookings do **not** appear here.
- No analytics, no charts — just a chronological table.

### 8.2 Book a Service
- All **4 services** always displayed regardless of what user marked "Services Interested" at signup.
- Each service card has a "Book Service" CTA that starts the booking flow.

### 8.3 Services Table
A table of all bookings made by the user.

| Column | Source |
|---|---|
| Service Name | Booking record |
| Booking Date | Booking creation timestamp |
| Updated At | Last status update timestamp |
| Payment Status | Pending / Paid |
| Current Status | One of: Document Upload, In Review, Draft Ready, Filing, Complete, Cancelled |

- Clicking a row opens the **Service Detail Page** (see Section 11).

### 8.4 Account Settings
- Account deletion option (with constraints — see Section 13).

---

## 9. Booking Flow

A multi-step flow with **progress tracking** UI (stepper or similar).

### Step 1 — Select Service
- 4 service cards.
- User picks one.

### Step 2 — Personal Information

| Field | Required | Notes |
|---|---|---|
| Name | ✅ | Re-entered every booking (no pre-fill from profile) |
| Email | ✅ | Same |
| Contact Number | ✅ | Same |
| GST Number | ✅ | The GSTN relevant to *this* case (could be client's GSTN if filing for client) |
| Organization Name | ✅ | Same |
| Filing For | ✅ | "Client" or "Self" — stored as DB field, **no flow difference** |

**Important:** No data is pre-populated from the user's account profile. User re-enters every time.

### Step 3 — Document Upload

Documents requested are **service-specific** (per Section 4).

**Constraints:**
- **PDF only**
- Maximum **8 files** per booking
- Maximum **5 MB** per file
- Maximum **40 MB** total upload
- "Other relevant documents / Evidences" is the optional/catch-all slot

### Step 4 — Submission
On submission:
- Booking record created.
- Status auto-set to **"Document Upload"**.
- Booking appears in user's Services Table.
- Email sent to **user and admin**.

### Re-upload / Mid-Service Document Sharing
- **Not supported in Phase 2.**
- If admin needs more documents, user must either:
  - Book a new service (fresh upload), OR
  - Share via WhatsApp/email outside the platform.
- Flagged as **future scope**.

---

## 10. Service Status Lifecycle (State Machine)

### States

| Status | Trigger | Triggered By |
|---|---|---|
| **Document Upload** | Booking submission | Automatic (system) |
| **In Review** | Admin opens and starts working on the case | Manual (admin) |
| **Draft Ready** | Admin uploads the draft PDF | Automatic (on upload) |
| **Filing** | Razorpay webhook confirms payment | Automatic (webhook) |
| **Complete** | Admin finishes government portal work | Manual (admin) |
| **Cancelled** | (a) Admin cancels manually, OR (b) User cancels at Draft Ready stage before payment | Manual (admin or user) |

### State Transition Diagram (textual)

```
[Document Upload]
       │ (admin starts work)
       ▼
   [In Review]
       │ (admin uploads draft)
       ▼
  [Draft Ready] ──(user clicks Cancel Service)──► [Cancelled]
       │
       │ (user pays via Razorpay → webhook fires)
       ▼
     [Filing]
       │ (admin completes government portal work)
       ▼
   [Complete]

(Admin can transition any non-terminal state to Cancelled at any time.)
```

### Status Reflection
- All status changes reflect on **both user and admin** sides immediately.
- Status changes trigger emails per the Notification Matrix (Section 15).

---

## 11. Draft & Payment Flow

This is the **most critical and unique mechanic** in the product. The draft is the gated artifact behind which conversion happens.

### Service Detail Page (User View)

When user clicks a booking from the Services Table, they see:

- All personal information submitted at booking
- All documents uploaded at booking (downloadable list — no in-platform PDF viewer)
- Current status
- Admin notes/summary (text, when available)
- **At Draft Ready stage:**
  - Locked draft placeholder (NOT a blurred preview — a fully blocked view)
  - Admin's text notes/summary visible
  - **"Pay to Unlock"** button
  - **"Cancel Service"** button (with confirmation dialog)
- **After payment (Filing stage):**
  - **"Confirm Draft"** button
  - Link to draft PDF (opens on separate page)

### Draft PDF Viewing (Post-Payment)

- Draft opens on a **separate blank page** with in-browser PDF view.
- Download button also available.
- Route concept (TBD): `/dashboard/services/[id]/draft`.
- This separate-page viewer is **Phase 2 scope** — finer routing/viewer behaviour to be confirmed during build.

### Full Lifecycle (Step-by-Step)

1. **User submits booking** → status: `Document Upload` → emails to user + admin.
2. **Admin reviews documents** → manually sets status to `In Review` → email to user.
3. **Admin prepares draft offline, uploads PDF + adds notes** → status auto-set to `Draft Ready` → email to user.
4. **User opens service detail page** and sees:
   - Locked draft (cannot view PDF yet)
   - Admin notes/summary (readable text)
   - Two CTAs: **Pay to Unlock** and **Cancel Service**
5. **User decides:**
   - **Path A — Pay:** Razorpay flow → webhook confirms payment → status auto-set to `Filing` → draft unlocks → emails to user + admin.
   - **Path B — Cancel:** Confirmation dialog → status set to `Cancelled` → emails to user + admin.
6. **If paid:** User views/downloads the draft from the separate page.
7. **User clicks "Confirm Draft"** → admin notified (email).
8. **Admin files on the government portal** independently. **Platform has no involvement** in the government filing step.
9. **Pre-deposit (if applicable)** is paid by the user directly to the government. Outside the platform.
10. **Admin marks status `Complete`** manually → email to user.

### Critical Conversion Mechanic
- The draft is the proof of competence.
- The user reads admin's notes/summary → develops trust → pays → unlocks PDF.
- This is essentially a **freemium proof-of-work** model adapted for legal services.

---

## 12. User-Initiated Cancellation

### When User Can Cancel
- **Only at the `Draft Ready` stage**, before payment.
- **NOT** at Document Upload or In Review stages.
- **Reason:** Cancellation before draft preparation would attract non-serious users wasting admin effort.

### Cancellation Flow
1. User clicks **"Cancel Service"** on service detail page.
2. Confirmation dialog appears: *"Are you sure you want to cancel this service? This action cannot be undone."*
3. User confirms.
4. Status set to `Cancelled`.
5. Email sent to **user and admin**.
6. Cancelled booking remains visible in user's Services Table.

### Post-Cancellation Behaviour
- User **can re-book** the same service immediately as a fresh booking. Nothing blocks them.
- The cancelled booking has **no payment entry** in payment history (since no payment occurred).

### Admin-Initiated Cancellation
- Admin can cancel **at any stage**.
- Triggers email to user (not to admin themselves).

---

## 13. Account Deletion Rules

### When Delete is Allowed
- User has **never booked any service**, OR
- **All booked services are in `Complete` or `Cancelled` status**.

### When Delete is Blocked
- Any service is in an active state: `Document Upload`, `In Review`, `Draft Ready`, or `Filing`.
- Delete button is **visible but disabled**.
- A **reason/message** is shown explaining why deletion is blocked (e.g., "You have 1 active service. Account can only be deleted once all services are completed").

### Delete Confirmation
- When allowed, user is asked to **type their own valid email address** to confirm.
- Simple **string match** against account email — no OTP, no re-authentication, no password.
- On match → account deleted.

### Data Handling on Deletion
- **TBD:** Should personal data be hard-deleted or soft-deleted? Should documents be retained for legal/compliance reasons? See Open Questions (Section 20).

### Admin-Initiated User Deletion (Users page)
- Allowed only when the user has no active booking (Document Upload / In Review / Draft Ready / Filing) — same block as self-deletion.
- When blocked: delete control visible but disabled, reason shown.
- When allowed: admin types the TARGET user's email to confirm (string match, no OTP).
- Soft delete (HLD §7.4): user flagged deletedAt; bookings + payment records retained; S3 docs hard-deleted after 7 days.

---

## 14. Admin Dashboard Specification

### Pages

#### 14.1 Overview Page
Dashboard analytics showing:
- Total bookings (overall + by service type)
- Bookings by status (with counts)
- Revenue collected (from paid bookings)
- (Granularity, time filters, exports — TBD)

#### 14.2 Bookings List
Master table of all bookings across all users.

Columns: User Name, Service, Booking Date, Current Status (and likely Payment Status). Should support filtering/sorting (TBD).

#### 14.3 Booking Detail Page
When admin opens a booking:
- View user's personal information submitted at booking
- Download each uploaded document
- Add / edit **notes/summary** text (visible to user on their service detail page)
- **Upload prepared draft PDF** (PDF only; this upload auto-triggers status → `Draft Ready`)
- Manually change status to: `In Review`, `Complete`, `Cancelled`
- Status to `Draft Ready` is automatic on draft upload; `Filing` is automatic on payment webhook

### What Admin CANNOT Do
- Send in-platform messages to user (no messaging system).
- Edit user's profile or booking submitted data.
- Modify the user's uploaded documents (only download).
- Add additional admins.

### Out-of-Platform Communication
- All admin↔user communication beyond platform notes happens via **WhatsApp or email**.

---

## 15. Notification Matrix

All notifications are **email-based** (via **Resend**).

| Event | User | Admin |
|---|---|---|
| New booking submitted | ✅ | ✅ |
| Status changed: → `In Review` | ✅ | — |
| Status changed: → `Draft Ready` (draft uploaded) | ✅ | — |
| Payment confirmed (via webhook) | ✅ | ✅ |
| User cancels service | ✅ | ✅ |
| Admin cancels service | ✅ | — |
| Status changed: → `Complete` | ✅ | — |
| Calendly demo booked | ✅ (host) | ✅ (admin/host) |
| Contact Us form submitted | — | ✅ |
| Signup email verification (OTP) | ✅ | — |
| Forgot password OTP | ✅ | — |

### WhatsApp Notifications
- **Not in scope.** Only a WhatsApp **redirect button** with a predefined message on the public site (and possibly dashboard) is in scope.
- Automated WhatsApp messaging is **future scope**.

---

## 16. Confirmed Integrations

| Integration | Purpose | Status |
|---|---|---|
| **Razorpay** | Payment gateway. Webhook used to confirm payment and auto-transition status to `Filing`. | Confirmed |
| **Resend** | Transactional emails: OTP verification, forgot password, all notifications. | Confirmed |
| **AWS S3** | Document and draft PDF storage. | Confirmed (per dev doc) |
| **Calendly** | Demo / consultation booking on public site. | Confirmed |
| **WhatsApp (redirect only)** | Click-to-chat button with predefined message. No API automation. | Confirmed |
| **Google Business Profile** | Not currently held by client; can be added later. | Not yet available |

### Recurring Costs Borne by Client
- AWS S3 bucket
- Email service charges
- Server costs after year 1
- WhatsApp APIs (if added later)
- Domain renewal

---

## 17. Design System (UI/UX Constraints)

The design follows the **gstnoticesupport Design Trust Blueprint v1.0** which is the authoritative design source. Highlights only here.

### Color Palette (locked)

| Token | Hex | Use |
|---|---|---|
| `--primary-navy` | `#0A2540` | Headings, navbar, primary text |
| `--primary-deep-blue` | `#1B3A6B` | Section backgrounds |
| `--accent-green` | `#0B8B4E` | Primary CTAs, success states |
| `--accent-green-hover` | `#0A7A45` | CTA hover |
| `--warning-amber` | `#D97706` | Deadline / attention |
| `--neutral-white` | `#FFFFFF` | Background |
| `--neutral-50` | `#F7F9FC` | Alternating section bg |
| `--neutral-200` | `#E5E9F0` | Borders, dividers |
| `--neutral-600` | `#5A6878` | Secondary body text |
| `--neutral-900` | `#0F172A` | Primary body text |

### Forbidden Colors
- Pure red (`#FF0000`) — tax-error/danger associations
- Bright yellow (`#FFEB00`) — discount/sale associations
- Neon / saturated colors — startup-coded, breaks credibility
- Black backgrounds — reads as crypto/trading scam aesthetic

### Typography
- Heading: Inter / Manrope (700)
- Body: Inter (400)
- Mono: JetBrains Mono (for CIN, GST registration numbers)
- **Forbidden:** Script, decorative, condensed, slab serifs

### Spacing
- 8px base grid.
- Minimum 80px vertical between major sections (desktop), 48px (mobile).

### Border Radius
- Cards: 12px | Buttons: 8px | Inputs: 8px | Badges: 6px
- No pill shapes (too consumer-app).

### Iconography
- Outline icons, 1.5px stroke (Lucide, Phosphor, or Tabler).
- No 3D, no gradient, no emoji-as-UI.

### Forbidden UI Patterns
- Scrolling tickers for testimonials/awards
- Countdown timers / fake urgency
- "X people viewing now" widgets
- Pop-ups within first 30 seconds
- Stock photos of Western businesspeople
- Auto-play videos with sound
- Guarantee language ("Guaranteed win")
- Chatbots without human handoff

### Reference Patterns (replicate / avoid)
- **Replicate:** ClearTax (segmented testimonials, security section), Zerodha (restraint, anti-dark-pattern pledge, static logo strip).
- **Avoid:** ClearTax's overloaded navbar; Zerodha's lack of "How it works"; StableMoney's marketing-section disclaimers.

---

## 18. Copy & Messaging Guidelines

### Voice
- Senior CA explaining to a respected peer or anxious client.
- Authoritative but not condescending. Technical when needed.

### Power Words (USE)
Resolved · Drafted · Filed · Represented · Defended · Confidential · Encrypted · ICAI-registered · Bar Council-enrolled · Pan-India · Within [X] hours · Section [X] of CGST Act

### Power Words (AVOID)
Revolutionary · Disruptive · Game-changing · Best-in-class · AI-powered · Easy · Hassle-free · Guaranteed · Cheapest · Affordable

### CTA Hierarchy

| Strength | Copy |
|---|---|
| Highest commitment | "Book Litigation Service" |
| High commitment | "Upload Your Notice" / "File Now" / "Reply Now" |
| Medium commitment | "Request Callback" |
| Low commitment | "Chat on WhatsApp" |
| Browse | "View Case Outcomes" |

### Anxiety-Reducing Phrases (reuse throughout)
- "Free initial case review"
- "Your documents are confidential and encrypted"
- "We handle all communication with the department"
- "Fixed fee — no hidden charges"
- "Track your case progress anytime"

### Mandatory Disclaimers (client-provided)
- Client must provide timely and accurate documents.
- Not responsible for delays caused by government portal downtime (GSTN, Income Tax, MCA).
- No guaranteed outcome — subject to decisions of concerned authorities.
- Government fees, penalties, taxes separate from professional fees.
- All client information kept strictly confidential.
- Compliance with statutory deadlines remains client's responsibility.
- Liability limited to professional fees paid for the specific engagement.
- Website content is general guidance, not legal/tax advice.
- Force majeure clause: not liable for delays beyond our control.

---

## 19. Out of Scope (Future Phases / Post-Deployment)

| Feature | Phase | Notes |
|---|---|---|
| Re-upload documents mid-service | Future | Must create new booking or share via WhatsApp/email |
| In-platform messaging (admin ↔ user) | Future | All comms via WhatsApp/email currently |
| Multiple admin accounts | Future | Single admin only |
| WhatsApp API automation | Future | Only redirect button currently |
| Hindi / regional language toggle | Future | English-only at launch |
| EMI / partial payments | Future | Full upfront only |
| Refunds | Future | No refund policy at launch |
| Draft PDF dedicated route polish | Phase 2 (build-time refinement) | Separate page concept confirmed; route specifics TBD |
| Final filed document delivery on platform | Future | User gets only "Complete" email |
| Google Business Profile + map embed | Future | Client doesn't have GBP yet |
| Testimonials / Case Studies | Future | Client has none to provide at launch |

---

## 20. Open Questions & Pending Decisions

### Confirmed Closed (no more discussion needed)
All product requirements are locked per the conversation. The remaining open items are:

### O1 — Tech Stack
- **Frontend framework:** TBD (React / Next.js / other — to be discussed)
- **Backend framework:** TBD
- **Database:** TBD
- **Authentication library / approach:** TBD
- **PDF lock/unlock implementation strategy:** TBD (signed URLs vs proxy serving vs DB-flag gated download)
- **Hosting / deployment:** TBD (the dev doc mentions general server setup)
- **CI/CD:** TBD

> **Explicit note:** Tech stack discussion was deferred by the client. Do not assume Next.js, do not assume Express, do not assume Postgres. Wait for client direction.

### O2 — Data Handling on Account Deletion
- Should user records be **hard-deleted** or **soft-deleted**?
- Should uploaded documents and drafts be retained for legal/audit reasons?
- Should admin be able to retrieve a deleted user's records?
- No client decision yet. Recommend bringing this up before Phase 2 build.

### O3 — Admin Notes Format
- Plain text only? Or rich text / markdown?
- Multi-paragraph supported? Length limit?
- TBD.

### O4 — Overview Page Granularity (Admin)
- Time filters needed (last 7 days / month / custom range)?
- Export to CSV?
- Specific KPIs beyond "total bookings, by status, revenue"?
- TBD.

### O5 — Service Detail Page UI Specifics
- How is the locked draft visually represented? Padlock icon? Greyed thumbnail? Banner with "Pay to view"?
- Confirmed: **NOT a blurred preview**. It is a fully blocked view.
- Exact visual TBD with design phase.

### O6 — Email Template Design
- Plain text vs HTML templates?
- Branding within emails?
- TBD with design phase.

### O7 — Webhook Failure Handling
- If Razorpay webhook fails or is delayed, what is the fallback?
- Should there be a manual "Mark as Paid" admin action?
- TBD.

### O8 — Concurrency Edge Cases
- What if admin cancels a service at the exact moment the user pays?
- What if user attempts to cancel while admin is in the middle of uploading the draft?
- Race conditions need consideration during build.

### O9 — Calendly Integration Specifics
- Embed style: inline embed, pop-up widget, or redirect?
- TBD.

### O10 — Team Page Content
- Client has not provided team names, photos, or registration numbers.
- The Design Trust Blueprint says this is **critical for credibility**.
- Either: (a) client provides this before launch, or (b) launch without team section (weakens trust), or (c) use placeholders with "Coming Soon."
- **Decision pending client.**

### O11 — Testimonials & Case Outcomes
- Client confirmed no testimonials or case studies currently available.
- Launching without these weakens trust per blueprint.
- **Decision pending client.**

### O12 — Company Legal Details for Footer
- Need: Company legal name, CIN, GSTIN, full office address, grievance officer name + email.
- Not yet provided.

### O13 — Logo & Brand Guidelines
- Client indicated "Yes" they have a logo (in questionnaire).
- Logo file / brand guidelines need to be received.

### O14 — Mobile Numbers (A and B)
- Questionnaire asked for primary mobile for WhatsApp (A) and primary mobile for Contact display (B).
- Both fields were left blank in the questionnaire.
- **Required before public site launch.**

### O15 — Email Address for Website Inquiries
- Left blank in questionnaire.
- **Required before launch.**

### O16 — Physical Office Address
- Left blank in questionnaire.
- **Required for footer (trust signal).**

### O17 — Social Media URLs
- Facebook, Instagram, LinkedIn checked in questionnaire, but URLs not provided.
- **Required.**

---

## 21. Tech Stack Status

> **THIS SECTION IS DELIBERATELY EMPTY OF DECISIONS.**

The client explicitly requested no tech stack be fixed at this stage. The conversation closed on the product definition level. Next conversation will discuss stack options.

What we know:
- Razorpay is the payment gateway (with webhook).
- Resend is the email service.
- AWS S3 is the file store.
- Calendly is the demo booking tool.

Everything else — frontend framework, backend framework, database, auth strategy, hosting, ORM, validation library, file upload mechanism, PDF generation/handling, deployment pipeline — **is undecided**.

The Vinay Bhoure dev doc mentions general patterns (server setup, API development, authentication) but doesn't fix a specific stack.

> **Do not assume a stack. Ask first.**

---

## 22. Risks & Edge Cases

### Risk: Trust Architecture Collapse from SLA Misses
The homepage promises 24-hour acknowledgment, 48-hour drafts, 1-week completion. If operations cannot consistently hit these, the entire trust architecture collapses. Surface this risk to client before launch.

### Risk: Missing Team Section
Design blueprint says team faces + credentials are non-negotiable for the target audience. Launching without team data weakens conversion significantly.

### Risk: No Testimonials at Launch
Mitigations: lead with stats (notice volume, disputed amount, response time), use "We are a new specialist firm" framing rather than fake testimonials.

### Risk: Webhook Failure
Razorpay webhook must be highly reliable. Need failure handling: retry queue, manual admin override, payment reconciliation.

### Risk: Document Upload Limits
8 files / 5MB each / 40MB total — if a real GST notice case has more documents, user is blocked. Mitigations: ZIP support, second-stage upload, or admin-side request via WhatsApp.

### Edge Case: User Pays Then Immediately Cancels Email Account
The "Confirm Draft" button assumes user is reachable by email. If they delete account before confirming, the service hangs. (Account deletion is blocked while service is active — so this is mostly handled, but worth noting.)

### Edge Case: Admin Uploads Wrong Draft
Once uploaded, status auto-transitions to Draft Ready and user gets email. Admin needs a way to **re-upload / replace** the draft before user pays. **TBD** — not explicitly discussed.

### Edge Case: User Pays Twice
If user double-clicks Pay or webhook fires twice, idempotency required at booking level.

### Edge Case: Pre-deposit Confusion
User may confuse the platform's professional fee with the pre-deposit. Clear copy is required wherever fees are mentioned to disambiguate.

### Edge Case: GSTN Validation
GST Number entered during booking — is it validated server-side against a real GSTIN format? **TBD.**

---

## 23. Decision Log

Chronological log of confirmed product decisions made during the requirement analysis conversation.

| # | Decision | Rationale |
|---|---|---|
| D1 | Phase 1 = marketing site only; Phase 2 = full platform | Per dev doc and client confirmation |
| D2 | Calendly booking does **not** auto-create accounts | Client explicit |
| D3 | Service card CTAs redirect to login/signup | Client explicit |
| D4 | Signup requires phone + services interested (not GSTN) | Client explicit |
| D5 | GSTN is collected per-booking, not per-user | Client explicit |
| D6 | OTP-based email verification (Resend) and forgot password | Client explicit |
| D7 | Single admin role, set via DB only | Client explicit |
| D8 | All 4 services shown to all users on dashboard | Client explicit |
| D9 | Booking personal info is re-entered every time (no pre-fill) | Client explicit |
| D10 | Document upload constraints: PDF, 8 files, 5MB/file, 40MB total | Client explicit |
| D11 | Draft is fully blocked (not blurred) until payment | Client explicit |
| D12 | Razorpay webhook auto-transitions to Filing status and unlocks PDF | Client explicit |
| D13 | Confirm Draft button exists in-platform | Client explicit |
| D14 | All admin↔user communication outside platform (WhatsApp/email) | Client explicit |
| D15 | Pre-deposit fully external; platform doesn't track | Client confirmed |
| D16 | No refund policy | Client explicit |
| D17 | Full payment upfront, no EMI, no partial | Client explicit |
| D18 | User can only cancel at Draft Ready stage (before payment) | Client rationale: deter non-serious users |
| D19 | Admin can cancel at any stage | Client explicit |
| D20 | Cancellation triggers email to user and admin | Client explicit |
| D21 | After cancellation, user can re-book the same service | Client explicit |
| D22 | Cancelled bookings have no payment-history entry | Client explicit |
| D23 | Account deletion blocked while any service is active | Client explicit |
| D24 | Account deletion requires typing email — no OTP | Client explicit |
| D25 | Re-upload mid-service is out of scope (future) | Client explicit |
| D26 | Draft PDF opens in separate blank page | Client explicit |
| D27 | Final filed document is NOT delivered on platform — email only | Client explicit |
| D28 | Admin draft upload is PDF only | Client explicit |
| D29 | Admin overview page shows total bookings, statuses, revenue | Client explicit |
| D30 | No in-platform messaging | Client explicit |
| D31 | WhatsApp is redirect-only, no API automation | Client explicit |
| D32 | Pricing display: exact prices shown (not "Fees from ₹X") | Client explicit |
| D33 | "Representation before Tax Authority" is consultation-based, NOT bookable through platform | Client explicit |

---

## 24. Final Context Summary

> **For a new AI session or new engineer: read this section first.**

**Project:** gstnoticesupport.in — a two-phase GST litigation platform for Indian businesses, CAs, and Advocates.

**Phase 1 (June 15-16, 2026):** A trust-first marketing website with Calendly booking, Contact Us form, and WhatsApp redirect. No accounts. Lead generation only. Service card CTAs ("File Now / Reply Now") redirect to login/signup (which is itself Phase 2 functionality, so likely a placeholder or coming-soon page until Phase 2 lands).

**Phase 2 (July 5-6, 2026):** Full platform with user signup (OTP via Resend), 4 bookable services, document upload (PDF, 8 files, 5MB each, 40MB total to AWS S3), admin dashboard, Razorpay payment with webhook, and a unique **draft-gated payment model**.

**The Core Mechanic:** A user books a service → uploads documents → admin manually reviews and uploads a prepared draft PDF → user sees the draft is locked but reads admin's text notes/summary → user either **pays via Razorpay** (auto-unlocks PDF, status → Filing) or **cancels** (Draft Ready stage only) → after payment user clicks "Confirm Draft" → admin files on government portal independently → admin marks Complete. Pre-deposit charges (for GSTAT and Commissioner Appeal services) are paid by the user directly to the government, outside the platform.

**Services & Prices:**
- GSTAT Appeal: ₹14,999
- Commissioner Appeal: ₹9,999
- SCN Reply: ₹5,999
- ASMT-10 Reply: ₹2,999
- Representation: consultation-based (not bookable on platform)

**Status Lifecycle:** `Document Upload → In Review → Draft Ready → Filing → Complete` with `Cancelled` as a terminal off-ramp. Auto-transitions: Document Upload (booking submit), Draft Ready (admin uploads draft), Filing (Razorpay webhook). Manual transitions: In Review, Complete, Cancelled.

**Roles:** Single admin (set via DB) and many users. Default signup role is `user`.

**Notifications:** Email-only via Resend. WhatsApp is redirect-button only — no automation.

**Communication:** All admin↔user contact happens **outside the platform** (WhatsApp/email). No in-platform messaging.

**Account Deletion:** Allowed only when no active services. Confirmed by typing own email — no OTP.

**Payment:** Full upfront. No refunds. No EMI. Pre-deposit (gov charges) handled by user directly with government, outside the platform.

**Tech Stack:** **Not yet decided.** Confirmed integrations: Razorpay (payment + webhook), Resend (email), AWS S3 (file storage), Calendly (demo booking). Framework/database/auth library/hosting all pending discussion.

**Design Constraints:** Navy + green + neutral palette only. No red, no neon, no startup language. The audience is skeptical Indian professionals — restraint signals confidence; specificity beats superlatives; humans (team faces) matter more than features.

**Known Gaps Before Launch:**
- Team data (names, photos, registration numbers) — not yet provided by client.
- Testimonials — none available.
- Logo, brand guidelines — to be received.
- Office address, contact mobile numbers (A and B), inquiry email, social URLs — left blank in questionnaire.

**Most Critical Risk:** Operations must hit the 24h / 48h / 1-week SLAs promised on the homepage. If they cannot, the trust architecture collapses and the entire conversion model breaks. This is a business risk, not a technical one.

---

## Document Maintenance

- **Owner:** Project Lead / Technical Architect.
- **Update triggers:** When client confirms tech stack; when launch-blockers (team data, testimonials, etc.) are resolved; when scope changes occur; after each phase launch.
- **Versioning:** Bump version on every material change. Prepend a changelog at the top in future versions.

*End of document.*
