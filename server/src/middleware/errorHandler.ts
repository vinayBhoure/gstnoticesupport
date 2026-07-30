import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../lib/logger";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
        ...(err.meta ? { meta: err.meta } : {}),
      },
    });
    return;
  }

  // Programmer error — never expose stack trace to the client
  const requestId = (req as Request & { id?: string | number }).id;
  logger.error({ err, requestId }, "Unhandled error");
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      ...(requestId !== undefined ? { requestId: String(requestId) } : {}),
    },
  });
}
