import { Response } from 'express';
import { env } from '../config/env';
import { AuthTokens } from '../services/auth.service';

export const ACCESS_COOKIE = 'wk_access';
export const REFRESH_COOKIE = 'wk_refresh';

const baseOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: 'lax' as const
};

export function setAuthCookies(res: Response, tokens: AuthTokens): void {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...baseOptions,
    path: '/',
    maxAge: 15 * 60 * 1000
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseOptions,
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { ...baseOptions, path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...baseOptions, path: '/api/auth' });
}
