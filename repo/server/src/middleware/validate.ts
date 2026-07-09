import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

type IssueLike = { path: PropertyKey[]; message: string };

function toValidationError(issues: IssueLike[]): ApiError {
  const details = issues.map((i) => ({
    field: i.path.map(String).join('.'),
    message: i.message,
  }));
  return new ApiError(400, 'VALIDATION_ERROR', 'Validation failed', details);
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(toValidationError(result.error.issues));
      return;
    }
    req.validated = { ...req.validated, body: result.data };
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(toValidationError(result.error.issues));
      return;
    }
    req.validated = { ...req.validated, query: result.data };
    next();
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(toValidationError(result.error.issues));
      return;
    }
    req.validated = { ...req.validated, params: result.data };
    next();
  };
}
