import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { gameService } from '../services/game.service';
import { buildPaginationMeta, sendCreated, sendSuccess } from '../utils/apiResponse';
import { parsePagination } from '../utils/pagination';
import { AppError } from '../utils/AppError';

function user(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

export const gameController = {
  async list(req: Request, res: Response) {
    const query = req.query as Record<string, unknown>;
    const pagination = parsePagination(query, { pageSize: 50 });
    const { items, total } = await gameService.list({
      category: query.category as never,
      ageGroup: query.ageGroup as string | undefined,
      difficulty: query.difficulty as never,
      isActive: query.isActive as boolean | undefined,
      search: query.search as string | undefined,
      skip: pagination.skip,
      take: pagination.take
    });
    return sendSuccess(res, { games: items }, 200, buildPaginationMeta(pagination.page, pagination.pageSize, total));
  },

  async get(req: Request, res: Response) {
    const game = await gameService.getById(req.params.id);
    return sendSuccess(res, { game });
  },

  async getBySlug(req: Request, res: Response) {
    const game = await gameService.getBySlug(req.params.slug);
    return sendSuccess(res, { game });
  },

  async create(req: Request, res: Response) {
    const game = await gameService.create(user(req), req.body as Omit<Prisma.GameUncheckedCreateInput, 'createdById'>);
    return sendCreated(res, { game });
  },

  async update(req: Request, res: Response) {
    const game = await gameService.update(req.params.id, req.body as Prisma.GameUpdateInput);
    return sendSuccess(res, { game });
  },

  async remove(req: Request, res: Response) {
    await gameService.remove(req.params.id);
    return sendSuccess(res, { message: 'Game deleted' });
  },

  async start(req: Request, res: Response) {
    const session = await gameService.start(user(req), req.params.id, req.body.childId);
    return sendCreated(res, session);
  },

  async submitScore(req: Request, res: Response) {
    const result = await gameService.submitResult(user(req), req.params.id, req.body);
    return sendSuccess(res, result, result.rewarded ? 201 : 200);
  },

  async complete(req: Request, res: Response) {
    const result = await gameService.submitResult(user(req), req.params.id, req.body);
    return sendSuccess(res, result, result.rewarded ? 201 : 200);
  },

  async childScores(req: Request, res: Response) {
    const scores = await gameService.listChildScores(user(req), req.params.childId);
    return sendSuccess(res, { scores });
  }
};
