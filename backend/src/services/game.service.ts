import { GameSessionStatus, Prisma } from '@prisma/client';
import { GameListFilters, gameRepository } from '../repositories/game.repository';
import { accessService, AuthUser } from './access.service';
import { progressService } from './progress.service';
import { GAME_SCORE_LIMITS, REWARDS } from '../config/constants';
import { slugify } from '../utils/slug';
import { AppError } from '../utils/AppError';

export interface SubmitResultInput {
  childId: string;
  sessionId: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
}

function assertReasonableScore(input: SubmitResultInput): void {
  const { maxScore, maxCorrectAnswers, maxWrongAnswers } = GAME_SCORE_LIMITS;

  const withinLimits =
    Number.isInteger(input.score) &&
    input.score >= 0 &&
    input.score <= maxScore &&
    Number.isInteger(input.correctAnswers) &&
    input.correctAnswers >= 0 &&
    input.correctAnswers <= maxCorrectAnswers &&
    Number.isInteger(input.wrongAnswers) &&
    input.wrongAnswers >= 0 &&
    input.wrongAnswers <= maxWrongAnswers;

  if (!withinLimits) {
    throw AppError.badRequest('Submitted score is outside the allowed range');
  }

  const answers = input.correctAnswers + input.wrongAnswers;
  if (answers > 0 && input.score > answers * 10000) {
    throw AppError.badRequest('Submitted score is inconsistent with the number of answers');
  }
}

export const gameService = {
  list(filters: GameListFilters) {
    return gameRepository.list(filters);
  },

  async getById(id: string) {
    const game = await gameRepository.findById(id);
    if (!game) throw AppError.notFound('Game not found');
    return game;
  },

  async getBySlug(slug: string) {
    const game = await gameRepository.findBySlug(slug);
    if (!game) throw AppError.notFound('Game not found');
    return game;
  },

  async create(user: AuthUser, data: Omit<Prisma.GameUncheckedCreateInput, 'createdById'>) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.title);
    const existing = await gameRepository.findBySlug(slug);
    if (existing) throw AppError.conflict('A game with this slug already exists');
    return gameRepository.create({ ...data, slug, createdById: user.id });
  },

  async update(id: string, data: Prisma.GameUpdateInput) {
    await gameService.getById(id);
    return gameRepository.update(id, data);
  },

  async remove(id: string) {
    await gameService.getById(id);
    return gameRepository.delete(id);
  },

  async start(user: AuthUser, gameId: string, childId: string) {
    await accessService.assertChildAccess(user, childId);

    const game = await gameRepository.findById(gameId);
    if (!game || !game.isActive) throw AppError.notFound('Game not found');

    const session = await gameRepository.createSession({ gameId, childId });
    return { sessionId: session.id, gameId, startedAt: session.startedAt };
  },

  async submitResult(user: AuthUser, gameId: string, input: SubmitResultInput) {
    await accessService.assertChildAccess(user, input.childId);

    const session = await gameRepository.findSessionById(input.sessionId);
    if (!session || session.gameId !== gameId) {
      throw AppError.notFound('Game session not found');
    }
    if (session.childId !== input.childId) {
      throw AppError.forbidden('This game session does not belong to the selected child');
    }

    if (session.score) {
      return { score: session.score, rewarded: false };
    }

    if (session.status !== GameSessionStatus.IN_PROGRESS) {
      throw AppError.conflict('This game session is no longer active');
    }

    assertReasonableScore(input);

    const durationSeconds = Math.round((Date.now() - session.startedAt.getTime()) / 1000);
    if (
      durationSeconds < GAME_SCORE_LIMITS.minDurationSeconds ||
      durationSeconds > GAME_SCORE_LIMITS.maxDurationSeconds
    ) {
      throw AppError.badRequest('Game duration is not plausible');
    }

    const score = await gameRepository.createScore({
      gameSessionId: session.id,
      score: input.score,
      correctAnswers: input.correctAnswers,
      wrongAnswers: input.wrongAnswers,
      durationSeconds
    });

    await gameRepository.completeSession(session.id);

    const totalAnswers = input.correctAnswers + input.wrongAnswers;
    const accuracy = totalAnswers > 0 ? input.correctAnswers / totalAnswers : 0;
    const bonusXp = accuracy >= 0.8 ? 10 : 0;
    const bonusStars = accuracy >= 0.8 ? 5 : 0;

    const { child, achievements } = await progressService.completeActivity({
      childId: input.childId,
      type: 'GAME',
      referenceId: gameId,
      xp: REWARDS.GAME_COMPLETE.xp + bonusXp,
      stars: REWARDS.GAME_COMPLETE.stars + bonusStars,
      metadata: {
        sessionId: session.id,
        score: input.score,
        correctAnswers: input.correctAnswers,
        wrongAnswers: input.wrongAnswers,
        durationSeconds
      }
    });

    return { score, rewarded: true, child, achievements };
  },

  async listChildScores(user: AuthUser, childId: string) {
    await accessService.assertChildAccess(user, childId);
    return gameRepository.listScoresForChild(childId);
  }
};
