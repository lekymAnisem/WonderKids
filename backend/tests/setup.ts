import { afterAll, beforeAll } from '@jest/globals';
import { prisma } from '../src/config/prisma';
import { testDatabaseSchema } from './testEnv';

const TABLES = [
  'child_achievements',
  'activity_progress',
  'favorites',
  'game_scores',
  'game_sessions',
  'story_progress',
  'story_pages',
  'coloring_sessions',
  'coloring_pages',
  'stories',
  'games',
  'achievements',
  'parent_children',
  'children',
  'password_reset_tokens',
  'refresh_tokens',
  'users'
];

export async function resetDatabase(): Promise<void> {
  const schema = testDatabaseSchema();

  if (schema === 'public') {
    throw new Error('Refusing to reset the public schema. Set TEST_DATABASE_SCHEMA to an isolated schema.');
  }

  const list = TABLES.map((table) => `"${schema}"."${table}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE;`);
}

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});
