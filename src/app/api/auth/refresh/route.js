import { success, failure } from '@/lib/response';
import { rotateSession } from '@/server/auth/session.service';
import { enforceRateLimit, getClientIdentifier } from '@/lib/rate-limit';

import { refreshCookieName, setRefreshCookie } from '@/lib/auth-cookies';

export async function POST(request) {
  try {
    await enforceRateLimit('refresh', getClientIdentifier(request));
    const token = request.cookies.get(refreshCookieName())?.value;
    const result = await rotateSession(token);
    const response = success({ accessToken: result.accessToken });
    setRefreshCookie(response, result.refreshToken, result.refreshMaxAge);
    return response;
  } catch (error) {
    return failure(error);
  }
}
