import { Router } from 'express';
import { storageService } from '../services/storage.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

const router = Router();

router.get(
  '/*',
  asyncHandler(async (req, res) => {
    const rawKey = (req.params as Record<string, string>)[0] ?? '';
    const key = decodeURIComponent(rawKey);
    if (!key) throw AppError.notFound('File not found');

    const { body, contentType } = await storageService.download(key);

    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    body.on('error', () => {
      if (!res.headersSent) res.status(500);
      res.destroy();
    });
    body.pipe(res);
  })
);

export default router;
