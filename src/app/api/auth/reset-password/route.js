import { success, failure } from '@/lib/response';
import { ResetPasswordSchema } from '@/features/auth/schemas';
import { resetPassword } from '@/server/auth/auth.service';
import { enforceRateLimit, getClientIdentifier, hashRateLimitIdentity } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    const parsed = ResetPasswordSchema.safeParse(await request.json());
    if (!parsed.success) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid request', status: 400, details: parsed.error.issues });
    await enforceRateLimit('passwordReset', `${getClientIdentifier(request)}:${hashRateLimitIdentity(parsed.data.email)}`);
    await resetPassword(parsed.data.email, parsed.data.code, parsed.data.password);
    return success({});
  } catch (error) {
    return failure(error);
  }
}
