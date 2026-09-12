import { testDatabaseUrl } from './testEnv';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = testDatabaseUrl();
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-access-secret-at-least-32-characters';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-at-least-32-characters';
process.env.JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
process.env.BCRYPT_ROUNDS = '4';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.STORAGE_PROVIDER = 'local';
process.env.GROQ_API_KEY = '';
