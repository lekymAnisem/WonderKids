import { Achievement, ChildAchievement, Prisma } from '@prisma/client';
import { achievementRepository } from '../repositories/achievement.repository';
import { childRepository } from '../repositories/child.repository';
import { coloringRepository } from '../repositories/coloring.repository';
import { gameRepository } from '../repositories/game.repository';
import { storyRepository } from '../repositories/story.repository';
import { levelFromXp } from '../config/constants';
import { AppError } from '../utils/AppError';

export interface AchievementCriteria {
  metric:
    | 'games_completed'
    | 'stories_completed'
    | 'coloring_completed'
    | 'total_completed'
    | 'total_stars'
    | 'level';
  count: number;
}

async function metricValue(childId: string, metric: AchievementCriteria['metric']): Promise<number> {
  switch (metric) {
    case 'games_completed':
      return gameRepository.countCompletedForChild(childId);
    case 'stories_completed':
      return storyRepository.countCompletedForChild(childId);
    case 'coloring_completed':
      return coloringRepository.countCompletedForChild(childId);
    case 'total_completed': {
      const [games, stories, coloring] = await Promise.all([
        gameRepository.countCompletedForChild(childId),
        storyRepository.countCompletedForChild(childId),
        coloringRepository.countCompletedForChild(childId)
      ]);
      return games + stories + coloring;
    }
    case 'total_stars': {
      const child = await childRepository.findById(childId);
      return child?.stars ?? 0;
    }
    case 'level': {
      const child = await childRepository.findById(childId);
      return child?.level ?? 1;
    }
    default:
      return 0;
  }
}

export const achievementService = {
  list(): Promise<Achievement[]> {
    return achievementRepository.list();
  },

  listForChild(childId: string) {
    return achievementRepository.listForChild(childId);
  },

  create(data: {
    code: string;
    title: string;
    description: string;
    icon?: string | null;
    criteria: AchievementCriteria;
    xpReward?: number;
    starReward?: number;
  }): Promise<Achievement> {
    return achievementRepository.create({
      code: data.code,
      title: data.title,
      description: data.description,
      icon: data.icon ?? null,
      criteria: data.criteria as unknown as import('@prisma/client').Prisma.InputJsonValue,
      xpReward: data.xpReward ?? 0,
      starReward: data.starReward ?? 0
    });
  },

  async update(id: string, data: Prisma.AchievementUpdateInput) {
    const existing = await achievementRepository.findById(id);
    if (!existing) throw AppError.notFound('Achievement not found');
    return achievementRepository.update(id, data);
  },

  async remove(id: string) {
    const existing = await achievementRepository.findById(id);
    if (!existing) throw AppError.notFound('Achievement not found');
    return achievementRepository.delete(id);
  },

  async evaluate(childId: string): Promise<Array<ChildAchievement & { achievement: Achievement }>> {
    const achievements = await achievementRepository.list();
    const newlyAwarded: Array<ChildAchievement & { achievement: Achievement }> = [];

    for (const achievement of achievements) {
      const criteria = achievement.criteria as unknown as AchievementCriteria;
      if (!criteria || typeof criteria.count !== 'number') continue;

      const already = await achievementRepository.hasAchievement(childId, achievement.id);
      if (already) continue;

      const value = await metricValue(childId, criteria.metric);
      if (value < criteria.count) continue;

      const awardRecord = await achievementRepository.award(childId, achievement.id);

      if (achievement.xpReward || achievement.starReward) {
        const child = await childRepository.findById(childId);
        if (child) {
          const xp = child.xp + achievement.xpReward;
          await childRepository.update(childId, {
            xp,
            stars: child.stars + achievement.starReward,
            level: levelFromXp(xp)
          });
        }
      }

      newlyAwarded.push({ ...awardRecord, achievement });
    }

    return newlyAwarded;
  }
};
