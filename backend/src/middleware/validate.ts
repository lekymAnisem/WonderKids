import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError';

export interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        const issues = (error as { issues: Array<{ path: (string | number)[]; message: string }> }).issues;
        const details = issues.map((issue) => ({
          field: issue.path.join('.') || 'body',
          message: issue.message
        }));
        next(AppError.badRequest('Validation failed', details));
        return;
      }
      next(error);
    }
  };
}
