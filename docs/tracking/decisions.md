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
| D61 | Phase 1 contact form uses client-side **EmailJS** (no backend). Overrides: `backend.md §4.3` (no server-side rate limit — EmailJS dashboard limits + allowed-domains used instead), `RULES.md §3.2` (no shared schema — frontend-local Zod only), `integration SKILL` (Resend deferred). Admin-only notification to `bhoure05@gmail.com`; no user auto-reply; no DB persistence. Resend + Express `/api/v1/contact` endpoint introduced before Phase 2 launch. | No backend deployment planned for Phase 1 — deploying server solely for the contact form was disproportionate. EmailJS is client-side and credential-free from the server's perspective. Scope is deliberately minimised for Phase 1 launch. | 2026-06-07 |
| D62 | Global toast library for Phase 1 is **react-hot-toast** (not sonner). Mounted via `<Toaster>` in root `layout.tsx`. | Simpler API than sonner, zero configuration for the Phase 1 use case (form error/success toasts only). | 2026-06-07 |
