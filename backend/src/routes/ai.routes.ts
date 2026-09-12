import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/authenticate';
import { aiLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { generateColoringPageSchema } from '../validators/ai.validator';

const router = Router();

router.post(
  '/coloring-page',
  authenticate,
  aiLimiter,
  validate({ body: generateColoringPageSchema }),
  asyncHandler(aiController.generateColoringPage)
);

export default router;
