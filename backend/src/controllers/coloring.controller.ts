import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { coloringService } from '../services/coloring.service';
import { sendCreated, sendSuccess, buildPaginationMeta } from '../utils/apiResponse';
import { parsePagination } from '../utils/pagination';
import { AppError } from '../utils/AppError';

function user(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

export const coloringController = {
  async list(req: Request, res: Response) {
    const query = req.query as Record<string, unknown>;
    const pagination = parsePagination(query, { pageSize: 20 });
    const { items, total } = await coloringService.list({
      category: query.category as never,
      ageGroup: query.ageGroup as string | undefined,
      difficulty: query.difficulty as never,
      isPublished: req.user ? (query.isPublished as boolean | undefined) : true,
      search: query.search as string | undefined,
      skip: pagination.skip,
      take: pagination.take
    });
    return sendSuccess(res, { coloringPages: items }, 200, buildPaginationMeta(pagination.page, pagination.pageSize, total));
  },

  async get(req: Request, res: Response) {
    const page = await coloringService.get(req.params.id);
    if (!page.isPublished && !req.user) throw AppError.notFound('Coloring page not found');
    return sendSuccess(res, { coloringPage: page });
  },

  async create(req: Request, res: Response) {
    const page = await coloringService.create(user(req), req.body as Prisma.ColoringPageUncheckedCreateInput);
    return sendCreated(res, { coloringPage: page });
  },

  async update(req: Request, res: Response) {
    const page = await coloringService.update(req.params.id, req.body as Prisma.ColoringPageUpdateInput);
    return sendSuccess(res, { coloringPage: page });
  },

  async remove(req: Request, res: Response) {
    await coloringService.remove(req.params.id);
    return sendSuccess(res, { message: 'Coloring page deleted' });
  },

  async startSession(req: Request, res: Response) {
    const { childId } = req.body;
    const { session, page } = await coloringService.startSession(user(req), req.params.id, childId);
    return sendCreated(res, { session, coloringPage: page });
  },

  async saveSession(req: Request, res: Response) {
    const session = await coloringService.saveSession(user(req), req.params.id, {
      childId: req.body.childId,
      sessionId: req.body.sessionId,
      canvasData: req.body.canvasData as Prisma.InputJsonValue | undefined,
      imageBase64: req.body.imageBase64
    });
    return sendSuccess(res, { session });
  },

  async completeSession(req: Request, res: Response) {
    const result = await coloringService.completeSession(user(req), req.params.id, {
      childId: req.body.childId,
      sessionId: req.body.sessionId
    });
    return sendSuccess(res, result);
  },

  async childSessions(req: Request, res: Response) {
    const query = req.query as Record<string, unknown>;
    const pagination = parsePagination(query, { pageSize: 20 });
    const { items, total } = await coloringService.listChildSessions(user(req), req.params.childId, {
      status: query.status as never,
      skip: pagination.skip,
      take: pagination.take
    });
    return sendSuccess(
      res,
      { coloringSessions: items },
      200,
      buildPaginationMeta(pagination.page, pagination.pageSize, total)
    );
  }
};
