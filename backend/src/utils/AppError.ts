export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR';

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500
};

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = STATUS_BY_CODE[code];
    this.details = details;
    Error.captureStackTrace(this, AppError);
  }

  static badRequest(message = 'Invalid request', details?: unknown) {
    return new AppError('VALIDATION_ERROR', message, details);
  }
  static unauthorized(message = 'Authentication required') {
    return new AppError('UNAUTHORIZED', message);
  }
  static forbidden(message = 'You do not have access to this resource') {
    return new AppError('FORBIDDEN', message);
  }
  static notFound(message = 'Resource not found') {
    return new AppError('NOT_FOUND', message);
  }
  static conflict(message = 'Resource already exists') {
    return new AppError('CONFLICT', message);
  }
  static serviceUnavailable(message = 'Service unavailable') {
    return new AppError('SERVICE_UNAVAILABLE', message);
  }
}
