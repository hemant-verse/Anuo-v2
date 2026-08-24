import { getUserFromAccessToken } from '@/server/auth/session.service';

export async function authorizeRequest(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !/^Bearer\s+/i.test(authHeader)) {
    return { user: null, errorResponse: { error: 'Authentication required', status: 401 } };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return { user: null, errorResponse: { error: 'Authentication required', status: 401 } };
  }

  try {
    const user = await getUserFromAccessToken(token);
    return {
      user: { id: String(user._id), email: user.email, role: user.role, userName: user.userName },
      errorResponse: null,
    };
  } catch {
    return { user: null, errorResponse: { error: 'Invalid authentication', status: 401 } };
  }
}
