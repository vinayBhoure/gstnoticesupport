import jwt from 'jsonwebtoken';
import { randomUUID, createHash } from 'crypto';
import { env } from './env';

export const ACCESS_TOKEN_TTL_SEC = 12 * 60 * 60; // 12 hours (issue #14 — was 15 min)
export const REFRESH_TOKEN_TTL_SEC = 7 * 24 * 60 * 60; // 7 days

export type AccessTokenPayload = {
  sub: string;
  role: string;
  email: string;
  jti: string;
  // Issued-at in whole seconds; compared against User.sessionsValidFrom in authenticate.ts.
  iat: number;
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
};

export function signAccessToken(user: { id: string; role: string; email: string }): {
  token: string;
  jti: string;
} {
  const jti = randomUUID();
  const token = jwt.sign({ role: user.role, email: user.email }, env.JWT_ACCESS_SECRET, {
    subject: user.id,
    jwtid: jti,
    expiresIn: ACCESS_TOKEN_TTL_SEC,
  });
  return { token, jti };
}

export function signRefreshToken(userId: string): { token: string; jti: string } {
  const jti = randomUUID();
  const token = jwt.sign({}, env.JWT_REFRESH_SECRET, {
    subject: userId,
    jwtid: jti,
    expiresIn: REFRESH_TOKEN_TTL_SEC,
  });
  return { token, jti };
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (typeof decoded === 'string') return null;
    const { sub, jti, role, email, iat } = decoded;
    if (
      typeof sub !== 'string' ||
      typeof jti !== 'string' ||
      typeof role !== 'string' ||
      typeof email !== 'string' ||
      typeof iat !== 'number'
    ) {
      return null;
    }
    return { sub, role, email, jti, iat };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    if (typeof decoded === 'string') return null;
    const { sub, jti } = decoded;
    if (typeof sub !== 'string' || typeof jti !== 'string') return null;
    return { sub, jti };
  } catch {
    return null;
  }
}

// Refresh tokens are stored hashed — the raw token never touches the database.
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
