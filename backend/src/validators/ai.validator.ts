import { z } from 'zod';

export const generateColoringPageSchema = z.object({
  prompt: z.string().min(3, 'Please describe the picture').max(400),
  ageGroup: z.enum(['3-5', '4-6', '6-8', '8-10', '10-12']),
  childId: z.string().min(1).optional(),
  title: z.string().max(80).optional()
});
