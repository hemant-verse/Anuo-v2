import { z } from 'zod';

const email = z.string().trim().toLowerCase().email().regex(/^[a-z0-9._+-]+@indoreinstitute\.com$/);
const password = z.string().min(6).max(100);

export const RegisterSchema = z.object({ userName: z.string().trim().min(3).max(50), email, password });
export const LoginSchema = z.object({ email, password });
export const VerifyOtpSchema = z.object({ email, code: z.string().regex(/^\d{6}$/) });
export const ForgotPasswordSchema = z.object({ email });
export const ResetPasswordSchema = z.object({ email, code: z.string().regex(/^\d{6}$/), password });
