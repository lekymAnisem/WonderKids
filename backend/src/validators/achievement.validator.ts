import { z } from 'zod';

export const achievementCriteriaSchema = z.object({
  metric: z.enum([
    'games_completed',
    'stories_completed',
    'coloring_completed',
    'total_completed',
    'total_stars',
    'level'
  ]),
  count: z.number().int().positive()
});

export const createAchievementSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[A-Z0-9_]+$/, 'code must be UPPER_SNAKE_CASE'),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  icon: z.string().max(120).optional().nullable(),
  criteria: achievementCriteriaSchema,
  xpReward: z.number().int().min(0).max(1000).optional(),
  starReward: z.number().int().min(0).max(1000).optional()
});

export const updateAchievementSchema = createAchievementSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required'
});

export const checkAchievementsSchema = z.object({
  childId: z.string().min(1)
});
