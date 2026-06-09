# components.md — Shared Component Prompts

> Specified once. Screen prompts reference these by name (`components.md → Navbar`) and never restate them.
> Inherits all tokens, motion, and a11y rules from `design.md`. Copy below is exact placeholder copy — use verbatim unless a screen overrides it.
> Do not introduce components, colors, or motion outside this file or `design.md`.

---

## Buttons

| Variant | Visual | Use |
|---|---|---|
| Primary | filled `--accent-green`, white text, 8px radius, 14px vertical padding | main conversion ("Book Service", "Upload Your Notice") |
| Secondary | outline `--primary-navy`, navy text, transparent fill | lower-commitment ("Request a Callback", "Learn More") |
| Tertiary | text + arrow, no border | inline links |
| Phone | icon + number, outline | always-visible contact |
| WhatsApp | filled WhatsApp-green, icon + "Chat on WhatsApp" | sticky / evaluation channel |

States required on all: default, hover (`--accent-green-hover` for primary), focus (visible ring), active, disabled. Never two primary buttons adjacent. Min height 48px.

---

## Navbar (public, sticky)

LAYOUT (left → right): Logo · `Services` dropdown (notice types) · `About` · `Resources` · `Pricing` · Phone (tap-to-call) · `Request Callback` [Secondary] · `Book Service` [Primary].
- Sticky; reduced height after scroll begins. Max 5 nav items excluding CTAs.
- Phone number always visible (desktop + mobile).
RESPONSIVE: <lg collapses links into a drawer; logo + tap-to-call phone + hamburger remain in header.
COPY: nav labels exactly `Services` / `About` / `Resources` / `Pricing`; CTAs `Request Callback`, `Book Service`.

---

## App Shell (authenticated — sidebar)

Persistent left sidebar (≥lg), main content fills remaining width. Header strip: logo, tap-to-call phone, account menu.
- **User sidebar links:** `Dashboard` (/dashboard) · `My Services` (/dashboard/services) · `Payments` (/dashboard/payments) · `Settings` (/dashboard/settings).
- **Admin sidebar links:** `Overview` (/admin) · `Bookings` (/admin/bookings) · `Settings` (/admin/settings).
RESPONSIVE: <lg sidebar → slide-in drawer via header hamburger. Admin: minimal fallback only (drawer + scrollable/stacked tables).
STATES: active link highlighted; collapsed drawer (mobile) defaults closed.

---

## Footer (public)

4-column desktop / single stacked mobile.
- **Company:** legal name · CIN (mono) · company GSTIN (mono) · full office address.
- **Services:** all notice-type links · `Pricing`.
- **Resources:** `GST Notice Guides` · `Blog` · `FAQ`.
- **Contact:** phone (tap-to-call) · email · WhatsApp button · grievance officer name + email.
- **Bottom strip:** `Privacy Policy` | `Terms` | `Refund Policy` · SSL badge · `© 2026 [Company Name]. All rights reserved.`
TRUST: this component carries the mandatory legal-identity signals (design.md §6).

---

## Sticky Mobile Bottom Bar

Visible on scroll, ≤64px tall. `Call Now` [Phone/outline] · `Book Service` [Primary] · WhatsApp icon (far right). Must not obscure form fields when keyboard is open.

---

## WhatsApp Floating Button

Fixed bottom-right, appears after first scroll (mobile). Opens WhatsApp chat with the configured number + predefined message. Redirect only — no in-app chat.

---

## Notice Type Selector Card

Outline icon · notice name (heading) · 1-line description · `Get help →` link.
- Whole card clickable. Hover: border → `--accent-green`, subtle `--shadow-sm`. Recently-viewed: light green tint.
COPY example: title `Show Cause Notice (SCN)`, desc `Section 74 demand notices — we draft and file responses`.

---

## Process Step Card

Circular number badge (`01` format) · outline icon · step title · 1-sentence description. Identical structure across a flow; connector line between steps on desktop.

---

## Expert Profile Card

