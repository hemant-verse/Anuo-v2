import { success, failure } from '@/lib/response';
import { LoginSchema } from '@/features/auth/schemas';
import { login } from '@/server/auth/auth.service';
import { enforceRateLimit, getClientIdentifier, hashRateLimitIdentity } from '@/lib/rate-limit';

import { setRefreshCookie } from '@/lib/auth-cookies';

export async function POST(request) {
  try {
    const parsed = LoginSchema.safeParse(await request.json());
    if (!parsed.success) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid request', status: 400, details: parsed.error.issues });
    await enforceRateLimit('login', `${getClientIdentifier(request)}:${hashRateLimitIdentity(parsed.data.email)}`);
    const result = await login(parsed.data);
    const response = success({
      accessToken: result.accessToken,
      user: { id: String(result.user._id), userName: result.user.userName, email: result.user.email, role: result.user.role },
    });
    setRefreshCookie(response, result.refreshToken, result.refreshMaxAge);
    return response;
  } catch (error) {
    return failure(error);
  }
}
