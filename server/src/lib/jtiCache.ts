// Short-TTL negative cache for access-token JTI blacklist lookups.
//
// The token blacklist is written only on logout / "This wasn't me" (rare), but
// authenticate.ts reads it on every authenticated request. Caching a "this JTI was
// NOT blacklisted" result for a few seconds removes that per-request NeonDB round-trip
// for active sessions. Only a NEGATIVE result is cached — a blacklisted JTI is never
// cached, and blacklistAccessJti() calls invalidate() so a same-process logout takes
// effect immediately. The <=5s staleness window therefore only applies across separate
// processes; the Hostinger deployment runs a single Node process (D95).

const NEG_TTL_MS = 5_000;
const MAX_ENTRIES = 10_000;

// jti -> unix ms after which the cached "clean" verdict expires
const seenClean = new Map<string, number>();

export function isKnownClean(jti: string): boolean {
  const expiresAt = seenClean.get(jti);
  if (expiresAt === undefined) return false;
  if (expiresAt <= Date.now()) {
    seenClean.delete(jti);
    return false;
  }
  return true;
}

export function markClean(jti: string): void {
  // Bounded memory: on overflow drop the whole map rather than track LRU — entries are
  // cheap to re-establish (one DB read) and expire within seconds anyway.
  if (seenClean.size >= MAX_ENTRIES) seenClean.clear();
  seenClean.set(jti, Date.now() + NEG_TTL_MS);
}

export function invalidate(jti: string): void {
  seenClean.delete(jti);
}
