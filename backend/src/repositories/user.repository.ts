import { Prisma, Role, User } from '@prisma/client';
import { prisma } from '../config/prisma';

export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

export const userRepository = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  findPublicById(id: string): Promise<PublicUser | null> {
    return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  },

  create(data: { email: string; name: string; passwordHash: string; role?: Role }): Promise<PublicUser> {
    return prisma.user.create({
      data: { ...data, email: data.email.toLowerCase() },
      select: publicUserSelect
    });
  },

  updatePassword(userId: string, passwordHash: string): Promise<PublicUser> {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: publicUserSelect
    });
  },

  setActive(userId: string, isActive: boolean): Promise<PublicUser> {
    return prisma.user.update({ where: { id: userId }, data: { isActive }, select: publicUserSelect });
  }
};

export const userAdminRepository = {
  count(): Promise<number> {
    return prisma.user.count();
  }
};
