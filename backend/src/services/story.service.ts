import { Prisma } from '@prisma/client';
import { StoryListFilters, storyRepository } from '../repositories/story.repository';
import { accessService, AuthUser } from './access.service';
import { progressService } from './progress.service';
import { REWARDS } from '../config/constants';
import { AppError } from '../utils/AppError';

export interface StoryPageInput {
  pageNumber: number;
  text: string;
  illustrationUrl?: string | null;
  audioUrl?: string | null;
}

export type CreateStoryInput = Omit<Prisma.StoryUncheckedCreateInput, 'createdById'> & {
  pages?: StoryPageInput[];
};

export const storyService = {
  list(filters: StoryListFilters) {
    return storyRepository.list(filters);
  },

  async getWithPages(id: string) {
    const story = await storyRepository.findWithPages(id);
    if (!story) throw AppError.notFound('Story not found');
    return story;
  },

  async listPages(id: string) {
    const story = await storyRepository.findById(id);
    if (!story) throw AppError.notFound('Story not found');
    return storyRepository.listPages(id);
  },

  async create(user: AuthUser, data: CreateStoryInput) {
    const { pages, ...storyData } = data;
    const story = await storyRepository.create({ ...storyData, createdById: user.id });
    if (pages && pages.length > 0) {
      await storyRepository.replacePages(story.id, pages);
    }
    return story;
  },

  async update(id: string, data: Prisma.StoryUpdateInput) {
    await storyService.getWithPages(id);
    return storyRepository.update(id, data);
  },

  async replacePages(id: string, pages: StoryPageInput[]) {
    await storyService.getWithPages(id);
    return storyRepository.replacePages(id, pages);
  },

  async remove(id: string) {
    await storyService.getWithPages(id);
    return storyRepository.delete(id);
  },

  async recordProgress(
    user: AuthUser,
    storyId: string,
    input: { childId: string; currentPage?: number; readingTimeSeconds?: number; completed?: boolean }
  ) {
    await accessService.assertChildAccess(user, input.childId);

    const story = await storyRepository.findById(storyId);
    if (!story) throw AppError.notFound('Story not found');

    const previous = await storyRepository.findProgress(input.childId, storyId);
    const wasCompleted = previous?.completed ?? false;

    const progress = await storyRepository.upsertProgress(input.childId, storyId, input);

    const justCompleted = Boolean(input.completed) && !wasCompleted;
    if (!justCompleted) {
      return { progress, rewarded: false };
    }

    const { child, achievements } = await progressService.completeActivity({
      childId: input.childId,
      type: 'STORY',
      referenceId: storyId,
      xp: REWARDS.STORY_COMPLETE.xp,
      stars: REWARDS.STORY_COMPLETE.stars,
      metadata: { currentPage: progress.currentPage, readingTimeSeconds: progress.readingTimeSeconds }
    });

    return { progress, rewarded: true, child, achievements };
  },

  async listChildProgress(user: AuthUser, childId: string) {
    await accessService.assertChildAccess(user, childId);
    return storyRepository.listProgressForChild(childId);
  }
};
