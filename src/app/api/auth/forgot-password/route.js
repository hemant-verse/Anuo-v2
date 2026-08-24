import { sendEmail } from '@/lib/mailer';
import { getResetPasswordEmailTemplate } from '@/lib/emailTemplates';
import { success, failure } from '@/lib/response';
import { ForgotPasswordSchema } from '@/features/auth/schemas';
import { requestPasswordReset } from '@/server/auth/auth.service';
import { enforceRateLimit, getClientIdentifier, hashRateLimitIdentity } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    const parsed = ForgotPasswordSchema.safeParse(await request.json());
    if (!parsed.success) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid request', status: 400, details: parsed.error.issues });
    await enforceRateLimit('passwordReset', `${getClientIdentifier(request)}:${hashRateLimitIdentity(parsed.data.email)}`);
    const result = await requestPasswordReset(parsed.data.email);
    if (result) await sendEmail({ to: result.user.email, subject: `${result.otp} is your Auno password reset code`, html: getResetPasswordEmailTemplate(result.otp, result.user.userName) });
    return success({});
  } catch (error) {
    return failure(error);
  }
}
