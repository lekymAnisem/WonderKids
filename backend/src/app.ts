import path from 'path';
import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { openApiDocument } from './config/swagger';
import apiRoutes from './routes';
import { globalLimiter } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { metricsMiddleware, getMetrics, register } from './middleware/metrics';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  app.use(
    cors({
      origin: env.corsOrigin.length > 0 ? env.corsOrigin : true,
      credentials: true
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get('/api/docs.json', (_req, res) => res.json(openApiDocument));

  app.use(metricsMiddleware);

  app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  app.get('/api/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await getMetrics());
  });

  app.use(globalLimiter);
  app.use('/api', apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
