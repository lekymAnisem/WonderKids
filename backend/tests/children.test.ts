import request from 'supertest';
import { createApp } from '../src/app';
import { createChild, createUser } from './helpers/factory';

const app = createApp();

describe('Children API', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/children');
    expect(res.status).toBe(401);
  });

  it('creates, lists, updates and deletes a child', async () => {
    const { authHeader } = await createUser();

    const created = await request(app)
      .post('/api/children')
      .set('Authorization', authHeader)
      .send({ displayName: 'Leo', ageGroup: '6-8', avatar: '🦁' });
    expect(created.status).toBe(201);
    const childId = created.body.data.child.id as string;
    expect(created.body.data.child.stars).toBe(0);
    expect(created.body.data.child.level).toBe(1);

    const list = await request(app).get('/api/children').set('Authorization', authHeader);
    expect(list.status).toBe(200);
    expect(list.body.data.children).toHaveLength(1);

    const updated = await request(app)
      .patch(`/api/children/${childId}`)
      .set('Authorization', authHeader)
      .send({ displayName: 'Leo the Brave' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.child.displayName).toBe('Leo the Brave');

    const removed = await request(app).delete(`/api/children/${childId}`).set('Authorization', authHeader);
    expect(removed.status).toBe(200);
  });

  it('prevents a parent from accessing another parent\'s child', async () => {
    const parentA = await createUser();
    const parentB = await createUser();
    const child = await createChild(parentA.user.id);

    const res = await request(app).get(`/api/children/${child.id}`).set('Authorization', parentB.authHeader);
    expect(res.status).toBe(403);

    const patch = await request(app)
      .patch(`/api/children/${child.id}`)
      .set('Authorization', parentB.authHeader)
      .send({ displayName: 'Hacked' });
    expect(patch.status).toBe(403);
  });
});
