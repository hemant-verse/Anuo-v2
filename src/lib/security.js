import crypto from 'node:crypto';

export function generateOpaqueToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function generateOtp(length = 6) {
  if (!Number.isInteger(length) || length < 4 || length > 10) {
    throw new RangeError('OTP length must be between 4 and 10');
  }

  const max = 10 ** length;
  const min = 10 ** (length - 1);
  return String(crypto.randomInt(min, max));
}

export function hashSecret(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function safeCompare(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function hashSecretAndCompare(value, expectedHash) {
  return safeCompare(hashSecret(value), expectedHash);
}
