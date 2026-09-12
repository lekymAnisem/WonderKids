import { Prisma, Story, StoryPage, StoryProgress } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface StoryListFilters {
  category?: Prisma.EnumStoryCategoryFilter;
  ageGroup?: string;
  difficulty?: Prisma.EnumDifficultyFilter;
  isPublished?: boolean;
  search?: string;
  skip: number;
  take: number;
}

export const storyRepository = {
  async list(filters: StoryListFilters): Promise<{ items: Story[]; total: number }> {
    const where: Prisma.StoryWhereInput = {
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.ageGroup ? { ageGroup: filters.ageGroup } : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
      ...(filters.isPublished !== undefined ? { isPublished: filters.isPublished } : {}),
      ...(filters.search
        ? { OR: [{ title: { contains: filters.search, mode: 'insensitive' } }, { description: { contains: filters.search, mode: 'insensitive' } }] }
        : {})
    };
    const [items, total] = await Promise.all([
      prisma.story.findMany({ where, orderBy: { createdAt: 'desc' }, skip: filters.skip, take: filters.take }),
      prisma.story.count({ where })
    ]);
    return { items, total };
  },

  findById(id: string): Promise<Story | null> {
    return prisma.story.findUnique({ where: { id } });
  },

  findWithPages(id: string): Promise<(Story & { pages: StoryPage[] }) | null> {
    return prisma.story.findUnique({
      where: { id },
      include: { pages: { orderBy: { pageNumber: 'asc' } } }
    });
  },

  create(data: Prisma.StoryUncheckedCreateInput): Promise<Story> {
    return prisma.story.create({ data });
  },

  update(id: string, data: Prisma.StoryUpdateInput): Promise<Story> {
    return prisma.story.update({ where: { id }, data });
  },

  delete(id: string): Promise<Story> {
    return prisma.story.delete({ where: { id } });
  },

  listPages(storyId: string): Promise<StoryPage[]> {
    return prisma.storyPage.findMany({ where: { storyId }, orderBy: { pageNumber: 'asc' } });
  },

  async replacePages(storyId: string, pages: Array<{ pageNumber: number; text: string; illustrationUrl?: string | null; audioUrl?: string | null }>): Promise<StoryPage[]> {
    await prisma.storyPage.deleteMany({ where: { storyId } });
    if (pages.length === 0) return [];
    await prisma.storyPage.createMany({ data: pages.map((page) => ({ ...page, storyId })) });
    return prisma.storyPage.findMany({ where: { storyId }, orderBy: { pageNumber: 'asc' } });
  },

  findProgress(childId: string, storyId: string): Promise<StoryProgress | null> {
    return prisma.storyProgress.findUnique({ where: { childId_storyId: { childId, storyId } } });
  },

  upsertProgress(
    childId: string,
    storyId: string,
    data: { currentPage?: number; readingTimeSeconds?: number; completed?: boolean }
  ): Promise<StoryProgress> {
    const completedAt = data.completed ? new Date() : undefined;
    return prisma.storyProgress.upsert({
      where: { childId_storyId: { childId, storyId } },
      create: {
        childId,
        storyId,
        currentPage: data.currentPage ?? 1,
        readingTimeSeconds: data.readingTimeSeconds ?? 0,
        completed: data.completed ?? false,
        completedAt,
        lastOpenedAt: new Date()
      },
      update: {
        ...(data.currentPage !== undefined ? { currentPage: data.currentPage } : {}),
        ...(data.readingTimeSeconds !== undefined ? { readingTimeSeconds: data.readingTimeSeconds } : {}),
        ...(data.completed !== undefined ? { completed: data.completed } : {}),
        ...(completedAt ? { completedAt } : {}),
        lastOpenedAt: new Date()
      }
    });
  },

  async listProgressForChild(childId: string): Promise<Array<StoryProgress & { story: Story }>> {
    return prisma.storyProgress.findMany({
      where: { childId },
      orderBy: { lastOpenedAt: 'desc' },
      include: { story: true }
    });
  },

  countCompletedForChild(childId: string): Promise<number> {
    return prisma.storyProgress.count({ where: { childId, completed: true } });
  }
};

export const storyAdminRepository = {
  count(): Promise<number> {
    return prisma.story.count();
  }
};
