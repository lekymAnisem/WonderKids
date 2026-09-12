import request from 'supertest';
import { Role } from '@prisma/client';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { createUser } from './helpers/factory';

const app = createApp();

describe('Admin API', () => {
  it('forbids parents from admin endpoints', async () => {
    const parent = await createUser();
    const res = await request(app).get('/api/admin/overview').set('Authorization', parent.authHeader);
    expect(res.status).toBe(403);
  });

  it('returns platform counters to admins', async () => {
    const admin = await createUser({ role: Role.ADMIN });
    const res = await request(app).get('/api/admin/overview').set('Authorization', admin.authHeader);
    expect(res.status).toBe(200);
    expect(res.body.data.overview).toHaveProperty('users');
  });

  it('supports admin CRUD for coloring', async () => {
    const admin = await createUser({ role: Role.ADMIN });
    const create = await request(app)
      .post('/api/admin/coloring')
      .set('Authorization', admin.authHeader)
      .send({ title: 'Admin Page', category: 'NATURE', ageGroup: '6-8', lineArtUrl: '/uploads/seed/nature.png' });
    expect(create.status).toBe(201);
    const id = create.body.data.coloringPage.id as string;

    const patch = await request(app)
      .patch(`/api/admin/coloring/${id}`)
      .set('Authorization', admin.authHeader)
      .send({ title: 'Admin Page Updated' });
    expect(patch.status).toBe(200);
    expect(patch.body.data.coloringPage.title).toBe('Admin Page Updated');

    const del = await request(app).delete(`/api/admin/coloring/${id}`).set('Authorization', admin.authHeader);
    expect(del.status).toBe(200);
    expect(await prisma.coloringPage.findUnique({ where: { id } })).toBeNull();
  });

  it('supports admin CRUD for stories, games and achievements', async () => {
    const admin = await createUser({ role: Role.ADMIN });

    const story = await request(app)
      .post('/api/admin/stories')
      .set('Authorization', admin.authHeader)
      .send({ title: 'Admin Story', description: 'Test', category: 'ANIMALS', ageGroup: '6-8' });
    expect(story.status).toBe(201);

    const game = await request(app)
      .post('/api/admin/games')
      .set('Authorization', admin.authHeader)
      .send({
        title: 'Admin Game',
        description: 'Test',
        category: 'PUZZLE',
        ageGroup: '6-8',
        instructions: 'Play',
        config: { rounds: 1 }
      });
    expect(game.status).toBe(201);
    expect(game.body.data.game.slug).toBe('admin-game');

    const achievement = await request(app)
      .post('/api/admin/achievements')
      .set('Authorization', admin.authHeader)
      .send({
        code: 'ADMIN_TEST',
        title: 'Admin Test',
        description: 'Test achievement',
        criteria: { metric: 'games_completed', count: 1 }
      });
    expect(achievement.status).toBe(201);

    const delGame = await request(app)
      .delete(`/api/admin/games/${game.body.data.game.id}`)
      .set('Authorization', admin.authHeader);
    expect(delGame.status).toBe(200);
  });
});
