import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export interface UploadResult {
  key: string;
  url: string;
  provider: 'local' | 's3';
}

export interface DownloadResult {
  body: Readable;
  contentType: string;
}

const LOCAL_ROOT = path.join(process.cwd(), 'uploads');

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  json: 'application/json',
  txt: 'text/plain',
  mp3: 'audio/mpeg'
};

function contentTypeForKey(key: string): string {
  const extension = key.split('.').pop()?.toLowerCase() ?? '';
  return CONTENT_TYPES[extension] ?? 'application/octet-stream';
}

function assertSafeKey(key: string): void {
  if (!key || key.includes('..') || path.isAbsolute(key) || key.startsWith('/')) {
    throw AppError.badRequest('Invalid storage key');
  }
}

function s3Client(): S3Client {
  return new S3Client({
    region: env.storage.region,
    endpoint: env.storage.endpoint || undefined,
    forcePathStyle: Boolean(env.storage.endpoint),
    credentials: {
      accessKeyId: env.storage.accessKey,
      secretAccessKey: env.storage.secretKey
    }
  });
}

export const storageService = {
  provider: env.storage.provider,

  async upload(buffer: Buffer, key: string, contentType: string): Promise<UploadResult> {
    assertSafeKey(key);

    if (env.storage.provider === 's3') {
      if (!env.storage.bucket || !env.storage.accessKey || !env.storage.secretKey) {
        throw AppError.serviceUnavailable('Object storage is not fully configured');
      }
      await s3Client().send(
        new PutObjectCommand({
          Bucket: env.storage.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType
        })
      );
      logger.info('Uploaded object to S3-compatible storage', { key });
      return { key, url: storageService.getUrl(key), provider: 's3' };
    }

    const destination = path.join(LOCAL_ROOT, key);
    await fs.promises.mkdir(path.dirname(destination), { recursive: true });
    await fs.promises.writeFile(destination, buffer);
    return { key, url: storageService.getUrl(key), provider: 'local' };
  },

  async download(key: string): Promise<DownloadResult> {
    assertSafeKey(key);

    if (env.storage.provider === 's3') {
      if (!env.storage.bucket) throw AppError.serviceUnavailable('Object storage is not configured');
      try {
        const result = await s3Client().send(new GetObjectCommand({ Bucket: env.storage.bucket, Key: key }));
        if (!result.Body) throw AppError.notFound('File not found');
        return {
          body: result.Body as Readable,
          contentType: result.ContentType ?? contentTypeForKey(key)
        };
      } catch (error) {
        const err = error as { name?: string; $metadata?: { httpStatusCode?: number } };
        if (err?.name === 'NoSuchKey' || err?.name === 'NotFound' || err?.$metadata?.httpStatusCode === 404) {
          throw AppError.notFound('File not found');
        }
        throw error;
      }
    }

    const source = path.join(LOCAL_ROOT, key);
    try {
      await fs.promises.access(source, fs.constants.R_OK);
    } catch {
      throw AppError.notFound('File not found');
    }
    return { body: fs.createReadStream(source), contentType: contentTypeForKey(key) };
  },

  async delete(key: string): Promise<void> {
    if (!key) return;
    if (env.storage.provider === 's3') {
      if (!env.storage.bucket) return;
      await s3Client().send(new DeleteObjectCommand({ Bucket: env.storage.bucket, Key: key }));
      return;
    }
    assertSafeKey(key);
    const destination = path.join(LOCAL_ROOT, key);
    await fs.promises.rm(destination, { force: true });
  },

  getUrl(key: string): string {
    if (env.storage.provider === 's3') {
      if (env.storage.publicUrl) {
        return `${env.storage.publicUrl.replace(/\/$/, '')}/${key}`;
      }
      // Private buckets are served through the backend file proxy.
      return `/api/files/${key}`;
    }
    return `/uploads/${key}`;
  }
};

