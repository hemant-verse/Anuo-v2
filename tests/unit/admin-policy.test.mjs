import test from 'node:test';
import assert from 'node:assert/strict';
import { assertAdmin, assertModerationDecision } from '../../src/server/admin/policy.js';

const errors = (fn) => {
  try { fn(); return null; } catch (error) { return error; }
};

test('admin policy accepts admin identity', () => {
  assert.doesNotThrow(() => assertAdmin({ userId: '1', role: 'admin' }));
});

test('admin policy rejects non-admin identity', () => {
  const error = errors(() => assertAdmin({ userId: '1', role: 'user' }));
  assert.equal(error.code, 'FORBIDDEN');
});

test('moderation decision only accepts terminal decisions', () => {
  assert.doesNotThrow(() => assertModerationDecision('APPROVED'));
  assert.doesNotThrow(() => assertModerationDecision('REJECTED'));
  const error = errors(() => assertModerationDecision('PENDING'));
  assert.equal(error.code, 'VALIDATION_ERROR');
});
