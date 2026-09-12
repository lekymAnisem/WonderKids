import { z } from 'zod';

export const createChildSchema = z.object({
  displayName: z.string().min(1).max(60),
  avatar: z.string().max(2048).optional().nullable(),
  ageGroup: z.enum(['3-5', '4-6', '6-8', '8-10', '10-12'])
});

export const updateChildSchema = z
  .object({
    displayName: z.string().min(1).max(60).optional(),
    avatar: z.string().max(2048).optional().nullable(),
    ageGroup: z.enum(['3-5', '4-6', '6-8', '8-10', '10-12']).optional()
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });
