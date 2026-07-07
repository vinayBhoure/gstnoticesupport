import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { UserObject } from '../api/types';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

// Server-Component auth check (frontend.md §1.4). Reads the HTTP-only cookie and
// forwards it to GET /auth/me. Never trust a client-side check for access control.
// Wrapped in React cache() so layout + page calls in one request share a single fetch.
export const getCurrentUser = cache(async (): Promise<UserObject | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success) return null;
    return json.data.user as UserObject;
  } catch {
    return null;
  }
});

// Use at the top of any auth-gated Server Component / layout.
export async function requireUser(): Promise<UserObject> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

// Use at the top of any admin Server Component / layout (frontend.md §4.3).
export async function requireAdmin(): Promise<UserObject> {
  const user = await requireUser();
  if (user.role !== 'admin') redirect('/dashboard');
  return user;
}

// Use on auth pages so an already-signed-in user skips login/signup.
// Role-aware: admins land on the admin surface, users on the dashboard.
export async function redirectIfAuthenticated(to?: string): Promise<void> {
  const user = await getCurrentUser();
  if (user) redirect(to ?? (user.role === 'admin' ? '/admin' : '/dashboard'));
}
