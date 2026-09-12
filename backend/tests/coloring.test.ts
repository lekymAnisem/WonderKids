import request from 'supertest';
import { Role } from '@prisma/client';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { createChild, createColoringPage, createUser } from './helpers/factory';

const app = createApp();

describe('Coloring API', () => {
  it('lists published coloring pages publicly', async () => {
    await createColoringPage();
    const res = await request(app).get('/api/coloring');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.coloringPages)).toBe(true);
    expect(res.body.data.coloringPages.length).toBeGreaterThan(0);
  });

  it('only lets admins create coloring pages', async () => {
    const parent = await createUser();
    const admin = await createUser({ role: Role.ADMIN });
    const payload = {
      title: 'Nebula Kitten',
      category: 'SPACE',
      ageGroup: '6-8',
      lineArtUrl: '/uploads/seed/nebula.png'
    };

    const forbidden = await request(app).post('/api/coloring').set('Authorization', parent.authHeader).send(payload);
    expect(forbidden.status).toBe(403);

    const created = await request(app).post('/api/coloring').set('Authorization', admin.authHeader).send(payload);
    expect(created.status).toBe(201);
    expect(created.body.data.coloringPage.title).toBe('Nebula Kitten');
  });

  it('runs a full coloring session and awards rewards exactly once', async () => {
    await prisma.achievement.deleteMany();
    const parent = await createUser();
    const child = await createChild(parent.user.id);
    const page = await createColoringPage();

    const start = await request(app)
      .post(`/api/coloring/${page.id}/session`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id });
    expect(start.status).toBe(201);
    const sessionId = start.body.data.session.id as string;

    const save = await request(app)
      .post(`/api/coloring/${page.id}/save`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id, sessionId, canvasData: { strokes: 12 } });
    expect(save.status).toBe(200);
    expect(save.body.data.session.canvasData).toEqual({ strokes: 12 });

    const complete = await request(app)
      .post(`/api/coloring/${page.id}/complete`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id, sessionId });
    expect(complete.status).toBe(200);
    expect(complete.body.data.rewarded).toBe(true);

    const afterFirst = await prisma.child.findUniqueOrThrow({ where: { id: child.id } });
    expect(afterFirst.xp).toBe(25);
    expect(afterFirst.stars).toBe(10);

    const completeAgain = await request(app)
      .post(`/api/coloring/${page.id}/complete`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id, sessionId });
    expect(completeAgain.status).toBe(200);
    expect(completeAgain.body.data.rewarded).toBe(false);

    const afterSecond = await prisma.child.findUniqueOrThrow({ where: { id: child.id } });
    expect(afterSecond.xp).toBe(afterFirst.xp);
    expect(afterSecond.stars).toBe(afterFirst.stars);
  });

  it('blocks sessions for another parent\'s child', async () => {
    const parentA = await createUser();
    const parentB = await createUser();
    const child = await createChild(parentA.user.id);
    const page = await createColoringPage();

    const res = await request(app)
      .post(`/api/coloring/${page.id}/session`)
      .set('Authorization', parentB.authHeader)
      .send({ childId: child.id });
    expect(res.status).toBe(403);
  });
});
