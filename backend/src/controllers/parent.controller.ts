import { Request, Response } from 'express';
import { ActivityType } from '@prisma/client';
import { parentService } from '../services/parent.service';
import { buildPaginationMeta, sendSuccess } from '../utils/apiResponse';
import { parsePagination } from '../utils/pagination';
import { AppError } from '../utils/AppError';

function user(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

export const parentController = {
  async dashboard(req: Request, res: Response) {
    const dashboard = await parentService.dashboard(user(req));
    return sendSuccess(res, { dashboard });
  },

  async childProgress(req: Request, res: Response) {
    const progress = await parentService.childProgress(user(req), req.params.id);
    return sendSuccess(res, progress);
  },

  async childActivity(req: Request, res: Response) {
    const query = req.query as Record<string, unknown>;
    const pagination = parsePagination(query, { pageSize: 20 });
    const { items, total } = await parentService.childActivity(user(req), req.params.id, {
      type: query.type as ActivityType | undefined,
      skip: pagination.skip,
      take: pagination.take
    });
    return sendSuccess(
      res,
      { activity: items },
      200,
      buildPaginationMeta(pagination.page, pagination.pageSize, total)
    );
  },

  async childReport(req: Request, res: Response) {
    const report = await parentService.childReport(user(req), req.params.id);
    return sendSuccess(res, report);
  }
};
