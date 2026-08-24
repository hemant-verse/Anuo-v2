import { AppError } from '../errors.js';

export class ApiError extends AppError {
  constructor(code = 'API_ERROR', message = 'API request failed', { status = 500, details = [], originalError = null } = {}) {
    super(code, message, { status, details });
    this.name = 'ApiError';
    this.originalError = originalError;
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details = []) {
    super('VALIDATION_ERROR', message, { status: 400, details });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super('AUTH_REQUIRED', message, { status: 401 });
    this.name = 'AuthenticationError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access forbidden') {
    super('FORBIDDEN', message, { status: 403 });
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, { status: 404 });
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests. Please try again later.') {
    super('RATE_LIMITED', message, { status: 429 });
    this.name = 'RateLimitError';
  }
}

export function parseApiResponseError(error) {
  if (!error.response) {
    return new ApiError('NETWORK_ERROR', 'Network error or service unreachable', { status: 0, originalError: error });
  }

  const { status, data } = error.response;
  const message = data?.message || data?.error || 'Request failed';
  const code = data?.code || (status === 401 ? 'AUTH_REQUIRED' : status === 403 ? 'FORBIDDEN' : status === 404 ? 'NOT_FOUND' : status === 429 ? 'RATE_LIMITED' : status === 400 ? 'VALIDATION_ERROR' : 'SERVER_ERROR');
  const details = data?.details || [];

  switch (status) {
    case 400:
      return new ValidationError(message, details);
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    case 429:
      return new RateLimitError(message);
    default:
      return new ApiError(code, message, { status, details, originalError: error });
  }
}
