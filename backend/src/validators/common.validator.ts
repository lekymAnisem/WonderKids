import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().min(1, 'id is required')
});

export const childIdParamSchema = z.object({
  childId: z.string().min(1, 'childId is required')
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional()
});

export const uuidLikeId = z.string().min(1).max(64);
