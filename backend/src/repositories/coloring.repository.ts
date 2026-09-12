import { ColoringPage, ColoringSession, ColoringSessionStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface ColoringListFilters {
  category?: Prisma.EnumColoringCategoryFilter;
  ageGroup?: string;
  difficulty?: Prisma.EnumDifficultyFilter;
  isPublished?: boolean;
  search?: string;
  skip: number;
  take: number;
}

export const coloringRepository = {
  async list(filters: ColoringListFilters): Promise<{ items: ColoringPage[]; total: number }> {
    const where: Prisma.ColoringPageWhereInput = {
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.ageGroup ? { ageGroup: filters.ageGroup } : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
      ...(filters.isPublished !== undefined ? { isPublished: filters.isPublished } : {}),
      ...(filters.search
        ? { OR: [{ title: { contains: filters.search, mode: 'insensitive' } }, { description: { contains: filters.search, mode: 'insensitive' } }] }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.coloringPage.findMany({ where, orderBy: { createdAt: 'desc' }, skip: filters.skip, take: filters.take }),
      prisma.coloringPage.count({ where })
    ]);
    return { items, total };
  },

  findById(id: string): Promise<ColoringPage | null> {
    return prisma.coloringPage.findUnique({ where: { id } });
  },

  create(data: Prisma.ColoringPageUncheckedCreateInput): Promise<ColoringPage> {
    return prisma.coloringPage.create({ data });
  },

  update(id: string, data: Prisma.ColoringPageUpdateInput): Promise<ColoringPage> {
    return prisma.coloringPage.update({ where: { id }, data });
  },

  delete(id: string): Promise<ColoringPage> {
    return prisma.coloringPage.delete({ where: { id } });
  },

  createSession(data: { childId: string; pageId: string }): Promise<ColoringSession> {
    return prisma.coloringSession.create({ data });
  },

  findSessionById(id: string): Promise<ColoringSession | null> {
    return prisma.coloringSession.findUnique({ where: { id } });
  },

  findActiveSession(childId: string, pageId: string): Promise<ColoringSession | null> {
    return prisma.coloringSession.findFirst({
      where: { childId, pageId, status: ColoringSessionStatus.IN_PROGRESS },
      orderBy: { startedAt: 'desc' }
    });
  },

  updateSession(id: string, data: Prisma.ColoringSessionUpdateInput): Promise<ColoringSession> {
    return prisma.coloringSession.update({ where: { id }, data });
  },

  async listSessionsForChild(
    childId: string,
    filters: { status?: ColoringSessionStatus; skip: number; take: number }
  ): Promise<{ items: ColoringSession[]; total: number }> {
    const where: Prisma.ColoringSessionWhereInput = {
      childId,
      ...(filters.status ? { status: filters.status } : {})
    };
    const [items, total] = await Promise.all([
      prisma.coloringSession.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: filters.skip,
        take: filters.take,
        include: { page: true }
      }),
      prisma.coloringSession.count({ where })
    ]);
    return { items, total };
  },

  countCompletedForChild(childId: string): Promise<number> {
    return prisma.coloringSession.count({ where: { childId, status: ColoringSessionStatus.COMPLETED } });
  }
};

export const coloringAdminRepository = {
  count(): Promise<number> {
    return prisma.coloringPage.count();
  }
};
