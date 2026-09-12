import { z } from 'zod';
import { Difficulty, GameCategory } from '@prisma/client';
import { paginationQuerySchema } from './common.validator';

export const gameCategoryEnum = z.nativeEnum(GameCategory);
export const gameDifficultyEnum = z.nativeEnum(Difficulty);

export const gameListQuerySchema = paginationQuerySchema.extend({
  category: gameCategoryEnum.optional(),
  ageGroup: z.string().min(1).max(20).optional(),
  difficulty: gameDifficultyEnum.optional(),
  search: z.string().max(100).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional()
});

export const createGameSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase kebab-case')
    .optional(),
  description: z.string().min(1).max(1000),
  thumbnailUrl: z.string().max(2048).optional().nullable(),
  category: gameCategoryEnum,
  difficulty: gameDifficultyEnum.optional(),
  ageGroup: z.string().min(1).max(20),
  instructions: z.string().min(1).max(4000),
  config: z.record(z.unknown()),
  isActive: z.boolean().optional()
});

export const updateGameSchema = createGameSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required'
});

export const startGameSchema = z.object({
  childId: z.string().min(1)
});

export const submitGameResultSchema = z.object({
  childId: z.string().min(1),
  sessionId: z.string().min(1),
  score: z.number().int().min(0).max(100000),
  correctAnswers: z.number().int().min(0).max(500),
  wrongAnswers: z.number().int().min(0).max(500)
});
