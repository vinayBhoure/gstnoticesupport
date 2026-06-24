import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { ApiRequestError } from '@/lib/api/client';
import type { UserObject } from '@/lib/api/types';

export async function getSession(): Promise<UserObject | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader.includes('access_token')) return null;

  try {
    const { user } = await authApi.me(cookieHeader);
    return user;
  } catch (error) {
    if (error instanceof ApiRequestError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    return null;
  }
}

export async function requireUser(): Promise<UserObject> {
  const user = await getSession();
  if (!user) redirect('/login');
  return user;
}

export async function requireAdmin(): Promise<UserObject> {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard');
  return user;
}
