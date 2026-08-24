import test from 'node:test';
import assert from 'node:assert/strict';
import { hashSecret } from '../../src/lib/security.js';

// These tests intentionally cover deterministic security primitives without requiring MongoDB/Redis.
test('rate-limit identity hashing is deterministic and does not expose the input', async () => {
  const source = 'student@example.com';
  const first = hashSecret(source);
  const second = hashSecret(source);
  assert.equal(first, second);
  assert.notEqual(first, source);
  assert.match(first, /^[a-f0-9]{64}$/);
});

test('refresh-token hashes are fixed-length digests suitable for database lookup', async () => {
  const token = 'opaque-refresh-token';
  assert.match(hashSecret(token), /^[a-f0-9]{64}$/);
});
