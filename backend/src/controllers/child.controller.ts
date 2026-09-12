import { Request, Response } from 'express';
import { childService } from '../services/child.service';
import { sendCreated, sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';

function user(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

export const childController = {
  async create(req: Request, res: Response) {
    const child = await childService.create(user(req), req.body);
    return sendCreated(res, { child });
  },

  async list(req: Request, res: Response) {
    const children = await childService.list(user(req));
    return sendSuccess(res, { children });
  },

  async get(req: Request, res: Response) {
    const child = await childService.get(user(req), req.params.id);
    return sendSuccess(res, { child });
  },

  async update(req: Request, res: Response) {
    const child = await childService.update(user(req), req.params.id, req.body);
    return sendSuccess(res, { child });
  },

  async remove(req: Request, res: Response) {
    await childService.remove(user(req), req.params.id);
    return sendSuccess(res, { message: 'Child profile deleted' });
  }
};
