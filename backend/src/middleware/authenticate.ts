import { NextFunction, Request, Response } from 'express';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';

export const ACCESS_COOKIE = 'wk_access';

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim();
  }
  const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies?.[ACCESS_COOKIE];
  return cookieToken ?? null;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) throw AppError.unauthorized('Authentication required');

    const payload = verifyAccessToken(token);
    const user = await userRepository.findPublicById(payload.sub);
    if (!user || !user.isActive) throw AppError.unauthorized('Account is not active');

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
}
