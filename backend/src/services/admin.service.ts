import { coloringAdminRepository } from '../repositories/coloring.repository';
import { storyAdminRepository } from '../repositories/story.repository';
import { gameAdminRepository } from '../repositories/game.repository';
import { achievementAdminRepository } from '../repositories/achievement.repository';
import { userAdminRepository } from '../repositories/user.repository';
import { childAdminRepository } from '../repositories/child.repository';

export const adminService = {
  async overview() {
    const [users, children, coloringPages, stories, games, achievements] = await Promise.all([
      userAdminRepository.count(),
      childAdminRepository.count(),
      coloringAdminRepository.count(),
      storyAdminRepository.count(),
      gameAdminRepository.count(),
      achievementAdminRepository.count()
    ]);
    return { users, children, coloringPages, stories, games, achievements };
  }
};
