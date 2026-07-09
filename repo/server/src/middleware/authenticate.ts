import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../lib/jwt';
import { tokenBlacklistRepository } from '../repositories/token-blacklist.repository';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.access_token as unknown;
  if (typeof token !== 'string' || token.length === 0) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired session');
  }

  if (await tokenBlacklistRepository.existsByJti(payload.jti)) {
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
