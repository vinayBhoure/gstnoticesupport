import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

function formatZodError(schema: ZodSchema, input: unknown): string {
  const result = schema.safeParse(input);
  if (result.success) return '';
  return result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ApiError(400, formatZodError(schema, req.body)));
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
      next(new ApiError(400, formatZodError(schema, req.query)));
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
      next(new ApiError(400, formatZodError(schema, req.params)));
      return;
    }
    req.validated = { ...req.validated, params: result.data };
    next();
  };
}
