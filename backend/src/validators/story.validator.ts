import { z } from 'zod';
import { Difficulty, StoryCategory } from '@prisma/client';
import { paginationQuerySchema } from './common.validator';

export const storyCategoryEnum = z.nativeEnum(StoryCategory);

export const storyListQuerySchema = paginationQuerySchema.extend({
  category: storyCategoryEnum.optional(),
  ageGroup: z.string().min(1).max(20).optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  search: z.string().max(100).optional(),
  isPublished: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional()
});

export const storyPageSchema = z.object({
  pageNumber: z.number().int().positive(),
  text: z.string().min(1).max(5000),
  illustrationUrl: z.string().max(2048).optional().nullable(),
  audioUrl: z.string().max(2048).optional().nullable()
});

export const createStorySchema = z.object({
  title: z.string().min(1).max(140),
  description: z.string().min(1).max(1000),
  coverImageUrl: z.string().max(2048).optional().nullable(),
  category: storyCategoryEnum,
  ageGroup: z.string().min(1).max(20),
  readingTimeMinutes: z.number().int().positive().max(120).optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  isPublished: z.boolean().optional(),
  pages: z.array(storyPageSchema).max(200).optional()
});

export const updateStorySchema = createStorySchema
  .omit({ pages: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export const updateStoryPagesSchema = z.object({
  pages: z.array(storyPageSchema).min(1).max(200)
});

export const storyProgressSchema = z.object({
  childId: z.string().min(1),
  currentPage: z.number().int().positive().optional(),
  readingTimeSeconds: z.number().int().nonnegative().optional(),
  completed: z.boolean().optional()
});
