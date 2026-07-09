import type { Response, CookieOptions } from 'express';
import { env } from '../lib/env';
import { ACCESS_TOKEN_TTL_SEC, REFRESH_TOKEN_TTL_SEC } from '../lib/jwt';

const isProd = env.NODE_ENV === 'production';

// Refresh cookie is scoped to the refresh endpoint only (api_contract.md §1).
// Note the /api/v1 mount prefix — the contract writes paths without it.
const REFRESH_COOKIE_PATH = '/api/v1/auth/refresh';

function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd, // never Secure in dev — cookies won't flow over http://localhost
    sameSite: 'lax',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
): void {
  res.cookie('access_token', tokens.accessToken, {
    ...baseOptions(),
    path: '/',
    maxAge: ACCESS_TOKEN_TTL_SEC * 1000,
  });
  res.cookie('refresh_token', tokens.refreshToken, {
    ...baseOptions(),
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_TOKEN_TTL_SEC * 1000,
  });
}

export function setAccessCookie(res: Response, accessToken: string): void {
  res.cookie('access_token', accessToken, {
    ...baseOptions(),
    path: '/',
    maxAge: ACCESS_TOKEN_TTL_SEC * 1000,
  });
}

// Clearing requires the same domain/path/sameSite/secure options or some browsers silently keep the cookie.
export function clearAuthCookies(res: Response): void {
  res.clearCookie('access_token', { ...baseOptions(), path: '/' });
  res.clearCookie('refresh_token', { ...baseOptions(), path: REFRESH_COOKIE_PATH });
}
