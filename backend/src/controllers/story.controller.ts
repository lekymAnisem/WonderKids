import { Request, Response } from 'express';
import { storyService } from '../services/story.service';
import { buildPaginationMeta, sendCreated, sendSuccess } from '../utils/apiResponse';
import { parsePagination } from '../utils/pagination';
import { AppError } from '../utils/AppError';

function user(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

export const storyController = {
  async list(req: Request, res: Response) {
    const query = req.query as Record<string, unknown>;
    const pagination = parsePagination(query, { pageSize: 20 });
    const { items, total } = await storyService.list({
      category: query.category as never,
      ageGroup: query.ageGroup as string | undefined,
      difficulty: query.difficulty as never,
      isPublished: req.user ? (query.isPublished as boolean | undefined) : true,
      search: query.search as string | undefined,
      skip: pagination.skip,
      take: pagination.take
    });
    return sendSuccess(res, { stories: items }, 200, buildPaginationMeta(pagination.page, pagination.pageSize, total));
  },

  async get(req: Request, res: Response) {
    const story = await storyService.getWithPages(req.params.id);
    if (!story.isPublished && !req.user) throw AppError.notFound('Story not found');
    return sendSuccess(res, { story });
  },

  async pages(req: Request, res: Response) {
    const pages = await storyService.listPages(req.params.id);
    return sendSuccess(res, { pages });
  },

  async create(req: Request, res: Response) {
    const story = await storyService.create(user(req), req.body);
    return sendCreated(res, { story });
  },

  async update(req: Request, res: Response) {
    const story = await storyService.update(req.params.id, req.body);
    return sendSuccess(res, { story });
  },

  async replacePages(req: Request, res: Response) {
    const pages = await storyService.replacePages(req.params.id, req.body.pages);
    return sendSuccess(res, { pages });
  },

  async remove(req: Request, res: Response) {
    await storyService.remove(req.params.id);
    return sendSuccess(res, { message: 'Story deleted' });
  },

  async recordProgress(req: Request, res: Response) {
    const result = await storyService.recordProgress(user(req), req.params.id, req.body);
    return sendSuccess(res, result, result.rewarded ? 201 : 200);
  },

  async listChildProgress(req: Request, res: Response) {
    const progress = await storyService.listChildProgress(user(req), req.params.childId);
    return sendSuccess(res, { progress });
  }
};
