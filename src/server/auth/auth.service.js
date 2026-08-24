import { hashPassword, verifyPassword } from './password.service.js';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { errors } from '@/lib/errors';
import { issueOtp, consumeOtp, OTP_PURPOSES } from './otp.service.js';
import { createSession, revokeAllSessions } from './session.service.js';

export async function register(input) {
  await connectDB();
  const existing = await User.findOne({ email: input.email });
  if (existing?.isVerified) throw errors.conflict('An account with this email already exists');
  if (existing) await User.deleteOne({ _id: existing._id });

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    email: input.email,
    passwordHash,
    userName: input.userName,
    role: 'user',
    isVerified: false,
  });

  const otp = await issueOtp(user.email, OTP_PURPOSES.EMAIL_VERIFICATION);
  return { user, otp };
}

export async function verifyEmail(email, code) {
  await consumeOtp(email, OTP_PURPOSES.EMAIL_VERIFICATION, code);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { isVerified: true } },
    { returnDocument: 'after' }
  );
  if (!user) throw errors.authInvalid();
  return user;
}

export async function login(input) {
  await connectDB();
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user) throw errors.authInvalid();
  if (!user.isVerified) throw errors.authUnverified();

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) throw errors.authInvalid();

  return { user, ...(await createSession(user)) };
}

export async function requestPasswordReset(email) {
  await connectDB();
  const user = await User.findOne({ email });
  if (!user) return null;
  const otp = await issueOtp(email, OTP_PURPOSES.PASSWORD_RESET);
  return { user, otp };
}

export async function resendVerificationOtp(email) {
  await connectDB();
  const user = await User.findOne({ email });
  if (!user || user.isVerified) return null;
  const otp = await issueOtp(user.email, OTP_PURPOSES.EMAIL_VERIFICATION);
  return { user, otp };
}

export async function resetPassword(email, code, password) {
  await consumeOtp(email, OTP_PURPOSES.PASSWORD_RESET, code);
  await connectDB();
  const passwordHash = await hashPassword(password);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { passwordHash } },
    { returnDocument: 'after' }
  );
  if (!user) throw errors.authInvalid();
  await revokeAllSessions(user._id);
  return user;
}
