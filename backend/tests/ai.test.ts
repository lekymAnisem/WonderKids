import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { aiService } from '../src/services/ai.service';
import { createUser } from './helpers/factory';

const app = createApp();

describe('AI coloring generation', () => {
  it('returns 503 when the provider is not configured', async () => {
    const parent = await createUser();
    const res = await request(app)
      .post('/api/ai/coloring-page')
      .set('Authorization', parent.authHeader)
      .send({ prompt: 'A friendly dinosaur in a jungle', ageGroup: '6-8' });
    expect(res.status).toBe(503);
  });

  it('rejects unsafe prompts before calling the provider', async () => {
    const parent = await createUser();
    const res = await request(app)
      .post('/api/ai/coloring-page')
      .set('Authorization', parent.authHeader)
      .send({ prompt: 'a scary monster with a knife and blood', ageGroup: '6-8' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('generates and stores a coloring page when the provider is mocked', async () => {
    const parent = await createUser();
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="#ffffff"/><circle cx="512" cy="512" r="200" fill="none" stroke="#000000" stroke-width="6"/></svg>';
    const spy = jest
      .spyOn(aiService, 'requestArtwork')
      .mockResolvedValue({ buffer: Buffer.from(svg, 'utf8'), contentType: 'image/svg+xml', extension: 'svg' });

    const res = await request(app)
      .post('/api/ai/coloring-page')
      .set('Authorization', parent.authHeader)
      .send({ prompt: 'A happy dolphin under the sea', ageGroup: '6-8', title: 'Happy Dolphin' });

    expect(res.status).toBe(201);
    expect(res.body.data.coloringPage.id).toBeTruthy();
    expect(res.body.data.coloringPage.url).toContain('ai-coloring');

    const stored = await prisma.coloringPage.findUniqueOrThrow({ where: { id: res.body.data.coloringPage.id } });
    expect(stored.isAiGenerated).toBe(true);
    expect(stored.category).toBe('UNDER_THE_SEA');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/ai/coloring-page')
      .send({ prompt: 'A friendly dinosaur', ageGroup: '6-8' });
    expect(res.status).toBe(401);
  });
});
