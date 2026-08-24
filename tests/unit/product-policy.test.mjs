import assert from 'node:assert/strict';
import test from 'node:test';
import { assertAvailabilityTransition, assertModerationTransition } from '../../src/server/products/policy.js';

test('availability transitions follow the documented state machine', () => {
  assert.doesNotThrow(() => assertAvailabilityTransition('AVAILABLE', 'RESERVED'));
  assert.doesNotThrow(() => assertAvailabilityTransition('RESERVED', 'AVAILABLE'));
  assert.throws(() => assertAvailabilityTransition('SOLD', 'AVAILABLE'), /Cannot change availability/);
});

test('moderation only moves pending listings into a terminal decision', () => {
  assert.doesNotThrow(() => assertModerationTransition('PENDING', 'APPROVED'));
  assert.doesNotThrow(() => assertModerationTransition('PENDING', 'REJECTED'));
  assert.throws(() => assertModerationTransition('APPROVED', 'REJECTED'), /Cannot change moderation/);
});
