import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../lib/jwt';
import { tokenBlacklistRepository } from '../repositories/token-blacklist.repository';
import { userRepository } from '../repositories/user.repository';
import { isKnownClean, markClean } from '../lib/jtiCache';
import { getCachedCutoff, setCachedCutoff } from '../lib/sessionCutoffCache';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.access_token as unknown;
  if (typeof token !== 'string' || token.length === 0) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired session');
  }

  // Skip the DB round-trip when this JTI was confirmed clean within the cache window.
  if (!isKnownClean(payload.jti)) {
    if (await tokenBlacklistRepository.existsByJti(payload.jti)) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Session has been invalidated');
    }
    markClean(payload.jti);
  }

  // Password reset/change stamps a cut-off so tokens minted before it stop working at once,
  // rather than lingering for the remainder of their 12h life on other devices.
  let cutoff = getCachedCutoff(payload.sub);
  if (!cutoff.hit) {
    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired session');
    }
    setCachedCutoff(payload.sub, user.sessionsValidFrom);
    cutoff = { hit: true, validFrom: user.sessionsValidFrom };
  }
  if (cutoff.validFrom && payload.iat * 1000 < cutoff.validFrom.getTime()) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Session has been invalidated');
  }

  req.user = {
    id: payload.sub,
    role: payload.role,
    email: payload.email,
    jti: payload.jti,
  };
  next();
});
