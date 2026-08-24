import { success, failure } from '@/lib/response';
import { VerifyOtpSchema } from '@/features/auth/schemas';
import { verifyEmail } from '@/server/auth/auth.service';
import { enforceRateLimit, getClientIdentifier, hashRateLimitIdentity } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    const parsed = VerifyOtpSchema.safeParse(await request.json());
    if (!parsed.success) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid request', status: 400, details: parsed.error.issues });
    await enforceRateLimit('otpVerify', `${getClientIdentifier(request)}:${hashRateLimitIdentity(parsed.data.email)}`);
    const user = await verifyEmail(parsed.data.email, parsed.data.code);
    return success({ user: { id: String(user._id), userName: user.userName, email: user.email } });
  } catch (error) {
    return failure(error);
  }
}
