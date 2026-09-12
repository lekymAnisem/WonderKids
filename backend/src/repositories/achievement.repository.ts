import { Achievement, ChildAchievement, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export const achievementRepository = {
  list(): Promise<Achievement[]> {
    return prisma.achievement.findMany({ orderBy: { title: 'asc' } });
  },

  findById(id: string): Promise<Achievement | null> {
    return prisma.achievement.findUnique({ where: { id } });
  },

  findByCode(code: string): Promise<Achievement | null> {
    return prisma.achievement.findUnique({ where: { code } });
  },

  create(data: Prisma.AchievementUncheckedCreateInput): Promise<Achievement> {
    return prisma.achievement.create({ data });
  },

  update(id: string, data: Prisma.AchievementUpdateInput): Promise<Achievement> {
    return prisma.achievement.update({ where: { id }, data });
  },

  delete(id: string): Promise<Achievement> {
    return prisma.achievement.delete({ where: { id } });
  },

  award(childId: string, achievementId: string): Promise<ChildAchievement> {
    return prisma.childAchievement.upsert({
      where: { childId_achievementId: { childId, achievementId } },
      create: { childId, achievementId },
      update: {}
    });
  },

  listForChild(childId: string): Promise<Array<ChildAchievement & { achievement: Achievement }>> {
    return prisma.childAchievement.findMany({
      where: { childId },
      orderBy: { awardedAt: 'desc' },
      include: { achievement: true }
    });
  },

  async hasAchievement(childId: string, achievementId: string): Promise<boolean> {
    const found = await prisma.childAchievement.findUnique({
      where: { childId_achievementId: { childId, achievementId } },
      select: { id: true }
    });
    return Boolean(found);
  },

  countForChild(childId: string): Promise<number> {
    return prisma.childAchievement.count({ where: { childId } });
  }
};

export const achievementAdminRepository = {
  count(): Promise<number> {
    return prisma.achievement.count();
  }
};
