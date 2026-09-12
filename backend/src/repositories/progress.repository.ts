import { ActivityProgress, ActivityStatus, ActivityType, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface UpsertActivityData {
  childId: string;
  type: ActivityType;
  referenceId?: string | null;
  status?: ActivityStatus;
  progress?: number;
  xpEarned?: number;
  starsEarned?: number;
  metadata?: Prisma.InputJsonValue;
}

export const progressRepository = {
  async record(data: UpsertActivityData): Promise<ActivityProgress> {
    const existing = await prisma.activityProgress.findFirst({
      where: { childId: data.childId, type: data.type, referenceId: data.referenceId ?? null },
      orderBy: { updatedAt: 'desc' }
    });

    if (existing) {
      return prisma.activityProgress.update({
        where: { id: existing.id },
        data: {
          status: data.status ?? existing.status,
          progress: data.progress ?? existing.progress,
          xpEarned: data.xpEarned ?? existing.xpEarned,
          starsEarned: data.starsEarned ?? existing.starsEarned,
          metadata: data.metadata ?? existing.metadata ?? undefined
        }
      });
    }

    return prisma.activityProgress.create({
      data: {
        childId: data.childId,
        type: data.type,
        referenceId: data.referenceId ?? null,
        status: data.status ?? 'IN_PROGRESS',
        progress: data.progress ?? 0,
        xpEarned: data.xpEarned ?? 0,
        starsEarned: data.starsEarned ?? 0,
        metadata: data.metadata
      }
    });
  },

  listForChild(childId: string, filters: { type?: ActivityType; skip: number; take: number }) {
    const where: Prisma.ActivityProgressWhereInput = {
      childId,
      ...(filters.type ? { type: filters.type } : {})
    };
    return Promise.all([
      prisma.activityProgress.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: filters.skip,
        take: filters.take
      }),
      prisma.activityProgress.count({ where })
    ]);
  },

  countByType(childId: string, type: ActivityType, status?: ActivityStatus): Promise<number> {
    return prisma.activityProgress.count({
      where: { childId, type, ...(status ? { status } : {}) }
    });
  },

  recentForChild(childId: string, take = 10): Promise<ActivityProgress[]> {
    return prisma.activityProgress.findMany({
      where: { childId },
      orderBy: { updatedAt: 'desc' },
      take
    });
  }
};

export const activityAdminRepository = {
  findById(id: string) {
    return prisma.activityProgress.findUnique({ where: { id } });
  },
  update(id: string, data: Prisma.ActivityProgressUpdateInput) {
    return prisma.activityProgress.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.activityProgress.delete({ where: { id } });
  }
};
