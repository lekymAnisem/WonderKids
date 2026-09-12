import { Router } from 'express';
import { Role } from '@prisma/client';
import { gameController } from '../controllers/game.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { idParamSchema } from '../validators/common.validator';
import {
  createGameSchema,
  gameListQuerySchema,
  startGameSchema,
  submitGameResultSchema,
  updateGameSchema
} from '../validators/game.validator';

const router = Router();

router.get('/', validate({ query: gameListQuerySchema }), asyncHandler(gameController.list));
router.get('/slug/:slug', asyncHandler(gameController.getBySlug));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(gameController.get));

router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validate({ body: createGameSchema }),
  asyncHandler(gameController.create)
);
router.patch(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate({ params: idParamSchema, body: updateGameSchema }),
  asyncHandler(gameController.update)
);
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate({ params: idParamSchema }),
  asyncHandler(gameController.remove)
);

router.post(
  '/:id/start',
  authenticate,
  validate({ params: idParamSchema, body: startGameSchema }),
  asyncHandler(gameController.start)
);
router.post(
  '/:id/score',
  authenticate,
  validate({ params: idParamSchema, body: submitGameResultSchema }),
  asyncHandler(gameController.submitScore)
);
router.post(
  '/:id/complete',
  authenticate,
  validate({ params: idParamSchema, body: submitGameResultSchema }),
  asyncHandler(gameController.complete)
);

export default router;
