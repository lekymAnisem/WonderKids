import { ActivityType } from '@prisma/client';
import { childRepository } from '../repositories/child.repository';
import { coloringRepository } from '../repositories/coloring.repository';
import { gameRepository } from '../repositories/game.repository';
import { storyRepository } from '../repositories/story.repository';
import { progressRepository } from '../repositories/progress.repository';
import { achievementService } from './achievement.service';
import { levelFromXp } from '../config/constants';
import { AppError } from '../utils/AppError';

export interface CompleteActivityInput {
  childId: string;
  type: ActivityType;
  referenceId?: string | null;
  xp: number;
  stars: number;
  progress?: number;
  metadata?: Record<string, unknown>;
}

export const progressService = {
  async completeActivity(input: CompleteActivityInput) {
    const child = await childRepository.findById(input.childId);
    if (!child) throw AppError.notFound('Child not found');

    const activity = await progressRepository.record({
      childId: input.childId,
      type: input.type,
      referenceId: input.referenceId ?? null,
      status: 'COMPLETED',
      progress: input.progress ?? 100,
      xpEarned: input.xp,
      starsEarned: input.stars,
      metadata: input.metadata as never
    });

    const xp = child.xp + input.xp;
    const updatedChild = await childRepository.update(input.childId, {
      xp,
      stars: child.stars + input.stars,
      level: levelFromXp(xp)
    });

    const achievements = await achievementService.evaluate(input.childId);

    return { child: updatedChild, activity, achievements };
  },

  async summary(childId: string) {
    const child = await childRepository.findById(childId);
    if (!child) throw AppError.notFound('Child not found');

    const [gamesCompleted, storiesCompleted, coloringCompleted, achievementCount, achievements, recentActivity] =
      await Promise.all([
        gameRepository.countCompletedForChild(childId),
        storyRepository.countCompletedForChild(childId),
        coloringRepository.countCompletedForChild(childId),
        achievementService.listForChild(childId).then((list) => list.length),
        achievementService.listForChild(childId),
        progressRepository.recentForChild(childId, 10)
      ]);

    const activitiesCompleted = await progressRepository.countByType(childId, 'ACTIVITY', 'COMPLETED');

    const [coloringActivity, storyActivity, gameActivity] = await Promise.all([
      progressRepository.countByType(childId, 'COLORING', 'COMPLETED'),
      progressRepository.countByType(childId, 'STORY', 'COMPLETED'),
      progressRepository.countByType(childId, 'GAME', 'COMPLETED')
    ]);

    return {
      child: {
        id: child.id,
        displayName: child.displayName,
        avatar: child.avatar,
        ageGroup: child.ageGroup
      },
      level: child.level,
      xp: child.xp,
      stars: child.stars,
      gamesCompleted,
      storiesCompleted,
      coloringCompleted,
      activitiesCompleted,
      achievementsCount: achievementCount,
      achievements,
      learningCategories: {
        coloring: coloringActivity,
        stories: storyActivity,
        games: gameActivity,
        activities: activitiesCompleted
      },
      recentActivity
    };
  }
};
