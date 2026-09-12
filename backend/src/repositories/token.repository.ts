import { PasswordResetToken, RefreshToken } from '@prisma/client';
import { prisma } from '../config/prisma';

export const tokenRepository = {
  createRefreshToken(data: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    userAgent?: string | null;
    ip?: string | null;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  },

  findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },

  revokeRefreshToken(tokenHash: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({ where: { tokenHash }, data: { revokedAt: new Date() } });
  },

  revokeAllForUser(userId: string): Promise<{ count: number }> {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  },

  createPasswordReset(data: { tokenHash: string; userId: string; expiresAt: Date }): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({ data });
  },

  findPasswordReset(tokenHash: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  },

  markPasswordResetUsed(id: string): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
  },

  async deleteExpired(): Promise<number> {
    const now = new Date();
    const [refresh, reset] = await Promise.all([
      prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: now } } })
    ]);
    return refresh.count + reset.count;
  }
};
