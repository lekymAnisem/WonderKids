import { Request, Response } from 'express';
import { progressService } from '../services/progress.service';
import { accessService } from '../services/access.service';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';

function user(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

export const progressController = {
  async childProgress(req: Request, res: Response) {
    await accessService.assertChildAccess(user(req), req.params.childId);
    const progress = await progressService.summary(req.params.childId);
    return sendSuccess(res, progress);
  }
};
