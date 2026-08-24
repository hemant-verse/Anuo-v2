import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import Otp from '@/models/Otp';
import { errors } from '@/lib/errors';
import { generateOtp } from '@/lib/security';

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export const OTP_PURPOSES = Object.freeze({
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
});

export async function issueOtp(identity, purpose) {
  if (!Object.values(OTP_PURPOSES).includes(purpose)) throw errors.validation();
  await connectDB();
  const normalizedIdentity = String(identity).trim().toLowerCase();
  const code = generateOtp(6);
  const codeHash = await bcrypt.hash(code, 10);
  await Otp.deleteMany({ identity: normalizedIdentity, purpose });
  await Otp.create({ identity: normalizedIdentity, purpose, codeHash, expiresAt: new Date(Date.now() + OTP_TTL_MS) });
  return code;
}

export async function consumeOtp(identity, purpose, code) {
  await connectDB();
  const normalizedIdentity = String(identity).trim().toLowerCase();
  const record = await Otp.findOne({
    identity: normalizedIdentity,
    purpose,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: MAX_ATTEMPTS },
  }).select('+codeHash');

  if (!record) throw errors.authInvalid();

  const valid = await bcrypt.compare(code, record.codeHash);
  if (!valid) {
    const updated = await Otp.findOneAndUpdate(
      { _id: record._id, consumedAt: null, attempts: { $lt: MAX_ATTEMPTS } },
      { $inc: { attempts: 1 } },
      { returnDocument: 'after' }
    ).select('attempts');
    if (!updated || updated.attempts >= MAX_ATTEMPTS) throw errors.rateLimited();
    throw errors.authInvalid();
  }

  const consumed = await Otp.findOneAndUpdate(
    { _id: record._id, consumedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { consumedAt: new Date() } },
    { returnDocument: 'after' }
  );
  if (!consumed) throw errors.authInvalid();
  return consumed;
}
