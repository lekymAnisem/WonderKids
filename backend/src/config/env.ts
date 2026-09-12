import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isTest = nodeEnv === 'test';
const isProduction = nodeEnv === 'production';

export const env = {
  nodeEnv,
  isTest,
  isProduction,
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required('DATABASE_URL'),
  directUrl: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',

  jwt: {
    secret: process.env.JWT_SECRET ?? (isProduction ? '' : 'dev-access-secret-change-me-at-least-32-chars'),
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ?? (isProduction ? '' : 'dev-refresh-secret-change-me-at-least-32-chars'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'
  },

  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
  cookieSecure: (process.env.AUTH_COOKIE_SECURE ?? 'false') === 'true',

  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  storage: {
    provider: (process.env.STORAGE_PROVIDER ?? 'local') as 'local' | 's3',
    endpoint: process.env.S3_ENDPOINT ?? '',
    region: process.env.S3_REGION ?? 'us-east-1',
    bucket: process.env.S3_BUCKET ?? '',
    accessKey: process.env.S3_ACCESS_KEY ?? '',
    secretKey: process.env.S3_SECRET_KEY ?? '',
    publicUrl: process.env.S3_PUBLIC_URL ?? ''
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY ?? '',
    baseUrl: process.env.GROQ_BASE_URL ?? 'https://api.groq.com/openai/v1',
    model: process.env.GROQ_IMAGE_MODEL || process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
  },

  aiRateLimitMax: Number(process.env.AI_RATE_LIMIT_MAX ?? 5)
};

if (isProduction) {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in production');
  }
  if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
  }
}

export type AppEnv = typeof env;
