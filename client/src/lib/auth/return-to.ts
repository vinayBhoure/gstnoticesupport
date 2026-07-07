// Guards the ?returnTo= query param against open-redirect: only a same-origin
// path (starting with a single '/') is ever honored, everything else is dropped.
export function sanitizeReturnTo(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (!value.startsWith('/') || value.startsWith('//')) return undefined;
  return value;
}
