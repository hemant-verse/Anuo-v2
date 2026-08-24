import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import Session from '@/models/Session';
import User from '@/models/User';
import { getEnv } from '@/lib/env';
import { generateOpaqueToken, hashSecret } from '@/lib/security';
import { errors } from '@/lib/errors';

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

function accessSecret() { return getEnv().JWT_ACCESS_SECRET; }
function issueAccessToken(user, sessionId) {
  return jwt.sign({ sub: String(user._id), role: user.role, sid: String(sessionId) }, accessSecret(), { expiresIn: ACCESS_TTL_SECONDS });
}

export function verifyAccessToken(token) {
  try { return jwt.verify(token, accessSecret()); } catch { return null; }
}

export async function createSession(user) {
  await connectDB();
  const refreshToken = generateOpaqueToken(32);
  const session = await Session.create({
    userId: user._id,
    refreshTokenHash: hashSecret(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
  });
  return { sessionId: String(session._id), accessToken: issueAccessToken(user, session._id), refreshToken, refreshMaxAge: REFRESH_TTL_SECONDS };
}

export async function rotateSession(refreshToken) {
  await connectDB();
  if (!refreshToken) throw errors.authInvalid();
  const currentHash = hashSecret(refreshToken);
  const nextRefresh = generateOpaqueToken(32);
  const nextHash = hashSecret(nextRefresh);
  const now = new Date();
  const session = await Session.findOneAndUpdate(
    { refreshTokenHash: currentHash, revokedAt: null, expiresAt: { $gt: now } },
    { $set: { previousRefreshTokenHash: currentHash, refreshTokenHash: nextHash, expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000) } },
    { returnDocument: 'after' }
  );

  if (!session) {
    const reused = await Session.findOneAndUpdate(
      { previousRefreshTokenHash: currentHash, revokedAt: null, expiresAt: { $gt: now } },
      { $set: { revokedAt: now } },
      { returnDocument: 'after' }
    ).select('_id');
    if (reused) throw errors.authInvalid();
    throw errors.authInvalid();
  }

  const user = await User.findById(session.userId).select('+passwordHash');
  if (!user || !user.isVerified) {
    await Session.updateOne({ _id: session._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
    throw errors.authInvalid();
  }
  return { accessToken: issueAccessToken(user, session._id), refreshToken: nextRefresh, refreshMaxAge: REFRESH_TTL_SECONDS, sessionId: String(session._id) };
}

export async function revokeSession(refreshToken) {
  if (!refreshToken) return;
  await connectDB();
  await Session.updateOne({ refreshTokenHash: hashSecret(refreshToken), revokedAt: null }, { $set: { revokedAt: new Date() } });
}

export async function revokeAllSessions(userId) {
  await connectDB();
  await Session.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } });
}

export async function getUserFromRefreshToken(refreshToken) {
  await connectDB();
  if (!refreshToken) throw errors.authInvalid();
  const session = await Session.findOne({ refreshTokenHash: hashSecret(refreshToken), revokedAt: null, expiresAt: { $gt: new Date() } });
  if (!session) throw errors.authInvalid();
  const user = await User.findById(session.userId).select('_id email userName role isVerified');
  if (!user || !user.isVerified) throw errors.authInvalid();
  return user;
}

export async function getUserFromAccessToken(token) {
  const payload = verifyAccessToken(token);
  if (!payload?.sub || !payload?.sid) throw errors.authInvalid();
  await connectDB();
  const session = await Session.findOne({ _id: payload.sid, userId: payload.sub, revokedAt: null, expiresAt: { $gt: new Date() } }).select('_id');
  if (!session) throw errors.authInvalid();
  const user = await User.findById(payload.sub).select('_id email userName role isVerified');
  if (!user || !user.isVerified) throw errors.authInvalid();
  return user;
}
