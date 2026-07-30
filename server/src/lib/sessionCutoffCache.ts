// Short-TTL cache for User.sessionsValidFrom lookups.
//
// authenticate.ts must compare every access token's `iat` against the user's session
// cut-off, but that value changes only on a password reset/change (rare). Caching it for a
// few seconds keeps the per-request NeonDB round-trip off the hot path. Both a null and a
// non-null cut-off are cached — unlike jtiCache, a stale "no cut-off" verdict is the risky
// direction, so setCutoff() is called on every write to make a same-process reset immediate.
// The <=5s staleness window therefore only applies across separate processes; the Hostinger
// deployment runs a single Node process (D95).

const TTL_MS = 5_000;
const MAX_ENTRIES = 10_000;

type Entry = { validFrom: Date | null; expiresAt: number };

const cache = new Map<string, Entry>();

export function getCachedCutoff(userId: string): { hit: boolean; validFrom: Date | null } {
  const entry = cache.get(userId);
  if (entry === undefined) return { hit: false, validFrom: null };
  if (entry.expiresAt <= Date.now()) {
    cache.delete(userId);
    return { hit: false, validFrom: null };
  }
  return { hit: true, validFrom: entry.validFrom };
}

export function setCachedCutoff(userId: string, validFrom: Date | null): void {
  // Bounded memory: on overflow drop the whole map rather than track LRU — entries are
  // cheap to re-establish (one DB read) and expire within seconds anyway.
  if (cache.size >= MAX_ENTRIES) cache.clear();
  cache.set(userId, { validFrom, expiresAt: Date.now() + TTL_MS });
}

export function invalidateCachedCutoff(userId: string): void {
  cache.delete(userId);
}
