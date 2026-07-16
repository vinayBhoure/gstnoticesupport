import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { envelope } from '../utils/envelope';
import { ApiError } from '../utils/ApiError';
import { healthService } from '../services/health.service';

export const healthController = {
  check: asyncHandler(async (_req: Request, res: Response) => {
    // DB connectivity is part of the health signal: the blue-green deploy gate polls
    // this endpoint, and a container that can boot but can't reach Neon must fail the
    // check so it is never promoted to receive traffic.
    const dbReachable = await healthService.isDatabaseReachable();
    if (!dbReachable) throw new ApiError(503, 'DATABASE_UNAVAILABLE', 'Database unavailable');

    res.status(200).json(envelope({ status: 'ok' }));
  }),
};
