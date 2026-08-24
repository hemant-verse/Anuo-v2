import assert from 'node:assert/strict';
import test from 'node:test';
import { parseApiResponseError, ValidationError, AuthenticationError, NotFoundError, ForbiddenError, RateLimitError } from '../../src/lib/api/errors.js';
import ApiClient from '../../src/lib/api/client.js';

test('parseApiResponseError converts 400 responses into ValidationError', () => {
  const error = {
    response: {
      status: 400,
      data: { message: 'Invalid payload', details: [{ field: 'email', message: 'Required' }] },
    },
  };
  const parsed = parseApiResponseError(error);
  assert.ok(parsed instanceof ValidationError);
  assert.equal(parsed.status, 400);
  assert.equal(parsed.message, 'Invalid payload');
  assert.equal(parsed.details.length, 1);
});

test('parseApiResponseError converts 401 responses into AuthenticationError', () => {
  const error = { response: { status: 401, data: { message: 'Unauthorized' } } };
  const parsed = parseApiResponseError(error);
  assert.ok(parsed instanceof AuthenticationError);
  assert.equal(parsed.status, 401);
});

test('parseApiResponseError converts 403 responses into ForbiddenError', () => {
  const error = { response: { status: 403, data: { message: 'Forbidden' } } };
  const parsed = parseApiResponseError(error);
  assert.ok(parsed instanceof ForbiddenError);
  assert.equal(parsed.status, 403);
});

test('parseApiResponseError converts 404 responses into NotFoundError', () => {
  const error = { response: { status: 404, data: { message: 'Item not found' } } };
  const parsed = parseApiResponseError(error);
  assert.ok(parsed instanceof NotFoundError);
  assert.equal(parsed.status, 404);
});

test('parseApiResponseError converts 429 responses into RateLimitError', () => {
  const error = { response: { status: 429, data: { message: 'Too many requests' } } };
  const parsed = parseApiResponseError(error);
  assert.ok(parsed instanceof RateLimitError);
  assert.equal(parsed.status, 429);
});

test('ApiClient helper methods create cancel tokens', () => {
  const { signal, cancel } = ApiClient.createCancelToken();
  assert.ok(signal);
  assert.equal(typeof cancel, 'function');
});
