import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './AppError';
import { Role } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

const accessOptions: SignOptions = {
  expiresIn: env.jwt.accessExpiresIn as SignOptions['expiresIn']
};

const refreshOptions: SignOptions = {
  expiresIn: env.jwt.refreshExpiresIn as SignOptions['expiresIn']
};

export function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, env.jwt.secret, accessOptions);
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, env.jwt.refreshSecret, refreshOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwt.secret) as AccessTokenPayload;
    if (decoded.type !== 'access') throw new Error('wrong token type');
    return decoded;
  } catch {
    throw AppError.unauthorized('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload;
    if (decoded.type !== 'refresh') throw new Error('wrong token type');
    return decoded;
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getTokenExpiry(token: string): Date {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) {
    throw new Error('Signed token is missing an exp claim');
  }
  return new Date(decoded.exp * 1000);
}

export function generateOpaqueToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
