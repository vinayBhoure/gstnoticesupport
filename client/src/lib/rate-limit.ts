/*
 * In-memory sliding-window rate limiter (D61).
 *
 * NOTE: On Vercel serverless this is best-effort only — memory is per-instance
 * and resets on cold start, so it does not enforce a hard global limit. It is a
 * deterrent for casual abuse in Phase 1. Swap `checkRateLimit` for an Upstash
 * Redis implementation (same signature) for true distributed enforcement.
 */

const WINDOW_MS = 60 * 60 * 1000; // 60 minutes
const MAX_REQUESTS = 3;
const MAX_KEYS = 10_000; // hard cap to prevent unbounded memory growth

const store = new Map<string, number[]>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const recent = (store.get(key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= MAX_REQUESTS) {
    store.set(key, recent);
    const oldest = recent[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((oldest + WINDOW_MS - now) / 1000),
    };
  }

  recent.push(now);
  store.set(key, recent);

  if (store.size > MAX_KEYS) {
    for (const [k, timestamps] of store) {
      if (timestamps.every((t) => t <= windowStart)) store.delete(k);
    }
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS - recent.length,
    retryAfterSeconds: 0,
  };
}
