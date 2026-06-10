# Frontend Rules — Next.js 15 (App Router)

> **Applies to:** `client/` directory
> **Universal rules also apply:** See `RULES.md`

---

## 1. Server Components vs Client Components

### 1.1 — Default to Server Components. Add `'use client'` only when required.

**Why:** Server Components render on the server, never ship their code to the browser, and eliminate loading states for initial data. `'use client'` is opt-in, not the default.

A Client Component is required only when the component:
- Uses browser-only APIs (`window`, `document`, `navigator`)
- Uses React hooks (`useState`, `useEffect`, `useRef`, etc.)
- Needs event handlers (`onClick`, `onChange`, etc.)
- Uses TanStack Query or any client-side state library

```tsx
// ❌ DON'T — making a page a Client Component just to fetch data
'use client';
import { useEffect, useState } from 'react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { fetch('/api/bookings').then(...) }, []);
  return <BookingsList bookings={bookings} />;
}

// ✅ DO — Server Component fetches data at render time, no loading flash
import { getBookings } from '@/lib/api';
import { cookies } from 'next/headers';

export default async function BookingsPage() {
  const token = cookies().get('token')?.value;
  const bookings = await getBookings(token);
  return <BookingsList bookings={bookings} />;
}
```

---

### 1.2 — Push `'use client'` to leaf nodes. Keep parent components as Server Components.

**Why:** The narrower the Client Component, the less JavaScript is sent to the browser.

```tsx
// ❌ DON'T — marking the whole page as a Client Component for one interactive element
'use client';
export default function BookingDetailPage({ booking }) {
  return (
    <div>
      <BookingInfo booking={booking} />       {/* purely presentational */}
      <AdminNotes notes={booking.adminNote} /> {/* purely presentational */}
      <CancelButton bookingId={booking.id} />  {/* needs onClick — the only reason */}
    </div>
  );
}

// ✅ DO — only the interactive element is a Client Component
// BookingDetailPage is a Server Component (no 'use client')
export default async function BookingDetailPage({ params }) {
  const booking = await getBookingById(params.id);
  return (
    <div>
      <BookingInfo booking={booking} />
      <AdminNotes notes={booking.adminNote} />
      <CancelButton bookingId={booking.id} /> {/* this file has 'use client' */}
    </div>
  );
}
```

---

### 1.3 — Never fetch the same data in both a Server Component and TanStack Query. Choose one.

**Why:** Fetching twice means two network calls and two sources of truth. Server Components handle initial load; TanStack Query handles post-interaction updates.

---

### 1.4 — Auth is always verified in Server Components. Never check auth in Client Components.

**Why:** Client-side auth checks are UI hints, not security. The server must enforce access.

```tsx
// ✅ DO — in every dashboard/admin Server Component
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const token = cookies().get('token')?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) redirect('/login');
  // render
}
```

---

## 2. Data Fetching — TanStack Query

### 2.1 — Use TanStack Query for all client-side data fetching. Never `useEffect` + `fetch`.

**Why:** TanStack Query provides caching, deduplication, background refetching, and loading/error states out of the box.

```tsx
// ❌ DON'T
useEffect(() => {
  fetch('/api/bookings').then(r => r.json()).then(setBookings);
}, []);

// ✅ DO
const { data: bookings, isLoading } = useQuery({
  queryKey: ['bookings'],
  queryFn: () => api.getBookings(),
});
```

---

### 2.2 — Query keys must be arrays with the resource type first, then the identifier.

**Why:** Consistent key structure makes cache invalidation predictable.

```ts
// ❌ DON'T
queryKey: ['booking-detail-123']
queryKey: ['getBooking', id]

// ✅ DO
queryKey: ['bookings']                    // list
queryKey: ['bookings', bookingId]         // single item
queryKey: ['user', 'me']                 // current user
queryKey: ['payments', bookingId]         // payments for a booking
```

---

### 2.3 — Mutations must invalidate the relevant queries on success.

**Why:** Stale cache after a mutation causes the UI to show outdated data.

```tsx
// ✅ DO
const cancelBooking = useMutation({
  mutationFn: (bookingId: string) => api.cancelBooking(bookingId),
  onSuccess: (_, bookingId) => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['bookings', bookingId] });
  },
});
```

---

## 3. Forms — React Hook Form + Zod

### 3.1 — All forms use React Hook Form with `zodResolver`. Never write manual validation logic.

**Why:** Manual validation duplicates logic already in the Zod schema and introduces drift.

```tsx
// ✅ DO
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@server/schemas/auth.schema';
import type { LoginInput } from '@server/schemas/auth.schema';

const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
});
```

---

### 3.2 — Always import Zod schemas from `server/src/schemas/`. Never recreate them in the frontend.

See `RULES.md §3.2`.

---

### 3.3 — Always display field-level errors. Never swallow validation messages.

```tsx
// ✅ DO
<input {...form.register('email')} />
{form.formState.errors.email && (
  <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
)}
```

---

### 3.4 — Form submit handlers are `async`, wrapped in try/catch, and show toast on API error.

**Why:** Network and API errors are not caught by React Hook Form — they must be handled separately.

