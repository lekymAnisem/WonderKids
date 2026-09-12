import { ColoringSessionStatus, Prisma } from '@prisma/client';
import { coloringRepository, ColoringListFilters } from '../repositories/coloring.repository';
import { accessService, AuthUser } from './access.service';
import { progressService } from './progress.service';
import { storageService } from './storage.service';
import { REWARDS } from '../config/constants';
import { AppError } from '../utils/AppError';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

async function loadSessionOrThrow(sessionId: string, pageId: string) {
  const session = await coloringRepository.findSessionById(sessionId);
  if (!session || session.pageId !== pageId) {
    throw AppError.notFound('Coloring session not found for this page');
  }
  return session;
}

export const coloringService = {
  list(filters: ColoringListFilters) {
    return coloringRepository.list(filters);
  },

  async get(id: string) {
    const page = await coloringRepository.findById(id);
    if (!page) throw AppError.notFound('Coloring page not found');
    return page;
  },

  create(user: AuthUser, data: Prisma.ColoringPageUncheckedCreateInput) {
    return coloringRepository.create({ ...data, createdById: user.id });
  },

  async update(id: string, data: Prisma.ColoringPageUpdateInput) {
    await coloringService.get(id);
    return coloringRepository.update(id, data);
  },

  async remove(id: string) {
    const page = await coloringService.get(id);
    if (page.storageKey) {
      await storageService.delete(page.storageKey);
    }
    return coloringRepository.delete(id);
  },

  async startSession(user: AuthUser, pageId: string, childId: string) {
    await accessService.assertChildAccess(user, childId);

    const page = await coloringRepository.findById(pageId);
    if (!page || !page.isPublished) throw AppError.notFound('Coloring page not found');

    const existing = await coloringRepository.findActiveSession(childId, pageId);
    const session = existing ?? (await coloringRepository.createSession({ childId, pageId }));

    return { session, page };
  },

  async saveSession(
    user: AuthUser,
    pageId: string,
    input: { childId: string; sessionId: string; canvasData?: Prisma.InputJsonValue; imageBase64?: string }
  ) {
    await accessService.assertChildAccess(user, input.childId);
    const session = await loadSessionOrThrow(input.sessionId, pageId);

    if (session.childId !== input.childId) {
      throw AppError.forbidden('This coloring session does not belong to the selected child');
    }
    if (session.status === ColoringSessionStatus.COMPLETED) {
      return session;
    }

    let imageUrl: string | undefined;
    if (input.imageBase64) {
      const match = input.imageBase64.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);
      if (!match) throw AppError.badRequest('imageBase64 must be a png, jpeg or webp data URL');
      const buffer = Buffer.from(match[2], 'base64');
      if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
        throw AppError.badRequest(`Image must be between 1 byte and ${MAX_IMAGE_BYTES} bytes`);
      }
      const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
      const key = `coloring/${session.id}-${Date.now()}.${extension}`;
      const uploaded = await storageService.upload(buffer, key, `image/${match[1]}`);
      imageUrl = uploaded.url;
    }

    return coloringRepository.updateSession(session.id, {
      ...(input.canvasData !== undefined ? { canvasData: input.canvasData } : {}),
      ...(imageUrl ? { imageUrl } : {})
    });
  },

  async completeSession(user: AuthUser, pageId: string, input: { childId: string; sessionId: string }) {
    await accessService.assertChildAccess(user, input.childId);
    const session = await loadSessionOrThrow(input.sessionId, pageId);

    if (session.childId !== input.childId) {
      throw AppError.forbidden('This coloring session does not belong to the selected child');
    }
    if (session.status === ColoringSessionStatus.COMPLETED) {
      return { session, rewarded: false };
    }

    const updated = await coloringRepository.updateSession(session.id, {
      status: ColoringSessionStatus.COMPLETED,
      completedAt: new Date()
    });

    const { child, achievements } = await progressService.completeActivity({
      childId: input.childId,
      type: 'COLORING',
      referenceId: pageId,
      xp: REWARDS.COLORING_COMPLETE.xp,
      stars: REWARDS.COLORING_COMPLETE.stars,
      metadata: { sessionId: session.id }
    });

    return { session: updated, rewarded: true, child, achievements };
  },

  async listChildSessions(
    user: AuthUser,
    childId: string,
    filters: { status?: ColoringSessionStatus; skip: number; take: number }
  ) {
    await accessService.assertChildAccess(user, childId);
    return coloringRepository.listSessionsForChild(childId, filters);
  }
};