3:4 portrait (real photo, neutral backdrop) · full name (heading) · credential line · specialization (`--neutral-600`, smaller) · ICAI/Bar number (mono) · LinkedIn icon link. No avatars, no stock, no casual poses.

---

## Numerical Stat Card

Large number (48–64px display weight) over descriptor. Use `+` notation, not vanity round numbers.
COPY examples: `500+` / `GST Notices Resolved` · `₹50 Cr+` / `Disputed Amount Defended` · `24 hrs` / `Average Initial Response`.

---

## Trust Badge

Outline neutral icon · single short claim · optional `Verify ↗` link. Max 4 per row. Only display certifications actually held. Group institutional badges separately from social proof.

---

## Testimonial Card

Large subtle quote mark (`--neutral-200`) · quote (≤3 lines, specific not emotional) · divider · 48px circular photo · name + designation + city.
RESPONSIVE: horizontal swipe on mobile (never vertical stack, never auto-scrolling ticker).

---

## Document Upload (highest-stakes component)

- Desktop: drag-and-drop zone. Mobile: `Take a Photo` (primary) + `Choose File`.
- Constraints line: `PDF only · max 8 files · 5 MB each · 40 MB total`.
- Privacy reassurance directly below: `Your documents are confidential and never shared.`
- File preview list with delete; visual upload progress.
- On success → confirmation with case reference number.
MOTION: upload-confirmation (design.md §5.2) — file icon slide → checkmark.
STATES: empty · uploading (progress) · success (preview + reference) · error (specific message, file retained for retry) · over-limit (block + reason).

---

## Stepper / Progress Indicator

Used by the booking flow. Numbered steps with current/complete/upcoming states; connector line between.
MOTION: 300ms ease-out transition between steps (design.md §5.1).

---

## Pay-to-Unlock → Draft Reveal

Locked draft state shows lock icon + `Pay to Unlock` [Primary]; pre-deposit line item shown separately where applicable (Services 1 & 2). On payment confirmed → unlocked state with `Confirm Draft` [Primary].
MOTION: lock → unlocked transition (design.md §5.3).
COPY: pre-deposit shown as its own line, referenced as "as per GST Act" (never a percentage, never a footnote).

---

## Final CTA Section (public)

Full-width `--primary-navy` banner, centered. Headline `Don't Let a GST Notice Become a Bigger Problem` · subhead `Get expert legal support within 24 hours.` · `Book Litigation Service` [Primary] · `Request Callback` [Secondary] · phone below CTAs.

## Auth Card Shell

Full-viewport `--neutral-50` background. Card centered horizontally + vertically: `--neutral-white`, 12px radius, `--shadow-md`, max-width 440px, padding `--space-6` (48px) desktop / `--space-5` (32px) mobile. Near-full-width on mobile with 16px side padding.

Card header (top, centered): company wordmark in `--primary-navy`.
Card body: H2 heading · one-line subhead (`--neutral-600`) · single-column form content.
Below card: slim trust strip — company legal name · SSL badge · `Privacy Policy` · `Terms` (`--neutral-600`, small). NOT the public Footer component.

RESPONSIVE: identical layout both breakpoints; max-width caps desktop, side padding governs mobile.
MOTION: none. No entrance animation.
STATES: all form error/loading/success states render within the card — card does not shift or re-layout.

---

## OTP Input

Six single-digit boxes in a row. Each box: `--neutral-white` fill, 1px `--neutral-200` border, 8px radius, ≥48px tall, `--primary-navy` text, mono-width spacing.
Focus state: border → `--accent-green`, no glow. Error state: border → `--warning-amber` on all boxes + error message below.
Paste support: distributes across boxes automatically. `inputmode="numeric"`, `autocomplete="one-time-code"`. Whole group has one accessible label; error text programmatically tied to the group.
STATES: empty · partially filled · filled (ready to submit) · error (incorrect/expired) · disabled (rate-limit lockout).

---

## Form Field Primitives

Rules apply to all auth and booking forms. Governed by `design.md §3` interaction rules.