```tsx
// ✅ DO
const onSubmit = async (data: LoginInput) => {
  try {
    await loginMutation.mutateAsync(data);
    router.push('/dashboard');
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
};
```

---

### 3.5 — Disable the submit button while the mutation is pending. Show a loading indicator.

**Why:** Double submission can cause duplicate bookings, duplicate payments, or duplicate OTP sends.

```tsx
<button type="submit" disabled={form.formState.isSubmitting || loginMutation.isPending}>
  {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
</button>
```

---

## 4. Routing Conventions

### 4.1 — Route groups and their rendering strategy are fixed. Do not change them.

| Route Group | Rendering | Reason |
|---|---|---|
| `(public)/` | SSG | Static content, SEO, served from CDN |
| `(auth)/` | SSR | Dynamic, but no per-user data |
| `(dashboard)/` | SSR (Server Components) | Per-user data, auth-gated |
| `(admin)/` | SSR (Server Components) | Per-user data, role-gated |
| `payment/verify/` | SSR | Reads query params from Razorpay redirect |

---

### 4.2 — Every auth-gated route checks the JWT cookie and redirects to `/login` if absent or invalid.

**Why:** Without this check, unauthenticated users can view dashboard pages directly.

---

### 4.3 — Every admin route checks `user.role === 'admin'` and redirects to `/dashboard` if not.

**Why:** Role check at the route level prevents accidental access to admin functionality.

---

### 4.4 — Use `loading.tsx` for route-level loading states and `error.tsx` for route-level errors.

**Why:** Next.js App Router displays these automatically — don't implement loading/error UX inside the page component.

---

### 4.5 — Never use `useRouter().push()` for post-login or post-payment redirects. Use server-side `redirect()`.

**Why:** Server-side `redirect()` runs before the page renders and can't be blocked by JavaScript errors.

---

## 5. SSG vs SSR Rules

### 5.1 — All marketing pages must be statically generated.

**Why:** Static HTML served from Vercel's edge + Cloudflare achieves FCP < 1.5s on 4G, which is the performance target.

Add `export const dynamic = 'force-static'` to any marketing page that Next.js does not automatically recognise as static.

---

### 5.2 — Never fetch data at runtime in a marketing page.

If a marketing page needs data (e.g., service list, FAQ content), it must be fetched at build time via `generateStaticParams` or hardcoded as a constant — not via a server-side fetch at request time.

---

## 6. Image Handling

### 6.1 — Always use Next.js `<Image>` component. Never use raw `<img>` tags.

**Why:** `<Image>` provides automatic WebP conversion, responsive sizing, lazy loading, and prevents layout shift.

```tsx
// ❌ DON'T
<img src="/logo.png" alt="GST Notice Support" />

// ✅ DO
import Image from 'next/image';
<Image src="/logo.png" alt="GST Notice Support" width={160} height={40} />
```

---

### 6.2 — Hero and above-the-fold images get the `priority` prop. All others are lazy-loaded.

```tsx
// ✅ DO — homepage hero
<Image src="/hero-bg.jpg" alt="..." width={1440} height={600} priority />
```

---

### 6.3 — S3 document URLs are always pre-signed. Never embed a direct S3 object URL.

**Why:** Direct S3 URLs bypass access control and persist indefinitely.

---

## 7. Component Structure

### 7.1 — One component per file.

---

### 7.2 — Co-locate Tailwind classes in the component. No separate CSS files for component styles.

**Why:** The design system is implemented via CSS tokens (`tokens.css`) and Tailwind utilities — per-component CSS files add an unnecessary layer.

---

### 7.3 — Props types are named `[ComponentName]Props` and defined immediately above the component.

```tsx
// ✅ DO
type BookingCardProps = {
  booking: BookingDTO;
  onCancel?: (id: string) => void;
};

export function BookingCard({ booking, onCancel }: BookingCardProps) { ... }
```

---

### 7.4 — Never drill props more than 2 levels deep. Use composition instead.

**Why:** Deep prop drilling makes components hard to refactor and is a sign the component tree needs restructuring.

---

### 7.5 — Framer Motion is used only in three specific places.

Per the design system (HLD §16.1): booking step progress indicator, document upload confirmation, and the draft lock-to-unlock transition. Do not add animations elsewhere — they erode professional trust with this audience.

---

## 8. Design System Constraints

### 8.1 — Use only the locked colour tokens. Never hardcode hex values.

Colour tokens are defined in `resources/ui/css/tokens.css`. Use them via Tailwind config — do not write `text-[#0A2540]` inline.

---

### 8.2 — Forbidden UI patterns are absolute.

The following are prohibited regardless of feature context (see HLD §16.6 for rationale):

- Countdown timers or fake urgency
- "X people viewing now" or social-proof widgets
- Pop-ups or modals triggered within the first 30 seconds of page load
- Auto-play video with sound
- Guarantee language ("Guaranteed win", "100% success")
- Scrolling marquees or tickers for testimonials

---

### 8.3 — The `pre-deposit` disclosure must appear at all four mandatory touchpoints.

For GSTAT Appeal and Commissioner Appeal bookings: pricing page, booking flow Step 1, Draft Ready email, and the Pay-to-Unlock screen. Never omit any of these four.
