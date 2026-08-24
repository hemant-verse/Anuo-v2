import assert from 'node:assert/strict';
import test from 'node:test';
import { generateOtp, generateOpaqueToken, hashSecret, hashSecretAndCompare, safeCompare } from '../../src/lib/security.js';

test('OTP is numeric and has requested length', () => {
  const otp = generateOtp(6);
  assert.match(otp, /^\d{6}$/);
});

test('opaque token generation uses the requested byte size', () => {
  const token = generateOpaqueToken(32);
  assert.ok(token.length >= 40);
});

test('secret comparison is timing-safe and deterministic', () => {
  const hash = hashSecret('example-secret');
  assert.equal(hashSecretAndCompare('example-secret', hash), true);
  assert.equal(hashSecretAndCompare('wrong-secret', hash), false);
  assert.equal(safeCompare('abc', 'abc'), true);
  assert.equal(safeCompare('abc', 'abcd'), false);
});
