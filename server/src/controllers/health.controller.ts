import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { envelope } from '../utils/envelope';

export const healthController = {
  check: asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json(envelope({ status: 'ok' }));
  }),
};
