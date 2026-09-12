import { ActivityType } from '@prisma/client';
import { childRepository } from '../repositories/child.repository';
import { coloringRepository } from '../repositories/coloring.repository';
import { gameRepository } from '../repositories/game.repository';
import { storyRepository } from '../repositories/story.repository';
import { progressRepository } from '../repositories/progress.repository';
import { achievementService } from './achievement.service';
import { accessService, AuthUser } from './access.service';
import { progressService } from './progress.service';
import { AppError } from '../utils/AppError';

async function childSnapshot(childId: string) {
  const [gamesCompleted, storiesCompleted, coloringCompleted, achievements] = await Promise.all([
    gameRepository.countCompletedForChild(childId),
    storyRepository.countCompletedForChild(childId),
    coloringRepository.countCompletedForChild(childId),
    achievementService.listForChild(childId)
  ]);
  return { gamesCompleted, storiesCompleted, coloringCompleted, achievements };
}

export const parentService = {
  async dashboard(user: AuthUser) {
    const children = await childRepository.listForParent(user.id);

    const summaries = await Promise.all(
      children.map(async (child) => {
        const snapshot = await childSnapshot(child.id);
        return {
          id: child.id,
          displayName: child.displayName,
          avatar: child.avatar,
          ageGroup: child.ageGroup,
          level: child.level,
          xp: child.xp,
          stars: child.stars,
          gamesCompleted: snapshot.gamesCompleted,
          storiesCompleted: snapshot.storiesCompleted,
          coloringCompleted: snapshot.coloringCompleted,
          achievementsCount: snapshot.achievements.length
        };
      })
    );

    return {
      childrenCount: children.length,
      totals: summaries.reduce(
        (acc, item) => ({
          stars: acc.stars + item.stars,
          xp: acc.xp + item.xp,
          gamesCompleted: acc.gamesCompleted + item.gamesCompleted,
          storiesCompleted: acc.storiesCompleted + item.storiesCompleted,
          coloringCompleted: acc.coloringCompleted + item.coloringCompleted
        }),
        { stars: 0, xp: 0, gamesCompleted: 0, storiesCompleted: 0, coloringCompleted: 0 }
      ),
      children: summaries
    };
  },

  async childProgress(user: AuthUser, childId: string) {
    await accessService.assertChildAccess(user, childId);
    return progressService.summary(childId);
  },

  async childActivity(
    user: AuthUser,
    childId: string,
    filters: { type?: ActivityType; skip: number; take: number }
  ) {
    await accessService.assertChildAccess(user, childId);
    const [items, total] = await progressRepository.listForChild(childId, filters);
    return { items, total };
  },

  async childReport(user: AuthUser, childId: string) {
    await accessService.assertChildAccess(user, childId);
    const child = await childRepository.findById(childId);
    if (!child) throw AppError.notFound('Child not found');

    const [snapshot, storyProgress, gameScores, coloringSessions, recentActivity] = await Promise.all([
      childSnapshot(childId),
      storyRepository.listProgressForChild(childId),
      gameRepository.listScoresForChild(childId),
      coloringRepository.listSessionsForChild(childId, { skip: 0, take: 50 }),
      progressRepository.recentForChild(childId, 20)
    ]);

    const readingTimeSeconds = storyProgress.reduce((sum, item) => sum + item.readingTimeSeconds, 0);

    return {
      child: {
        id: child.id,
        displayName: child.displayName,
        ageGroup: child.ageGroup,
        level: child.level,
        xp: child.xp,
        stars: child.stars
      },
      summary: {
        gamesCompleted: snapshot.gamesCompleted,
        storiesCompleted: snapshot.storiesCompleted,
        coloringCompleted: snapshot.coloringCompleted,
        achievementsCount: snapshot.achievements.length,
        readingTimeSeconds
      },
      achievements: snapshot.achievements,
      stories: storyProgress,
      games: gameScores,
      coloring: coloringSessions.items,
      recentActivity
    };
  }
};
