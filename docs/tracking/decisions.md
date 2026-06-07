# Decision Log

> Tracks architectural and product decisions made during development.
> Supplements KB1, KB2, and HLD. Where this document conflicts with
> HLD/KB, HLD/KB takes precedence unless the decision here explicitly
> supersedes it (note that in the rationale).

---

| # | Decision | Rationale | Date |
|---|---|---|---|
| D59 | EP2 marketing pages use verbatim prototype CSS via per-page CSS Modules, not Tailwind utilities — exception to `frontend.md §7.2`. Shared shell styles (Navbar, Footer, WhatsApp float, sticky bar) go in `globals.css`; per-page styles are co-located as `page.module.css` beside each `page.tsx` with class names 1:1 matching the prototype HTML | Prototype reuses identical generic class names (`.hero`, `.grid`, `.cta`) with page-specific overrides; consolidating into one stylesheet causes selector collisions that break pixel fidelity. CSS Modules scope each page independently, preserving an exact visual match without Tailwind translation risk | 2026-06-06 |
| D60 | Commit messages for this project drop the `[Phase 1]` / `[Phase N]` prefix — plain Conventional Commits `type(scope): description` only. Overrides `RULES.md §6.2`. Branch naming `phase-1/…` is unchanged | Prefix was redundant with branch name and conflicted with standard Conventional Commits tooling; removing it keeps messages clean and machine-parseable | 2026-06-06 |
| D61 | Phase 1 contact form uses **Resend via a Next.js Route Handler** (`client/src/app/api/contact/route.ts`), not a separate Express server and not EmailJS. The handler runs server-side as a Vercel serverless function deployed with the frontend. `RESEND_API_KEY` is server-only (never `NEXT_PUBLIC_`). Email body uses **React Email** components. Admin-only notification to `bhoure05@gmail.com`; no user auto-reply; no DB persistence. **Rate limiting IS in Phase 1** — in-memory sliding window, 3 req / 60 min / IP (`client/src/lib/rate-limit.ts`), keyed on `x-forwarded-for`; best-effort on serverless (per-instance, resets on cold start), swap-ready for Upstash Redis for hard distributed enforcement. Aligns with the locked Resend provider (`integration SKILL`); the only deviation is endpoint location (Next Route Handler instead of Express `/api/v1/contact`) — the Express endpoint is introduced when the full server stack lands in Phase 2. **Supersedes the earlier EmailJS form of this decision.** | A Next.js Route Handler needs no separate backend deployment — it ships with the Vercel frontend at zero extra hosting cost — while keeping the Resend API key off the client, matching the locked architecture, and avoiding a rewrite before Phase 2. EmailJS exposed its key in the browser bundle and was a throwaway workaround. | 2026-06-07 |
| D62 | Global toast library for Phase 1 is **react-hot-toast** (not sonner). Mounted via `<Toaster>` in root `layout.tsx`. | Simpler API than sonner, zero configuration for the Phase 1 use case (form error/success toasts only). | 2026-06-07 |
