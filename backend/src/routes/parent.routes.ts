import { Router } from 'express';
import { Role } from '@prisma/client';
import { parentController } from '../controllers/parent.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { idParamSchema } from '../validators/common.validator';

const router = Router();

router.use(authenticate, authorize(Role.PARENT, Role.ADMIN));

router.get('/dashboard', asyncHandler(parentController.dashboard));
router.get('/children/:id/progress', validate({ params: idParamSchema }), asyncHandler(parentController.childProgress));
router.get('/children/:id/activity', validate({ params: idParamSchema }), asyncHandler(parentController.childActivity));
router.get('/children/:id/report', validate({ params: idParamSchema }), asyncHandler(parentController.childReport));

export default router;
