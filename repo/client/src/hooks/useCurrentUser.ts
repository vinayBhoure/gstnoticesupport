import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import type { UserObject } from '@/lib/api/types';

// Client-side, cosmetic-only auth check for the public marketing header (nav
// CTA display only). Real access control stays server-side via requireUser()/
// requireAdmin() in the (dashboard)/(admin) layouts (frontend.md §1.4) — this
// hook never gates content, it only decides which nav CTA to render, so a
// browser-side check here does not violate that rule.
//
// retry:false — an anonymous visitor (the vast majority of marketing traffic)
// always gets a 401 here; retrying would just repeat the same failed call.
export function useCurrentUser() {
  return useQuery<UserObject>({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const { user } = await authApi.me();
      return user;
    },
    retry: false,
    staleTime: 60_000,
  });
}
