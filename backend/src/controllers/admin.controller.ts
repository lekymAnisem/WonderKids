import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { activityAdminRepository } from '../repositories/progress.repository';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';

export const adminController = {
  async overview(_req: Request, res: Response) {
    const overview = await adminService.overview();
    return sendSuccess(res, { overview });
  },

  async updateActivity(req: Request, res: Response) {
    const existing = await activityAdminRepository.findById(req.params.id);
    if (!existing) throw AppError.notFound('Activity not found');
    const activity = await activityAdminRepository.update(req.params.id, req.body);
    return sendSuccess(res, { activity });
  },

  async removeActivity(req: Request, res: Response) {
    const existing = await activityAdminRepository.findById(req.params.id);
    if (!existing) throw AppError.notFound('Activity not found');
    await activityAdminRepository.delete(req.params.id);
    return sendSuccess(res, { message: 'Activity deleted' });
  }
};
