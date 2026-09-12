import { Role } from '@prisma/client';
import { env } from '../config/env';
import { userRepository, PublicUser } from '../repositories/user.repository';
import { tokenRepository } from '../repositories/token.repository';
import { AppError } from '../utils/AppError';
import { hashPassword, verifyPassword } from '../utils/password';
import {
  generateOpaqueToken,
  getTokenExpiry,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '../utils/jwt';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ClientMeta {
  userAgent?: string | null;
  ip?: string | null;
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

async function issueTokens(user: PublicUser, meta: ClientMeta): Promise<AuthTokens> {
  const refreshToken = signRefreshToken({ sub: user.id, jti: generateOpaqueToken(16) });
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });

  await tokenRepository.createRefreshToken({
    tokenHash: hashToken(refreshToken),
    userId: user.id,
    expiresAt: getTokenExpiry(refreshToken),
    userAgent: meta.userAgent ?? null,
    ip: meta.ip ?? null
  });

  return { accessToken, refreshToken };
}

async function getActiveUser(userId: string) {
  const user = await userRepository.findById(userId);
  if (!user || !user.isActive) {
    throw AppError.unauthorized('Account is not active');
  }
  const publicUser = await userRepository.findPublicById(userId);
  if (!publicUser) throw AppError.unauthorized('Account not found');
  return publicUser;
}

export const authService = {
  async register(data: { email: string; name: string; password: string }): Promise<PublicUser> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }
    const passwordHash = await hashPassword(data.password);
    return userRepository.create({
      email: data.email,
      name: data.name,
      passwordHash,
      role: Role.PARENT
    });
  },

  async login(data: { email: string; password: string }, meta: ClientMeta): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const user = await userRepository.findByEmail(data.email);
    if (!user || !user.isActive) {
      throw AppError.unauthorized('Invalid email or password');
    }
    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      throw AppError.unauthorized('Invalid email or password');
    }
    const publicUser = await userRepository.findPublicById(user.id);
    if (!publicUser) throw AppError.unauthorized('Invalid email or password');
    const tokens = await issueTokens(publicUser, meta);
    return { user: publicUser, tokens };
  },

  async refresh(refreshToken: string, meta: ClientMeta): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const stored = await tokenRepository.findRefreshToken(tokenHash);

    if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
      throw AppError.unauthorized('Refresh token is no longer valid');
    }

    await tokenRepository.revokeRefreshToken(tokenHash);
    const user = await getActiveUser(payload.sub);
    const tokens = await issueTokens(user, meta);
    return { user, tokens };
  },

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    const stored = await tokenRepository.findRefreshToken(tokenHash);
    if (stored && !stored.revokedAt) {
      await tokenRepository.revokeRefreshToken(tokenHash);
    }
  },

  async forgotPassword(email: string): Promise<{ devToken?: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      return {};
    }
    const rawToken = generateOpaqueToken(32);
    await tokenRepository.createPasswordReset({
      tokenHash: hashToken(rawToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS)
    });

    // In production this token is delivered by email; never expose it to the client.
    return env.isProduction ? {} : { devToken: rawToken };
  },

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(rawToken);
    const record = await tokenRepository.findPasswordReset(tokenHash);
    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      throw AppError.badRequest('Password reset token is invalid or has expired');
    }
    const passwordHash = await hashPassword(newPassword);
    await userRepository.updatePassword(record.userId, passwordHash);
    await tokenRepository.markPasswordResetUsed(record.id);
    await tokenRepository.revokeAllForUser(record.userId);
  }
};
