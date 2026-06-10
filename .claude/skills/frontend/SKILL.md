---
name: frontend-core
description: >
  Guides all Next.js frontend work for gstnoticesupport.in — App Router page
  structure, Server vs Client Components, rendering strategy (SSG / SSR),
  TanStack Query for server state, React Hook Form + Zod for forms, and the
  full SEO setup (Metadata API, Schema.org JSON-LD, OG tags, sitemap, robots).
  Use this when adding any page, layout, or component; deciding between Server
  and Client Components; building any form; setting up data fetching; or
  configuring SEO metadata. Triggers on "page", "component", "Server Component",
  "Client Component", "App Router", "SSR", "SSG", "form", "TanStack Query",
  "React Hook Form", "SEO", "metadata", "OG tags", "Schema.org", "sitemap".
---

# Frontend Core — Next.js App Router, Components, Forms, SEO

## Purpose

This skill covers the full frontend pattern stack used across every page of gstnoticesupport.in. A developer building any new screen needs all of these together — rendering strategy, component boundary, data fetching, form handling, SEO — so they are bundled into one skill rather than split across five files.

**Source of truth:**
- HLD §5 (Frontend Architecture)
- HLD §15 (Performance & SEO Architecture)
- HLD §16 (Design System & UX Constraints)
- HLD §22.2 (Locked Frontend Decisions)
- Design Blueprint for Trust, Credibility, Authenticity
- LLD (Frontend zone mapping)

---

## Locked Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| UI components | shadcn/ui patterns where applicable |
| Forms | React Hook Form + Zod |
| Server state | TanStack Query |
| UI state | `useState` / `useReducer` (no Redux, no Zustand) |
| Animations | Framer Motion (micro-interactions only) |
| Icons | Lucide React (outline) |
| Notifications | React Hot Toast |

Do not use Pages Router. Do not introduce Redux, Zustand, Recoil, or any global state library. Do not add Material UI, Chakra, or Ant Design.

---

## App Router Structure (locked, HLD §5.1)

```
app/
  (public)/
    page.tsx                 # Homepage
    services/[slug]/page.tsx
    pricing/page.tsx
    about/page.tsx
    contact/page.tsx
    faq/page.tsx
    terms/page.tsx
    privacy/page.tsx
  (auth)/
    login/page.tsx
    signup/page.tsx
    verify-otp/page.tsx
    forgot-password/page.tsx
  (dashboard)/
    dashboard/page.tsx
    dashboard/services/page.tsx
    dashboard/services/[id]/page.tsx
    dashboard/services/[id]/draft/page.tsx
    dashboard/payments/page.tsx
    dashboard/settings/page.tsx
  (admin)/
    admin/page.tsx
    admin/bookings/page.tsx
    admin/bookings/[id]/page.tsx
  payment/
    verify/page.tsx
```

Route groups (parentheses) provide shared layouts without affecting URLs. Use them — do not create top-level layouts that span unrelated route groups.

---

## Rendering Strategy (locked, HLD §5.2)

| Route group | Strategy | Why |
|---|---|---|
| `(public)/` | SSG | Static marketing content, maximum SEO + speed |
| `(auth)/` | SSR | Dynamic but no per-user data |
| `(dashboard)/` | SSR (Server Components) | Per-user auth-gated data |
| `(admin)/` | SSR (Server Components) | Per-admin role-gated data |
| `payment/verify` | SSR | Reads Razorpay redirect query params |

Default to SSG for any new public page. Default to SSR for any auth-gated page. Do not opt into Client-Side Rendering for entire pages.

---

## Server Components vs Client Components

**Default = Server Component.** Mark Client only when needed.

### Server Components do

- Read the JWT cookie via `cookies()` from `next/headers`.
- Call the Express backend via `fetch()` with the cookie forwarded.
- Render with data already present — no loading flash.
- Render anything that does not need browser APIs or interactivity.

### Client Components do

- Anything with `useState`, `useEffect`, `useReducer`.
- Form components (React Hook Form needs the DOM).
- Razorpay checkout modal trigger.
- Document upload widget (file picker, progress).
- Cancel confirmation dialog (open/close state).
- Anything calling `window`, `document`, `localStorage`, etc.

Mark with `'use client'` at the top of the file. Place these as **leaf** components — the smallest interactive widget — and pass server-fetched data into them as props. Do not mark layouts or page roots as client unless absolutely required.

### Boundary rule

A Server Component can render a Client Component. A Client Component cannot render a Server Component (it can receive Server-rendered children as props — the `children` slot pattern). Keep the boundary low in the tree.

---

## Data Fetching

### Server Components

```
// Inside a Server Component
import { cookies } from 'next/headers';

const cookieStore = cookies();
const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/bookings`, {
  headers: { cookie: cookieStore.toString() },
  cache: 'no-store',  // dashboard data is per-request, never cached
});
const { data } = await res.json();
```

Caching:
- Marketing/SSG pages: cache freely.
- Per-user dashboard: `cache: 'no-store'`.
- Per-service public page: `revalidate: 3600` or higher is acceptable.

### Client Components (TanStack Query)

Server state in Client Components goes through TanStack Query — never raw `useEffect + fetch`.

```
const { data, isLoading, error } = useQuery({
  queryKey: ['bookings', bookingId],
  queryFn: () => apiClient.bookings.get(bookingId),
});
```

Mutation operations (cancel booking, confirm draft, etc.) use `useMutation` with cache invalidation on success.

Key conventions:
- Query keys are arrays starting with the resource name (`['bookings']`, `['bookings', id]`).
- A single `apiClient` wrapper in `lib/apiClient.ts` handles all fetch calls (credentials: include, error normalization, cookie handling).
- No direct `fetch()` from components.

### UI state

`useState` for trivial local state. `useReducer` for multi-step form state (booking flow). No global state library.

---

## Forms (React Hook Form + Zod)

Every form uses this exact pattern. Schemas are imported from a shared module so frontend and backend validate against the same definition.

```
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(createBookingSchema),
});

