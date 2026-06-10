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
