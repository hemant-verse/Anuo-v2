import { requireAuth } from '@/lib/authorization';
import { failure, success } from '@/lib/response';
import { toAppError } from '@/lib/errors';
import { list } from '@/server/favorites/favorite.service';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    return success(await list({ userId: auth.user.id, role: auth.user.role }));
  } catch (error) {
    return failure(toAppError(error));
  }
}
