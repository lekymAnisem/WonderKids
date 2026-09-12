import request from 'supertest';
import { Role } from '@prisma/client';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { createChild, createStory, createUser } from './helpers/factory';

const app = createApp();

describe('Stories API', () => {
  it('lists stories and returns pages', async () => {
    const story = await createStory(true);

    const list = await request(app).get('/api/stories');
    expect(list.status).toBe(200);
    expect(list.body.data.stories.length).toBe(1);

    const detail = await request(app).get(`/api/stories/${story.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.story.pages.length).toBe(2);

    const pages = await request(app).get(`/api/stories/${story.id}/pages`);
    expect(pages.status).toBe(200);
    expect(pages.body.data.pages[0].pageNumber).toBe(1);
  });

  it('only lets admins create stories', async () => {
    const parent = await createUser();
    const admin = await createUser({ role: Role.ADMIN });
    const payload = {
      title: 'A New Tale',
      description: 'A short test tale',
      category: 'FANTASY',
      ageGroup: '6-8',
      pages: [{ pageNumber: 1, text: 'Once.' }]
    };

    const forbidden = await request(app).post('/api/stories').set('Authorization', parent.authHeader).send(payload);
    expect(forbidden.status).toBe(403);

    const created = await request(app).post('/api/stories').set('Authorization', admin.authHeader).send(payload);
    expect(created.status).toBe(201);
    const storyId = created.body.data.story.id as string;
    const pages = await prisma.storyPage.findMany({ where: { storyId } });
    expect(pages).toHaveLength(1);
  });

  it('records reading progress and rewards exactly once on completion', async () => {
    await prisma.achievement.deleteMany();
    const parent = await createUser();
    const child = await createChild(parent.user.id);
    const story = await createStory(true);

    const partial = await request(app)
      .post(`/api/stories/${story.id}/progress`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id, currentPage: 1, readingTimeSeconds: 30 });
    expect(partial.status).toBe(200);
    expect(partial.body.data.rewarded).toBe(false);

    const done = await request(app)
      .post(`/api/stories/${story.id}/progress`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id, currentPage: 2, readingTimeSeconds: 60, completed: true });
    expect(done.status).toBe(201);
    expect(done.body.data.rewarded).toBe(true);

    const again = await request(app)
      .post(`/api/stories/${story.id}/progress`)
      .set('Authorization', parent.authHeader)
      .send({ childId: child.id, completed: true });
    expect(again.body.data.rewarded).toBe(false);

    const childAfter = await prisma.child.findUniqueOrThrow({ where: { id: child.id } });
    expect(childAfter.xp).toBe(30);
    expect(childAfter.stars).toBe(12);

    const progress = await request(app)
      .get(`/api/children/${child.id}/stories/progress`)
      .set('Authorization', parent.authHeader);
    expect(progress.status).toBe(200);
    expect(progress.body.data.progress[0].completed).toBe(true);
  });
});
