import request from 'supertest';
import { Role } from '@prisma/client';
import { createApp } from '../src/app';
import { createChild, createColoringPage, createUser } from './helpers/factory';

const app = createApp();

describe('Achievements API', () => {
  it('lists achievements publicly', async () => {
    const res = await request(app).get('/api/achievements');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.achievements)).toBe(true);
  });

  it('awards achievements automatically when an activity completes', async () => {
    const admin = await createUser({ role: Role.ADMIN });
    await request(app)
      .post('/api/admin/achievements')
      .set('Authorization', admin.authHeader)
      .send({
        code: 'FIRST_ADVENTURE',
        title: 'First Adventure',
        description: 'Complete one activity',
        criteria: { metric: 'total_completed', count: 1 },
        xpReward: 10,
        starReward: 5
      });

    const parent = await createUser();
    const child = await createChild(parent.user.id);
    const page = await createColoringPage();

    const start = await request(app)
      .post(`/api/coloring/${page.id}/session`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id });
    const sessionId = start.body.data.session.id as string;

    await request(app)
      .post(`/api/coloring/${page.id}/complete`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id, sessionId });

    const awarded = await request(app)
      .get(`/api/children/${child.id}/achievements`)
      .set('Authorization', parent.authHeader);
    expect(awarded.status).toBe(200);
    expect(awarded.body.data.achievements).toHaveLength(1);
    expect(awarded.body.data.achievements[0].achievement.code).toBe('FIRST_ADVENTURE');

    const check = await request(app)
      .post('/api/achievements/check')
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id });
    expect(check.status).toBe(200);
    expect(check.body.data.awardedCount).toBe(0);
  });
});
