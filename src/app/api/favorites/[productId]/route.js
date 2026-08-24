import { requireAuth } from '@/lib/authorization';
import { failure, success } from '@/lib/response';
import { toAppError } from '@/lib/errors';
import { isValidObjectId } from '@/lib/validation';
import { add, remove } from '@/server/favorites/favorite.service';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    const { productId } = await params;
    if (!isValidObjectId(productId)) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid product ID', status: 400 });
    return success(await add(productId, { userId: auth.user.id, role: auth.user.role }));
  } catch (error) {
    return failure(toAppError(error));
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    const { productId } = await params;
    if (!isValidObjectId(productId)) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid product ID', status: 400 });
    return success(await remove(productId, { userId: auth.user.id, role: auth.user.role }));
  } catch (error) {
    return failure(toAppError(error));
  }
}
