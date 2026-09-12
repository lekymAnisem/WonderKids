import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendCreated, sendSuccess } from '../utils/apiResponse';
import { clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from '../utils/cookies';
import { AppError } from '../utils/AppError';

function clientMeta(req: Request) {
  return { userAgent: req.get('user-agent') ?? null, ip: req.ip ?? null };
}

function readRefreshToken(req: Request): string | undefined {
  const bodyToken = (req.body as { refreshToken?: string } | undefined)?.refreshToken;
  const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies?.[REFRESH_COOKIE];
  return bodyToken ?? cookieToken;
}

export const authController = {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    return sendCreated(res, { user });
  },

  async login(req: Request, res: Response) {
    const { user, tokens } = await authService.login(req.body, clientMeta(req));
    setAuthCookies(res, tokens);
    return sendSuccess(res, { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  },

  async refresh(req: Request, res: Response) {
    const token = readRefreshToken(req);
    if (!token) {
      throw AppError.unauthorized('Refresh token is required');
    }
    const { user, tokens } = await authService.refresh(token, clientMeta(req));
    setAuthCookies(res, tokens);
    return sendSuccess(res, { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  },

  async logout(req: Request, res: Response) {
    await authService.logout(readRefreshToken(req));
    clearAuthCookies(res);
    return sendSuccess(res, { message: 'Logged out successfully' });
  },

  async forgotPassword(req: Request, res: Response) {
    const result = await authService.forgotPassword(req.body.email);
    return sendSuccess(res, {
      message: 'If an account exists for that email, a reset link has been sent.',
      ...(result.devToken ? { devToken: result.devToken } : {})
    });
  },

  async resetPassword(req: Request, res: Response) {
    await authService.resetPassword(req.body.token, req.body.password);
    clearAuthCookies(res);
    return sendSuccess(res, { message: 'Password has been reset successfully' });
  }
};
