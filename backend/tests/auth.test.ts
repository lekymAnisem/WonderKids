import request from 'supertest';
import { Role } from '@prisma/client';
import { createApp } from '../src/app';
import { createUser } from './helpers/factory';

const app = createApp();

describe('Auth API', () => {
  it('registers a parent and never returns a password hash', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'newparent@example.test', name: 'New Parent', password: 'Passw0rd!' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('newparent@example.test');
    expect(res.body.data.user.role).toBe(Role.PARENT);
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('$2');
  });

  it('rejects duplicate registration', async () => {
    await createUser({ email: 'dupe@example.test' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dupe@example.test', name: 'Dupe', password: 'Passw0rd!' });
    expect(res.status).toBe(409);
  });

  it('rejects weak passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'weak@example.test', name: 'Weak', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('logs in, rotates refresh tokens and revokes on logout', async () => {
    const { user, password } = await createUser({ email: 'login@example.test' });

    const login = await request(app).post('/api/auth/login').send({ email: user.email, password });
    expect(login.status).toBe(200);
    expect(login.body.data.accessToken).toBeTruthy();
    const refreshToken = login.body.data.refreshToken as string;

    const refreshed = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.refreshToken).not.toBe(refreshToken);

    const logout = await request(app).post('/api/auth/logout').send({ refreshToken: refreshed.body.data.refreshToken });
    expect(logout.status).toBe(200);

    const afterLogout = await request(app).post('/api/auth/refresh').send({ refreshToken: refreshed.body.data.refreshToken });
    expect(afterLogout.status).toBe(401);
  });

  it('rejects invalid credentials', async () => {
    const { user } = await createUser({ email: 'badpass@example.test' });
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'WrongPass1' });
    expect(res.status).toBe(401);
  });

  it('supports forgot and reset password flow', async () => {
    const { user } = await createUser({ email: 'reset@example.test' });

    const forgot = await request(app).post('/api/auth/forgot-password').send({ email: user.email });
    expect(forgot.status).toBe(200);
    const devToken = forgot.body.data.devToken as string;
    expect(devToken).toBeTruthy();

    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: devToken, password: 'BrandNew1' });
    expect(reset.status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: 'BrandNew1' });
    expect(login.status).toBe(200);
  });

  it('does not leak whether an email exists on forgot-password', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@example.test' });
    expect(res.status).toBe(200);
    expect(res.body.data.devToken).toBeUndefined();
  });
});
