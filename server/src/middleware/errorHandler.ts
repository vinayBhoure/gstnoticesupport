import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      data: null,
      error: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    data: null,
    error: "An unexpected error occurred",
    statusCode: 500,
  });
}
