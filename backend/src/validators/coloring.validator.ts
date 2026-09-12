import { z } from 'zod';
import { ColoringCategory, Difficulty } from '@prisma/client';
import { paginationQuerySchema } from './common.validator';

export const coloringCategoryEnum = z.nativeEnum(ColoringCategory);
export const difficultyEnum = z.nativeEnum(Difficulty);

export const coloringListQuerySchema = paginationQuerySchema.extend({
  category: coloringCategoryEnum.optional(),
  ageGroup: z.string().min(1).max(20).optional(),
  difficulty: difficultyEnum.optional(),
  search: z.string().max(100).optional(),
  isPublished: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional()
});

export const createColoringSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  category: coloringCategoryEnum,
  ageGroup: z.string().min(1).max(20),
  difficulty: difficultyEnum.optional(),
  lineArtUrl: z.string().min(1).max(2048),
  thumbnailUrl: z.string().max(2048).optional().nullable(),
  storageKey: z.string().max(512).optional().nullable(),
  isPublished: z.boolean().optional(),
  isAiGenerated: z.boolean().optional()
});

export const updateColoringSchema = createColoringSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required'
});

export const startColoringSessionSchema = z.object({
  childId: z.string().min(1)
});

export const saveColoringSessionSchema = z.object({
  childId: z.string().min(1),
  sessionId: z.string().min(1),
  canvasData: z.unknown().optional(),
  imageBase64: z.string().max(12 * 1024 * 1024).optional()
});

export const completeColoringSessionSchema = z.object({
  childId: z.string().min(1),
  sessionId: z.string().min(1)
});
