import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError, ErrorCode } from '../utils/AppError';
import { ApiErrorBody } from '../utils/apiResponse';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface NormalizedError {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
}

function normalize(error: unknown): NormalizedError {
  if (error instanceof AppError) {
    return { statusCode: error.statusCode, code: error.code, message: error.message, details: error.details };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return { statusCode: 409, code: 'CONFLICT', message: 'A record with these details already exists' };
    }
    if (error.code === 'P2025') {
      return { statusCode: 404, code: 'NOT_FOUND', message: 'Resource not found' };
    }
    if (error.code === 'P2003') {
      return { statusCode: 400, code: 'VALIDATION_ERROR', message: 'Related record does not exist' };
    }
    return { statusCode: 400, code: 'VALIDATION_ERROR', message: 'Database request error' };
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return { statusCode: 400, code: 'VALIDATION_ERROR', message: 'Invalid database request' };
  }

  const err = error as { type?: string; status?: number; message?: string };
  if (err?.type === 'entity.too.large') {
    return { statusCode: 413, code: 'PAYLOAD_TOO_LARGE', message: 'Request payload is too large' };
  }
  if (err?.status === 400 && err.message) {
    return { statusCode: 400, code: 'VALIDATION_ERROR', message: err.message };
  }

  return { statusCode: 500, code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' };
}

export function notFoundHandler(req: Request, res: Response): void {
  const body: ApiErrorBody = {
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` }
  };
  res.status(404).json(body);
}

export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  const normalized = normalize(error);
  if (normalized.statusCode >= 500) {
    logger.error('Unhandled request error', { path: req.originalUrl, message: (error as Error)?.message });
  }

  const body: ApiErrorBody = {
    success: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      ...(normalized.details !== undefined && !env.isProduction ? { details: normalized.details } : {})
    }
  };
  res.status(normalized.statusCode).json(body);
}
