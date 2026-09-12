import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

function handler(_req: unknown, _res: unknown, next: (error: unknown) => void): void {
  next(new AppError('RATE_LIMITED', 'Too many requests. Please slow down and try again later.'));
}

const skip = () => env.isTest;

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: env.aiRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler
});
