import { Request, Response, NextFunction } from 'express';
import { Registry, Counter, Histogram, collectDefaultMetrics } from 'prom-client';

const register = new Registry();

collectDefaultMetrics({ prefix: 'wonderkids_', register });

export const httpRequestsTotal = new Counter({
  name: 'wonderkids_http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['route', 'status'],
  registers: [register]
});

export const httpRequestDurationSeconds = new Histogram({
  name: 'wonderkids_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['route'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register]
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime();

  res.on('finish', () => {
    const route = req.route?.path ?? req.path ?? '';
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;

    httpRequestDurationSeconds.labels(route).observe(duration);
    httpRequestsTotal.labels(route, String(res.statusCode)).inc();
  });

  next();
}

export async function getMetrics(): Promise<string> {
  return register.metrics();
}

export { register };