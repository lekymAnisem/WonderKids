import { Router } from 'express';
import { childController } from '../controllers/child.controller';
import { coloringController } from '../controllers/coloring.controller';
import { storyController } from '../controllers/story.controller';
import { achievementController } from '../controllers/achievement.controller';
import { progressController } from '../controllers/progress.controller';
import { gameController } from '../controllers/game.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { childIdParamSchema, idParamSchema } from '../validators/common.validator';
import { createChildSchema, updateChildSchema } from '../validators/child.validator';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(childController.list));
router.post('/', validate({ body: createChildSchema }), asyncHandler(childController.create));

router.get(
  '/:childId/coloring',
  validate({ params: childIdParamSchema }),
  asyncHandler(coloringController.childSessions)
);
router.get(
  '/:childId/stories/progress',
  validate({ params: childIdParamSchema }),
  asyncHandler(storyController.listChildProgress)
);
router.get(
  '/:childId/achievements',
  validate({ params: childIdParamSchema }),
  asyncHandler(achievementController.childAchievements)
);
router.get(
  '/:childId/progress',
  validate({ params: childIdParamSchema }),
  asyncHandler(progressController.childProgress)
);
router.get(
  '/:childId/games/scores',
  validate({ params: childIdParamSchema }),
  asyncHandler(gameController.childScores)
);

router.get('/:id', validate({ params: idParamSchema }), asyncHandler(childController.get));
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateChildSchema }),
  asyncHandler(childController.update)
);
router.delete('/:id', validate({ params: idParamSchema }), asyncHandler(childController.remove));

export default router;