const mutation = useMutation({
  mutationFn: apiClient.bookings.create,
  onSuccess: () => { /* invalidate, navigate, toast */ },
  onError: (err) => { /* toast error */ },
});

return <form onSubmit={handleSubmit(mutation.mutate)}>...</form>;
```

### Conventions

- Zod schemas imported from a shared package or duplicated path that mirrors `server/src/schemas/` — never drift.
- Field components live in `components/forms/` (TextField, SelectField, FileUploader).
- Error messages come from Zod via React Hook Form — never hardcode duplicate error text in JSX.
- Server-side errors surface via toast (React Hot Toast) and optionally inline if field-specific.
- Loading state derived from `mutation.isPending`. Disable submit button while pending.
- No uncontrolled `<input>` directly — always `register('field')`.

### Multi-step forms

The booking flow is multi-step. Use a `useReducer` to hold cross-step state. Each step is its own form with its own Zod schema. Final submission combines all step data and validates against the full schema once more.

---

## SEO (HLD §15)

SEO is a primary business priority for this project. Every public page must implement the full SEO stack.

### Metadata API

Each public page exports either a static `metadata` object or a `generateMetadata` function:

```
export const metadata: Metadata = {
  title: 'GSTAT Appeal Filing — GST Notice Support',
  description: '...',
  alternates: { canonical: 'https://gstnoticesupport.in/services/gstat-appeal' },
  openGraph: { ... },
  twitter: { ... },
};
```

Conventions:
- Title format: `<Page Title> — GST Notice Support`.
- Description: 150–160 characters, includes the primary keyword, never duplicated across pages.
- Canonical URL set on every page (use `NEXT_PUBLIC_SITE_URL` env var).
- Open Graph + Twitter cards on every page. Use a per-page OG image where possible.

### Schema.org JSON-LD

Each service page renders structured data:

- `Service` schema on `/services/[slug]` pages.
- `Organization` schema on the homepage and About page.
- `BreadcrumbList` on nested pages.
- `FAQPage` on the FAQ page.

Inject via:

```
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
/>
```

### Sitemap + robots

- `app/sitemap.ts` generates `sitemap.xml` at build time. Include every public route.
- `app/robots.ts` generates `robots.txt`. Disallow `/dashboard`, `/admin`, `/payment/verify`. Allow all public paths.
- Both files use the Next.js built-in conventions — no manual generation.

### Page-load performance

- Marketing pages are SSG and served from Vercel's edge.
- Images use `next/image` with explicit `width`, `height`, and `priority` on above-fold images.
- Lucide icons are tree-shaken via direct imports (`import { Mail } from 'lucide-react'`).
- No client-side Framer Motion on marketing pages — it bloats the bundle for limited value.

---

## Design System Constraints (HLD §16, Design Blueprint)

Hard rules from the Design Trust Blueprint — these are non-negotiable for the target audience (skeptical Indian professionals):

- **Palette:** navy + green + neutral only. No red, no neon, no gradients.
- **Tone:** institutional, restrained. No startup jargon, no superlatives, no "revolutionary."
- **Typography:** professional serif/sans pairing. No display fonts.
- **Animations:** subtle micro-interactions only (booking progress bar, upload confirmation, draft unlock). No page transitions, no scroll-jacking.
- **Mobile-first:** Tailwind default breakpoints, responsive on every page except admin (admin is desktop-first per LLD Zone 5).
- **Icons:** Lucide outline only.

When in doubt, restraint signals confidence. Specificity beats superlatives. Humans (team photos) matter more than features.

---

## Anti-patterns

Do not:

- Use Pages Router. App Router only.
- Default to Client Components. Server Components are the default.
- Use `useEffect + fetch` for server state. TanStack Query is mandatory.
- Add Redux or any global state library. Use TanStack Query + `useState`.
- Skip Zod validation on a form because "the backend will validate." Both layers validate.
- Hardcode form error messages in JSX. They come from Zod.
- Use raw `fetch()` in components. Always through `lib/apiClient.ts`.
- Cache dashboard pages. Use `cache: 'no-store'`.
- Forget `cookies()` forwarding when calling the backend from a Server Component.
- Add gradients, red accents, or neon colors. Navy + green + neutral only.
- Use Framer Motion on marketing pages. Reserved for app-shell micro-interactions.
- Skip Metadata API or Schema.org on public pages. SEO is primary growth.
- Put the JWT cookie domain logic in the frontend. The backend sets cookies; the frontend reads them via `cookies()`.
- Try to render Server Components inside Client Components. Use `children` slot pattern.
- Use `target="_blank"` without `rel="noopener noreferrer"`.

---

## Quick Reference: Adding a New Page

1. Decide route group: `(public)`, `(auth)`, `(dashboard)`, `(admin)`.
2. Decide rendering: SSG (public), SSR (everything else).
3. Decide Server vs Client at component level — Server by default, Client at leaves.
4. If auth-gated: in the Server Component, read cookies and forward to backend.
5. If a form exists: import shared Zod schema, set up React Hook Form + TanStack Query mutation.
6. If public: write `metadata` + Schema.org JSON-LD + ensure it's in `sitemap.ts`.
7. Use `next/image` for all images.
8. Test on mobile breakpoint first.
