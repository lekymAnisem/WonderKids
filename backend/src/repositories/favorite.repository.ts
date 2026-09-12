import { Favorite, FavoriteType } from '@prisma/client';
import { prisma } from '../config/prisma';

export const favoriteRepository = {
  list(childId: string): Promise<Favorite[]> {
    return prisma.favorite.findMany({ where: { childId }, orderBy: { createdAt: 'desc' } });
  },

  add(childId: string, targetType: FavoriteType, targetId: string): Promise<Favorite> {
    return prisma.favorite.upsert({
      where: { childId_targetType_targetId: { childId, targetType, targetId } },
      create: { childId, targetType, targetId },
      update: {}
    });
  },

  async remove(childId: string, targetType: FavoriteType, targetId: string): Promise<void> {
    await prisma.favorite.deleteMany({ where: { childId, targetType, targetId } });
  }
};
