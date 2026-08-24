import { failure } from '@/lib/response';
import { authorizeRequest } from '@/lib/middleware';

export async function requireAuth(request) {
  const result = await authorizeRequest(request);

  if (result.errorResponse || !result.user?.id) {
    return {
      user: null,
      response: failure({
        code: result.errorResponse?.code || 'AUTH_REQUIRED',
        message: result.errorResponse?.error || 'Authentication required',
        status: result.errorResponse?.status || 401,
      }),
    };
  }

  return { user: result.user, response: null };
}

export function getUserId(user) {
  return user?.id || user?._id || user?.userId || null;
}

export function isOwner(user, ownerId) {
  const userId = getUserId(user);
  return Boolean(userId && ownerId && String(userId) === String(ownerId));
}

export async function requireAdmin(request) {
  const auth = await requireAuth(request);

  if (auth.response) {
    return { user: null, response: auth.response };
  }

  const fullUser = auth.user;

  if (!fullUser || fullUser.role !== 'admin') {
    return {
      user: auth.user,
      response: failure({ code: 'FORBIDDEN', message: 'Forbidden', status: 403 }),
    };
  }

  return { user: auth.user, response: null };
}

export function requireOwner(user, ownerId) {
  if (!isOwner(user, ownerId)) return { response: failure({ code: 'FORBIDDEN', message: 'Forbidden', status: 403 }) };
  return { response: null };
}
