import type { UserRole } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

// Always apply after `authenticate` — relies on req.user being set.
export function requireRole(role: UserRole) {
  return asyncHandler(async (req, _res, next) => {
    if (!req.user || req.user.role !== role) {
      throw new ApiError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    next();
  });
}
