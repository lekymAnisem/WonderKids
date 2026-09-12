import { Game, GameScore, GameSession, GameSessionStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface GameListFilters {
  category?: Prisma.EnumGameCategoryFilter;
  ageGroup?: string;
  difficulty?: Prisma.EnumDifficultyFilter;
  isActive?: boolean;
  search?: string;
  skip: number;
  take: number;
}

export const gameRepository = {
  async list(filters: GameListFilters): Promise<{ items: Game[]; total: number }> {
    const where: Prisma.GameWhereInput = {
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.ageGroup ? { ageGroup: filters.ageGroup } : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(filters.search
        ? { OR: [{ title: { contains: filters.search, mode: 'insensitive' } }, { description: { contains: filters.search, mode: 'insensitive' } }] }
        : {})
    };
    const [items, total] = await Promise.all([
      prisma.game.findMany({ where, orderBy: { title: 'asc' }, skip: filters.skip, take: filters.take }),
      prisma.game.count({ where })
    ]);
    return { items, total };
  },

  findById(id: string): Promise<Game | null> {
    return prisma.game.findUnique({ where: { id } });
  },

  findBySlug(slug: string): Promise<Game | null> {
    return prisma.game.findUnique({ where: { slug } });
  },

  create(data: Prisma.GameUncheckedCreateInput): Promise<Game> {
    return prisma.game.create({ data });
  },

  update(id: string, data: Prisma.GameUpdateInput): Promise<Game> {
    return prisma.game.update({ where: { id }, data });
  },

  delete(id: string): Promise<Game> {
    return prisma.game.delete({ where: { id } });
  },

  createSession(data: { gameId: string; childId: string }): Promise<GameSession> {
    return prisma.gameSession.create({ data });
  },

  findSessionById(id: string): Promise<(GameSession & { score: GameScore | null }) | null> {
    return prisma.gameSession.findUnique({ where: { id }, include: { score: true } });
  },

  completeSession(id: string): Promise<GameSession> {
    return prisma.gameSession.update({
      where: { id },
      data: { status: GameSessionStatus.COMPLETED, endedAt: new Date() }
    });
  },

  createScore(data: {
    gameSessionId: string;
    score: number;
    correctAnswers: number;
    wrongAnswers: number;
    durationSeconds: number;
  }): Promise<GameScore> {
    return prisma.gameScore.create({ data });
  },

  async listScoresForChild(childId: string): Promise<Array<GameScore & { gameSession: GameSession & { game: Game } }>> {
    return prisma.gameScore.findMany({
      where: { gameSession: { childId } },
      orderBy: { createdAt: 'desc' },
      include: { gameSession: { include: { game: true } } }
    });
  },

  countCompletedForChild(childId: string): Promise<number> {
    return prisma.gameSession.count({ where: { childId, status: GameSessionStatus.COMPLETED } });
  }
};

export const gameAdminRepository = {
  count(): Promise<number> {
    return prisma.game.count();
  }
};
