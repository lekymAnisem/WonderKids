import { Router } from 'express';
import { Role } from '@prisma/client';
import { storyController } from '../controllers/story.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { idParamSchema } from '../validators/common.validator';
import {
  createStorySchema,
  storyListQuerySchema,
  storyProgressSchema,
  updateStoryPagesSchema,
  updateStorySchema
} from '../validators/story.validator';

const router = Router();

router.get('/', validate({ query: storyListQuerySchema }), asyncHandler(storyController.list));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(storyController.get));
router.get('/:id/pages', validate({ params: idParamSchema }), asyncHandler(storyController.pages));

router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validate({ body: createStorySchema }),
  asyncHandler(storyController.create)
);
router.patch(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate({ params: idParamSchema, body: updateStorySchema }),
  asyncHandler(storyController.update)
);
router.put(
  '/:id/pages',
  authenticate,
  authorize(Role.ADMIN),
  validate({ params: idParamSchema, body: updateStoryPagesSchema }),
  asyncHandler(storyController.replacePages)
);
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate({ params: idParamSchema }),
  asyncHandler(storyController.remove)
);

router.post(
  '/:id/progress',
  authenticate,
  validate({ params: idParamSchema, body: storyProgressSchema }),
  asyncHandler(storyController.recordProgress)
);

export default router;
