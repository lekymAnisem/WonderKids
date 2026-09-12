import { Router } from 'express';
import authRoutes from './auth.routes';
import childRoutes from './child.routes';
import coloringRoutes from './coloring.routes';
import storyRoutes from './story.routes';
import gameRoutes from './game.routes';
import achievementRoutes from './achievement.routes';
import parentRoutes from './parent.routes';
import adminRoutes from './admin.routes';
import aiRoutes from './ai.routes';
import filesRoutes from './files.routes';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ success: true, data: { name: 'WonderKids API', version: '1.0.0' } });
});

router.use('/auth', authRoutes);
router.use('/children', childRoutes);
router.use('/coloring', coloringRoutes);
router.use('/stories', storyRoutes);
router.use('/games', gameRoutes);
router.use('/achievements', achievementRoutes);
router.use('/parent', parentRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/files', filesRoutes);

export default router;
