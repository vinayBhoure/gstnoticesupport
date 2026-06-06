# design.md — gstnoticesupport Design System

> Authoritative source of truth for `claude.ai/design`. Every screen prompt inherits this file.
> Domain: GST litigation services (India). Audience: CAs, Advocates, SME owners who just received a tax notice.
> Do not invent tokens, patterns, or motion not defined here. If a screen needs something undefined, flag it — do not guess.

---

## 1. Design Principles (priority order)

1. **Trust before conversion.** This audience is skeptical and has been burned before. Credentials, legal identity, and process clarity come before any sell. Never push a CTA ahead of proof.
2. **One primary decision per screen.** Surface a single main action. Defer everything else to secondary/tertiary weight.
3. **Restraint signals confidence.** Calm, sparse, institutional. Loud design reads as "trying too hard" and lowers trust.
4. **Specificity beats emotion.** "Resolved ₹12L SCN in 2 weeks" > "Amazing service". Real numbers, real names, real registration IDs.
5. **Readability is a trust signal.** Never shrink body below 16px. Generous whitespace is a feature, not waste.

---

## 2. Visual Direction

- **Mood:** Banking-grade, government-portal-familiar (GSTN / MCA / ICAI). Authoritative, sober, safe-to-proceed.
- **Surface:** Flat. White and near-white backgrounds, thin borders, minimal shadow. No gradients, no glass, no neumorphism.
- **Reference patterns to replicate:** ClearTax (segmented testimonials, security section), Zerodha (restraint, static logo strip).
- **Reference anti-patterns to avoid:** overloaded navbars, startup gloss, crypto/trading aesthetics.

### 2.1 Color Tokens (locked — do not alter)

| Token | Hex | Use |
|---|---|---|
| `--primary-navy` | `#0A2540` | Headings, navbar, primary text |
| `--primary-deep-blue` | `#1B3A6B` | Section backgrounds |
| `--accent-green` | `#0B8B4E` | Primary CTAs, success states |
| `--accent-green-hover` | `#0A7A45` | CTA hover |
| `--warning-amber` | `#D97706` | Deadline / attention only (never decorative) |
| `--neutral-white` | `#FFFFFF` | Background |
| `--neutral-50` | `#F7F9FC` | Alternating section background |
| `--neutral-200` | `#E5E9F0` | Borders, dividers |
| `--neutral-600` | `#5A6878` | Secondary body text |
| `--neutral-900` | `#0F172A` | Primary body text |

**Forbidden colors:** pure red `#FF0000` (tax-error association), bright yellow `#FFEB00` (sale association), any neon/saturated color (startup-coded), black backgrounds (scam aesthetic).

### 2.2 Typography (locked)

- Heading: Inter / Manrope 700. Subheading (H3/H4): 600. Body: Inter 400. Emphasis/labels: 500. Mono: JetBrains Mono — reference numbers only (CIN, GSTIN, ICAI/Bar IDs).
- **Forbidden fonts:** script, decorative, condensed, slab serif.

| Level | Desktop | Mobile | Line-height |
|---|---|---|---|
| H1 | 48px | 32px | 1.1 |
| H2 | 36px | 28px | 1.2 |
| H3 | 24px | 24px | 1.3 |
| Body | 16px | 16px | 1.6 |
| Small | 14px | 14px | 1.5 |

Body never drops below 16px on any breakpoint.

### 2.3 Spacing (8px base grid)

`4 / 8 / 16 / 24 / 32 / 48 / 64 / 80 / 120`. Minimum vertical gap between major sections: **80px desktop, 48px mobile**.

### 2.4 Radius & Depth

- Cards 12px · Buttons 8px · Inputs 8px · Badges 6px. **No pill shapes.**
- Shadows used sparingly: `--shadow-sm: 0 1px 2px rgba(10,37,64,.05)` (cards), `--shadow-md: 0 4px 12px rgba(10,37,64,.08)` (elevated cards, modals). No text shadows. No neumorphism.

### 2.5 Iconography

Outline icons, 1.5px stroke (Lucide React). No 3D, no gradient, no emoji as UI. Icons supplement text labels — never replace them.

---

## 3. Interaction Rules

- Every interactive element has explicit **default, hover, focus, active, disabled** states.
- Primary buttons: filled `--accent-green`, white text, must be clearly higher contrast than secondary.
- Never place two primary buttons adjacent (decision paralysis). Pattern: one primary + one outline secondary.
- Whole cards are clickable where they represent a single choice (service card, notice selector) — not just the inner link/arrow.
- FAQ / accordions: single-item expansion (one open at a time).
- Disabled actions stay visible with a short reason shown (e.g. account-delete blocked → explain why), never silently hidden.
- Forms: inline validation, single-column, large fields. Errors are specific and adjacent to the field.

---

## 4. Layout Behavior

- **Mobile-first responsive.** Breakpoints (Tailwind): `sm 640 / md 768 / lg 1024 / xl 1280`. One responsive build per screen unless a screen is flagged "distinct layout".
- Hero: 2-column desktop (≈60/40 text/visual), single stacked column mobile (visual above text).
- Tables collapse to stacked cards on mobile.
- Grids: notice/service selector 3-col desktop → 2-col mobile. Footer 4-col desktop → single stacked mobile.
- Multi-step flows use a persistent stepper/progress indicator.
- Above-the-fold on homepage must fit a 1366×768 laptop.

