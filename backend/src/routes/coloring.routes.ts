import { Router } from 'express';
import { Role } from '@prisma/client';
import { coloringController } from '../controllers/coloring.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { idParamSchema } from '../validators/common.validator';
import {
  coloringListQuerySchema,
  completeColoringSessionSchema,
  createColoringSchema,
  saveColoringSessionSchema,
  startColoringSessionSchema,
  updateColoringSchema
} from '../validators/coloring.validator';

const router = Router();

router.get('/', validate({ query: coloringListQuerySchema }), asyncHandler(coloringController.list));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(coloringController.get));

router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validate({ body: createColoringSchema }),
  asyncHandler(coloringController.create)
);
router.patch(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate({ params: idParamSchema, body: updateColoringSchema }),
  asyncHandler(coloringController.update)
);
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate({ params: idParamSchema }),
  asyncHandler(coloringController.remove)
);

router.post(
  '/:id/session',
  authenticate,
  validate({ params: idParamSchema, body: startColoringSessionSchema }),
  asyncHandler(coloringController.startSession)
);
router.post(
  '/:id/save',
  authenticate,
  validate({ params: idParamSchema, body: saveColoringSessionSchema }),
  asyncHandler(coloringController.saveSession)
);
router.post(
  '/:id/complete',
  authenticate,
  validate({ params: idParamSchema, body: completeColoringSessionSchema }),
  asyncHandler(coloringController.completeSession)
);

export default router;
