export class AppError extends Error {
  constructor(code, message, { status = 500, details = [] } = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const errors = {
  authRequired: () => new AppError('AUTH_REQUIRED', 'Authentication required', { status: 401 }),
  authInvalid: () => new AppError('AUTH_INVALID', 'Invalid authentication', { status: 401 }),
  forbidden: () => new AppError('FORBIDDEN', 'Forbidden', { status: 403 }),
  notFound: (resource = 'Resource') => new AppError('NOT_FOUND', `${resource} not found`, { status: 404 }),
  conflict: (message = 'Resource conflict') => new AppError('CONFLICT', message, { status: 409 }),
  validation: (details = []) => new AppError('VALIDATION_ERROR', 'Invalid request', { status: 400, details }),
  rateLimited: () => new AppError('RATE_LIMITED', 'Too many requests', { status: 429 }),
  invalidState: (message = 'Resource state does not allow this operation') =>
    new AppError('RESOURCE_STATE_INVALID', message, { status: 409 }),
};

export function toAppError(error) {
  if (error instanceof AppError) return error;
  if (error && typeof error === 'object' && typeof error.code === 'string' && typeof error.status === 'number') {
    return new AppError(error.code, error.message || 'Request failed', { status: error.status, details: error.details || [] });
  }
  return new AppError('INTERNAL_ERROR', 'Internal server error', { status: 500 });
}

errors.authUnverified = () => new AppError('AUTH_UNVERIFIED', 'Account is not verified', { status: 403 });
