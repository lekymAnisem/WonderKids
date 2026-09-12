import { Router } from 'express';
import { achievementController } from '../controllers/achievement.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { checkAchievementsSchema } from '../validators/achievement.validator';

const router = Router();

router.get('/', asyncHandler(achievementController.list));
router.post('/check', authenticate, validate({ body: checkAchievementsSchema }), asyncHandler(achievementController.check));

export default router;
