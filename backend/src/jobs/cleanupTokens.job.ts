import cron from 'node-cron';
import { tokenRepository } from '../repositories/token.repository';
import { logger } from '../utils/logger';

export async function runTokenCleanup(): Promise<number> {
  const removed = await tokenRepository.deleteExpired();
  logger.info('Cleaned up expired tokens', { removed });
  return removed;
}

export function startJobs(): void {
  cron.schedule('0 3 * * *', () => {
    runTokenCleanup().catch((error) => logger.error('Token cleanup job failed', { error: String(error) }));
  });
  logger.info('Background jobs scheduled');
}
