import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { createChild, createGame, createUser } from './helpers/factory';

const app = createApp();

async function backdateSession(sessionId: string, secondsAgo: number): Promise<void> {
  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { startedAt: new Date(Date.now() - secondsAgo * 1000) }
  });
}

describe('Games API', () => {
  it('lists games and looks them up by slug', async () => {
    const game = await createGame({ slug: 'memory-match-test' });

    const list = await request(app).get('/api/games');
    expect(list.status).toBe(200);
    expect(list.body.data.games.length).toBe(1);

    const bySlug = await request(app).get('/api/games/slug/memory-match-test');
    expect(bySlug.status).toBe(200);
    expect(bySlug.body.data.game.id).toBe(game.id);
  });

  it('validates a legitimate score and awards rewards once', async () => {
    await prisma.achievement.deleteMany();
    const parent = await createUser();
    const child = await createChild(parent.user.id);
    const game = await createGame();

    const start = await request(app)
      .post(`/api/games/${game.id}/start`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id });
    expect(start.status).toBe(201);
    const sessionId = start.body.data.sessionId as string;
    await backdateSession(sessionId, 30);

    const score = await request(app)
      .post(`/api/games/${game.id}/score`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id, sessionId, score: 850, correctAnswers: 9, wrongAnswers: 1 });
    expect(score.status).toBe(201);
    expect(score.body.data.rewarded).toBe(true);

    const childAfter = await prisma.child.findUniqueOrThrow({ where: { id: child.id } });
    expect(childAfter.xp).toBe(30);
    expect(childAfter.stars).toBe(15);

    const replay = await request(app)
      .post(`/api/games/${game.id}/complete`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id, sessionId, score: 850, correctAnswers: 9, wrongAnswers: 1 });
    expect(replay.status).toBe(200);
    expect(replay.body.data.rewarded).toBe(false);

    const childAfterReplay = await prisma.child.findUniqueOrThrow({ where: { id: child.id } });
    expect(childAfterReplay.xp).toBe(30);
  });

  it('rejects implausible scores', async () => {
    const parent = await createUser();
    const child = await createChild(parent.user.id);
    const game = await createGame();

    const start = await request(app)
      .post(`/api/games/${game.id}/start`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id });
    const sessionId = start.body.data.sessionId as string;
    await backdateSession(sessionId, 30);

    const res = await request(app)
      .post(`/api/games/${game.id}/score`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id, sessionId, score: 999999, correctAnswers: 2, wrongAnswers: 1 });
    expect(res.status).toBe(400);
  });

  it('rejects scores submitted too quickly', async () => {
    const parent = await createUser();
    const child = await createChild(parent.user.id);
    const game = await createGame();

    const start = await request(app)
      .post(`/api/games/${game.id}/start`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id });
    const sessionId = start.body.data.sessionId as string;
    await backdateSession(sessionId, -60);

    const res = await request(app)
      .post(`/api/games/${game.id}/score`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id, sessionId, score: 100, correctAnswers: 3, wrongAnswers: 0 });
    expect(res.status).toBe(400);
  });

  it('blocks a parent from starting a session for another parent\'s child', async () => {
    const parentA = await createUser();
    const parentB = await createUser();
    const child = await createChild(parentA.user.id);
    const game = await createGame();

    const res = await request(app)
      .post(`/api/games/${game.id}/start`)
      .set('Authorization', parentB.authHeader)
      .send({ childId: child.id });
    expect(res.status).toBe(403);
  });
});
