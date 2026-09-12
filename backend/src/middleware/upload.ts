import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_FILE_BYTES = 8 * 1024 * 1024;

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(AppError.badRequest('Only PNG, JPEG or WEBP images are allowed'));
      return;
    }
    cb(null, true);
  }
});

export function validateUploadedImage(field = 'image') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const request = req as Request & { file?: Express.Multer.File; files?: Express.Multer.File[] };
    const file = request.file ?? request.files?.[0];
    if (!file) {
      next(AppError.badRequest(`${field} file is required`));
      return;
    }
    next();
  };
}
