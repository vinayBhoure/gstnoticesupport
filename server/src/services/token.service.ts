import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  ACCESS_TOKEN_TTL_SEC,
  REFRESH_TOKEN_TTL_SEC,
} from '../lib/jwt';
import { refreshTokenRepository } from '../repositories/refresh-token.repository';
import { tokenBlacklistRepository } from '../repositories/token-blacklist.repository';
import { invalidate as invalidateJtiCache } from '../lib/jtiCache';

type AuthUser = { id: string; role: string; email: string };

export const tokenService = {
  // Issues an access + refresh pair, persisting the hashed refresh token.
  // Returns the access token jti so the caller can build the login "This wasn't me" link.
  async issueAuthTokens(
    user: AuthUser,
  ): Promise<{ accessToken: string; refreshToken: string; accessJti: string }> {
    const access = signAccessToken(user);
    const refresh = signRefreshToken(user.id);
    await refreshTokenRepository.deleteExpired();
    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashToken(refresh.token),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SEC * 1000),
    });
    return { accessToken: access.token, refreshToken: refresh.token, accessJti: access.jti };
  },

  // No rotation (api_contract.md §1.6) — only a new access token is minted on refresh.
  issueAccessToken(user: AuthUser): string {
    return signAccessToken(user).token;
  },

  async revokeRefreshToken(rawRefreshToken: string): Promise<void> {
    await refreshTokenRepository.deleteByTokenHash(hashToken(rawRefreshToken));
  },

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await refreshTokenRepository.deleteAllByUserId(userId);
  },

  async blacklistAccessJti(jti: string): Promise<void> {
    // Evict any cached "clean" verdict so this process rejects the JTI immediately,
    // not after the negative-cache TTL expires (jtiCache.ts).
    invalidateJtiCache(jti);
    await tokenBlacklistRepository.deleteExpired();
    if (await tokenBlacklistRepository.existsByJti(jti)) return;
    await tokenBlacklistRepository.create({
      tokenJti: jti,
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_SEC * 1000),
    });
  },
};
