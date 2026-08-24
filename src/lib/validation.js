import mongoose from 'mongoose';

export function isValidObjectId(value) {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
}

export function parsePositiveInt(value, fallback, max) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

export function validationDetails(result) {
  return result.error.issues.map((issue) => ({
    field: issue.path,
    message: issue.message,
  }));
}
