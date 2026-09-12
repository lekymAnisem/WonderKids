import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export function withSchema(url: string, schema: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set('schema', schema);
  return parsed.toString();
}

export function testDatabaseUrl(): string {
  const schema = process.env.TEST_DATABASE_SCHEMA ?? 'wonderkids_test';
  const direct = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
  return withSchema(direct, schema);
}

export function testDatabaseSchema(): string {
  return process.env.TEST_DATABASE_SCHEMA ?? 'wonderkids_test';
}
