import { sendEmail } from '@/lib/mailer';
import { getOtpEmailTemplate } from '@/lib/emailTemplates';
import { success, failure } from '@/lib/response';
import { RegisterSchema } from '@/features/auth/schemas';
import { register } from '@/server/auth/auth.service';
import { enforceRateLimit, getClientIdentifier, hashRateLimitIdentity } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    const parsed = RegisterSchema.safeParse(await request.json());
    if (!parsed.success) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid request', status: 400, details: parsed.error.issues });
    await enforceRateLimit('register', `${getClientIdentifier(request)}:${hashRateLimitIdentity(parsed.data.email)}`);
    const { user, otp } = await register(parsed.data);
    await sendEmail({ to: user.email, subject: `${otp} is your Auno verification code`, html: getOtpEmailTemplate(otp, user.userName) });
    return success({ email: user.email }, 201);
  } catch (error) {
    return failure(error);
  }
}
