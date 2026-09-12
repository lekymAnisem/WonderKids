import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { startJobs } from './jobs';
import { logger } from './utils/logger';

async function main(): Promise<void> {
  await prisma.$connect();
  logger.info('Connected to the database');

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`WonderKids API listening on http://localhost:${env.port}`, {
      env: env.nodeEnv,
      docs: `http://localhost:${env.port}/api/docs`
    });
  });

  if (env.nodeEnv !== 'test') {
    startJobs();
  }

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((error) => {
  logger.error('Failed to start server', { error: String(error) });
  process.exit(1);
});
