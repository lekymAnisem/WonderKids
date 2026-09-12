import request from 'supertest';
import { createApp } from '../src/app';
import { createChild, createUser } from './helpers/factory';

const app = createApp();

describe('Parent dashboard API', () => {
  it('returns a dashboard for the authenticated parent\'s children', async () => {
    const parent = await createUser();
    await createChild(parent.user.id, { displayName: 'Leo' });

    const res = await request(app).get('/api/parent/dashboard').set('Authorization', parent.authHeader);
    expect(res.status).toBe(200);
    expect(res.body.data.dashboard.childrenCount).toBe(1);
    expect(res.body.data.dashboard.children[0].displayName).toBe('Leo');
  });

  it('returns progress, activity and report for an owned child', async () => {
    const parent = await createUser();
    const child = await createChild(parent.user.id);

    const progress = await request(app)
      .get(`/api/parent/children/${child.id}/progress`)
      .set('Authorization', parent.authHeader);
    expect(progress.status).toBe(200);
    expect(progress.body.data.level).toBe(1);
    expect(progress.body.data.gamesCompleted).toBe(0);

    const activity = await request(app)
      .get(`/api/parent/children/${child.id}/activity`)
      .set('Authorization', parent.authHeader);
    expect(activity.status).toBe(200);
    expect(Array.isArray(activity.body.data.activity)).toBe(true);

    const report = await request(app)
      .get(`/api/parent/children/${child.id}/report`)
      .set('Authorization', parent.authHeader);
    expect(report.status).toBe(200);
    expect(report.body.data.child.id).toBe(child.id);
  });

  it('forbids parents from reading another parent\'s child', async () => {
    const parentA = await createUser();
    const parentB = await createUser();
    const child = await createChild(parentA.user.id);

    for (const path of ['progress', 'activity', 'report']) {
      const res = await request(app)
        .get(`/api/parent/children/${child.id}/${path}`)
        .set('Authorization', parentB.authHeader);
      expect(res.status).toBe(403);
    }
  });
});
