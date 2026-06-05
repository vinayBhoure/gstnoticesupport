# GST Notice Support — Project Instructions

This project is the **GST Litigation Portal** for **GST Notice Support** (gstnoticesupport),
a GST-litigation services business in India. Audience: CAs, Advocates, and SME owners who
have just received a tax notice — skeptical, high-stakes, trust-first.

## Source of truth (READ BEFORE ANY DESIGN WORK)
- `design-system/design.md` — locked tokens, type, spacing, motion, layout, trust & a11y rules.
- `design-system/components.md` — shared components, specified once. Reference by name.
- `assets/logo.png` — primary logo (navy "GST" + green, document + shield mark, tagline
  "We support, you comply"). Solid white background — place on white/`--neutral-50` only.
- `Design System.html` — rendered living style guide. Open it to see tokens/components in situ.

These files are **authoritative and locked**. Do not invent tokens, fonts, radii, motion, or
components outside them. If a screen needs something undefined, **flag it — do not guess**.

## Non-negotiables (the short list)
- **Colors:** navy `#0A2540`, deep-blue `#1B3A6B`, green `#0B8B4E` (CTA) / `#0A7A45` (hover),
  amber `#D97706` (deadline/attention ONLY, never decorative), white, `#F7F9FC`, `#E5E9F0`,
  `#5A6878`, `#0F172A`. Forbidden: pure red, bright yellow, neon/saturated, black backgrounds.
- **Type:** Inter/Manrope (700 head / 600 subhead / 500 labels / 400 body). JetBrains Mono for
  reference numbers only (CIN, GSTIN, ICAI/Bar IDs). Body never below 16px. H1 48/32, H2 36/28,
  H3 24, Body 16, Small 14.
- **Spacing:** 8px grid — 4/8/16/24/32/48/64/80/120. Section gaps ≥80px desktop / 48px mobile.
- **Radius:** cards 12 · buttons/inputs 8 · badges 6. **No pills.** Shadows sparing (sm/md only).
- **Icons:** Lucide outline, 1.5px stroke. No 3D/gradient/emoji-as-UI. Icons supplement labels.
- **Motion:** allowed in EXACTLY 3 places (booking step transition, upload confirmation,
  pay-to-unlock reveal). Everything else static. No scroll/parallax/entrance/carousel motion.
  Honor `prefers-reduced-motion`.
- **Buttons:** never two primaries adjacent (one primary + one outline secondary). Min height 48px.
  Render all states: default / hover / focus / active / disabled.
- **Tap targets ≥48px. WCAG AA contrast. Visible focus ring always.**

## Design principles (priority order)
1. Trust before conversion. 2. One primary decision per screen. 3. Restraint signals confidence.
4. Specificity beats emotion (real numbers/names/IDs). 5. Readability is a trust signal.

## App shell
- Public pages: sticky Navbar + Footer (Footer carries mandatory legal identity — CIN, GSTIN,
  address, grievance officer, policies, SSL). Mobile: sticky bottom bar + WhatsApp float.
- Authenticated (user dashboard / admin): persistent left **sidebar** shell; collapses to a
  slide-in drawer <lg. Admin is desktop-primary (minimal responsive fallback only).

## Forbidden (trust-eroding) patterns
Countdown/urgency timers · "X people viewing" badges · early pop-ups · guarantee/"guaranteed win"
language · Western stock photos · autoplay video w/ sound · chatbot with no human handoff ·
avatars or stock for team · auto-scrolling testimonial ticker.

## Working rules
- Reuse existing components/patterns. Extend the system — never replace it.
- Reference tokens by name (`--accent-green`), never restate hex in prompts.
- Reference components by `components.md → Name`, never re-spec them.
- State responsive deltas explicitly. List every interactive state to render. One screen per task.
- Use the screen-prompt template in `design.md §8` when scaffolding new screens.
