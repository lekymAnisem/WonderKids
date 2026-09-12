import { execSync } from 'child_process';
import path from 'path';
import { testDatabaseUrl } from './testEnv';

export default async function globalSetup(): Promise<void> {
  const root = path.resolve(__dirname, '..');
  const databaseUrl = testDatabaseUrl();

  process.env.DATABASE_URL = databaseUrl;
  process.env.DIRECT_URL = databaseUrl;

  execSync('npx prisma db push --force-reset --skip-generate', {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl }
  });
}