**Input (text / email / password / tel)**
Label above field (Inter 500, 14px, `--neutral-900`). Field: `--neutral-white`, 1px `--neutral-200` border, 8px radius, 48px min-height, 16px body text. States: default · focus (border `--accent-green`) · error (border `--warning-amber`, error message below in `--warning-amber`, 14px) · disabled. Password inputs include a show/hide toggle (eye icon, accessible label). Phone inputs: `+91` prefix visible, `inputmode="tel"`.

**Checkbox**
16px box, 8px radius, `--accent-green` fill when checked, outline `--neutral-200` when unchecked. Label 16px to the right, tap target ≥48px. Required checkboxes: error message below if submitted unchecked.

**Multi-Select (checkbox group)**
Labeled group heading (Inter 500, 14px). Each option: full-width row, checkbox left + label right, 48px min tap target, `--neutral-50` background on hover. Error: group-level message below if none selected on submit.

---

## Mobile Bottom Tab Bar (authenticated)

Fixed bottom navigation bar. Visible on all authenticated screens at <lg breakpoint EXCEPT
the focused booking flow (steps 1–3).

- Coexists with App Shell header (logo + tap-to-call + hamburger). Does NOT replace the drawer
  — the drawer narrows to: account menu, logout, WhatsApp, help/legal. Primary nav lives
  exclusively in the tab bar on mobile.
- Tabs (left → right): `Dashboard` (/dashboard) · `My Services` (/dashboard/services)
  · `Payments` (/dashboard/payments) · `Settings` (/dashboard/settings).
- Each tab: Lucide outline icon (24px) + label (12px, --neutral-600). Active: icon + label
  → --primary-navy, weight 500. Indicator: filled icon variant or 2px --accent-green underline
  on active tab.
- Bar: height 64px · background --neutral-white · top border --neutral-200 · --shadow-sm.
- Must not overlap form fields when keyboard is open (keyboard-aware layout).
STATES: default · active · disabled (if route inaccessible).

---

## Service Status Badge

Inline pill label showing a booking's lifecycle status. Used on: dashboard home cards, services
list (table rows + mobile cards), service detail header, payment history rows.

- Sizing: 14px / weight 500 / 6px radius / padding 10px horizontal 4px vertical / min-height 24px.
- Always pair with a Lucide outline icon (16px) — never rely on color alone (design.md §7).
- Status → token mapping:

  Document Upload  | bg --neutral-50        | text --neutral-900  | icon file-text
  In Review        | bg --primary-deep-blue | text --neutral-white | icon search
  Draft Ready      | bg --warning-amber     | text --neutral-900  | icon alert-circle
  Filing           | bg --primary-navy      | text --neutral-white | icon clock
  Complete         | bg --accent-green      | text --neutral-white | icon check-circle
  Cancelled        | bg --neutral-200       | text --neutral-600  | icon x-circle

- Verify WCAG AA contrast at 14px/500 for all pairings before finalising (design.md §7).
- These color assignments are status-only — never used decoratively elsewhere.

---

## Booking Summary Card (authenticated)

Clickable card representing a single booking. Used on: dashboard home (active cases, max 3 shown)
and services list (mobile stacked view, all bookings).

- Whole card clickable → /dashboard/services/[id]. 12px radius. --shadow-sm at rest.
- Hover: border → --neutral-200 darkened, --shadow-md.
- Draft Ready variant: left border 3px --warning-amber — draws attention on dashboard home.
- Structure (top → bottom):
    Row 1: Service type (16px / 600 / --primary-navy) + Service Status Badge (right-aligned).
    Row 2: Next-action line (14px / --neutral-600) — status-derived:
           Awaiting review · Draft ready — payment required · Filing in progress
           · Service complete · Cancelled.
    Row 3: Booking date · Reference number (mono / 14px / --neutral-600) — inline, · separator.
- Padding: 16px. Min height: 88px. Min tap target: 48px (whole card satisfies this).
STATES: default · hover · Draft Ready (amber left border) · loading (skeleton).