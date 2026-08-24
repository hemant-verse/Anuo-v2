import { sendEmail } from '@/lib/mailer';
import { getOtpEmailTemplate } from '@/lib/emailTemplates';
import { success, failure } from '@/lib/response';
import { ForgotPasswordSchema } from '@/features/auth/schemas';
import { resendVerificationOtp } from '@/server/auth/auth.service';
import { enforceRateLimit, getClientIdentifier, hashRateLimitIdentity } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    const parsed = ForgotPasswordSchema.safeParse(await request.json());
    if (!parsed.success) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid request', status: 400, details: parsed.error.issues });
    await enforceRateLimit('otpSend', `${getClientIdentifier(request)}:${hashRateLimitIdentity(parsed.data.email)}`);
    const result = await resendVerificationOtp(parsed.data.email);
    if (result) {
      await sendEmail({ to: result.user.email, subject: `${result.otp} is your Auno verification code`, html: getOtpEmailTemplate(result.otp, result.user.userName) });
    }
    return success({});
  } catch (error) {
    return failure(error);
  }
}