### 4.2 App shell (authenticated screens)

- **User dashboard & admin** use a persistent **left sidebar** nav shell on desktop (≥lg). Sidebar holds the primary nav links for the zone; main content fills the remaining width.
- **Mobile (<lg):** sidebar collapses to a slide-in drawer triggered by a header hamburger. Header retains logo, tap-to-call phone, and drawer toggle.
- **Admin** is desktop-primary — ships a **minimal responsive fallback** only (sidebar → drawer, tables → horizontal scroll or stacked rows). No bespoke mobile design beyond keeping it usable.

### 4.1 Persistent contact affordances

- Phone number visible at all times — header (desktop), sticky bar (mobile), tap-to-call.
- WhatsApp floating button appears after first scroll (mobile).
- Mobile sticky bottom bar (≤64px): "Call Now" (outline) + "Book Service" (filled) + WhatsApp icon. Must not obscure form fields when keyboard is open.

---

## 5. Motion Guidelines (Framer Motion — restrained)

Motion is allowed in **exactly three places**. Everything else is static.

1. **Booking step progress** — 300ms ease-out transition between steps.
2. **Document upload confirmation** — file icon slide → checkmark replacement on success.
3. **Pay-to-Unlock → draft reveal** — lock icon animating to unlocked state.

**Forbidden motion:** scroll-triggered animation, parallax, entrance/reveal animations on marketing pages, auto-playing carousels. These read as startup-coded and erode trust. All motion respects `prefers-reduced-motion`.

---

## 6. Trust & Credibility Patterns

- **Legal identity (footer, mandatory):** company legal name, CIN, company GSTIN, full office address, grievance officer name + email, SSL badge, links to Privacy / Terms / Refund policy. Refund policy states "no refund" transparently.
- **Team credibility:** real photos (no avatars, no stock, no "fun" poses), full name, credential line, ICAI/Bar registration number (mono font), LinkedIn link. Minimum 3 members.
- **Outcome proof:** stat cards with verifiable numbers (large 48–64px number + descriptor); "+" notation over vanity round numbers.
- **Testimonials:** specific over emotional, ≤3 lines, name + designation + city. Horizontal swipe on mobile. No scrolling ticker.
- **Security reassurance near every upload:** "Documents are confidential / never shared", encryption claim. The upload component is the highest-stakes interaction — keep instructions minimal, reassurance prominent, show progress, confirm with a case reference.
- **India-specific trust:** UPI mentioned in payment contexts ("UPI, Net Banking, Card"); tap-to-call on section CTAs; WhatsApp as evaluation channel.

**Forbidden trust-eroding patterns:** countdown/urgency timers, "X people viewing now" badges, pop-ups in first 30s, guarantee/"guaranteed win" language, Western-businessperson stock photos, autoplay video with sound, chatbot with no human handoff.

---

## 7. Accessibility Constraints

- All tap targets ≥ **48px**.
- Text contrast meets WCAG AA (navy/neutral-900 on white passes; verify amber and green on their backgrounds before use).
- Body text ≥16px everywhere; never rely on color alone to convey state (pair with icon/label/text).
- Visible keyboard focus ring on every interactive element (focus state is not optional).
- Form fields have associated labels; errors announced and tied to their input.
- Motion honors `prefers-reduced-motion`.
- Reference numbers (CIN/GSTIN) in mono are selectable text, not images.

---

## 8. Screen Prompt Template (for `claude.ai/design`)

Screen prompts are **lean**: they reference shared rules by section (`design.md §N`) and shared UI by name (`components.md → Navbar`) instead of restating them. Assume the design LLM has both `design.md` and `components.md` in context. Each prompt carries exact placeholder copy (headlines, button labels, field labels).

```
SCREEN: <name> — <route> — <viewport: mobile | desktop | both>
PURPOSE: <one sentence — the single primary decision this screen serves>
PRIMARY ACTION: <the one main CTA>
SECONDARY ACTIONS: <lower-weight actions, if any>

LAYOUT (top to bottom):
- <region-by-region structure>
- RESPONSIVE: <explicit mobile vs desktop deltas>

SHELL: <none | components.md → App Shell (sidebar)>   # authenticated screens only
COMPONENTS: components.md → <names>                    # reference, do not restate
COPY: <exact placeholder copy: headings, labels, button text, helper text>
TRUST ELEMENTS: <which design.md §6 signals appear here>
MOTION: <none | one of the three design.md §5 motions>
STATES: <empty / loading / error / success states to render>
ACCESSIBILITY: <screen-specific notes beyond §7 defaults>
INHERITS: design.md §1–§7
```

**Rules for every generated prompt:** reference tokens by name (`--accent-green`), never restate hex; reference components by `components.md → Name`, never re-spec them; state responsive deltas explicitly; list every interactive state to render; one screen per prompt; never introduce a color/font/radius/motion/component outside `design.md` or `components.md` — if a screen needs one, flag it.
