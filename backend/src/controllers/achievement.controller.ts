import { Request, Response } from 'express';
import { achievementService } from '../services/achievement.service';
import { accessService } from '../services/access.service';
import { sendCreated, sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';

function user(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

export const achievementController = {
  async list(_req: Request, res: Response) {
    const achievements = await achievementService.list();
    return sendSuccess(res, { achievements });
  },

  async childAchievements(req: Request, res: Response) {
    await accessService.assertChildAccess(user(req), req.params.childId);
    const achievements = await achievementService.listForChild(req.params.childId);
    return sendSuccess(res, { achievements });
  },

  async check(req: Request, res: Response) {
    const { childId } = req.body;
    await accessService.assertChildAccess(user(req), childId);
    const awarded = await achievementService.evaluate(childId);
    return sendSuccess(res, { awarded, awardedCount: awarded.length });
  },

  async create(req: Request, res: Response) {
    const achievement = await achievementService.create(req.body);
    return sendCreated(res, { achievement });
  },

  async update(req: Request, res: Response) {
    const achievement = await achievementService.update(req.params.id, req.body);
    return sendSuccess(res, { achievement });
  },

  async remove(req: Request, res: Response) {
    await achievementService.remove(req.params.id);
    return sendSuccess(res, { message: 'Achievement deleted' });
  }
};
