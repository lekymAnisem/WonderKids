import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { coloringController } from '../controllers/coloring.controller';
import { storyController } from '../controllers/story.controller';
import { gameController } from '../controllers/game.controller';
import { achievementController } from '../controllers/achievement.controller';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { idParamSchema } from '../validators/common.validator';
import { createColoringSchema, updateColoringSchema } from '../validators/coloring.validator';
import { createStorySchema, updateStoryPagesSchema, updateStorySchema } from '../validators/story.validator';
import { createGameSchema, updateGameSchema } from '../validators/game.validator';
import { createAchievementSchema, updateAchievementSchema } from '../validators/achievement.validator';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/overview', asyncHandler(adminController.overview));

router.post('/coloring', validate({ body: createColoringSchema }), asyncHandler(coloringController.create));
router.patch(
  '/coloring/:id',
  validate({ params: idParamSchema, body: updateColoringSchema }),
  asyncHandler(coloringController.update)
);
router.delete('/coloring/:id', validate({ params: idParamSchema }), asyncHandler(coloringController.remove));

router.post('/stories', validate({ body: createStorySchema }), asyncHandler(storyController.create));
router.patch(
  '/stories/:id',
  validate({ params: idParamSchema, body: updateStorySchema }),
  asyncHandler(storyController.update)
);
router.put(
  '/stories/:id/pages',
  validate({ params: idParamSchema, body: updateStoryPagesSchema }),
  asyncHandler(storyController.replacePages)
);
router.delete('/stories/:id', validate({ params: idParamSchema }), asyncHandler(storyController.remove));

router.post('/games', validate({ body: createGameSchema }), asyncHandler(gameController.create));
router.patch(
  '/games/:id',
  validate({ params: idParamSchema, body: updateGameSchema }),
  asyncHandler(gameController.update)
);
router.delete('/games/:id', validate({ params: idParamSchema }), asyncHandler(gameController.remove));

router.post('/achievements', validate({ body: createAchievementSchema }), asyncHandler(achievementController.create));
router.patch(
  '/achievements/:id',
  validate({ params: idParamSchema, body: updateAchievementSchema }),
  asyncHandler(achievementController.update)
);
router.delete('/achievements/:id', validate({ params: idParamSchema }), asyncHandler(achievementController.remove));

router.patch('/activities/:id', validate({ params: idParamSchema }), asyncHandler(adminController.updateActivity));
router.delete('/activities/:id', validate({ params: idParamSchema }), asyncHandler(adminController.removeActivity));

export default router;
