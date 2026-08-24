import { success, failure } from '@/lib/response';
import { getUserFromAccessToken } from '@/server/auth/session.service';

export async function GET(request) {
  try {
    const header = request.headers.get('authorization');
    const token = header?.match(/^Bearer\s+(.+)$/i)?.[1];
    const user = await getUserFromAccessToken(token);
    return success({ user: { id: String(user._id), userName: user.userName, email: user.email, role: user.role, isVerified: user.isVerified } });
  } catch (error) {
    return failure(error);
  }
}
