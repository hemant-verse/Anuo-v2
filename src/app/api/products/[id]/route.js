import { requireAuth } from '@/lib/authorization';
import { failure, success } from '@/lib/response';
import { toAppError } from '@/lib/errors';
import { updateProductSchema } from '@/features/products/schemas';
import { getById, update, remove } from '@/server/products/product.service';
import { isValidObjectId } from '@/lib/validation';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid product ID', status: 400 });
    let identity = null;
    const auth = await requireAuth(request);
    if (!auth.response) identity = { userId: auth.user.id, role: auth.user.role };
    return success({ product: await getById(id, identity) });
  } catch (error) {
    return failure(toAppError(error));
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    const { id } = await params;
    if (!isValidObjectId(id)) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid product ID', status: 400 });
    const parsed = updateProductSchema.safeParse(await request.json());
    if (!parsed.success) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid request', status: 400, details: parsed.error.issues });
    return success({ product: await update(id, parsed.data, { userId: auth.user.id, role: auth.user.role }) });
  } catch (error) {
    return failure(toAppError(error));
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    const { id } = await params;
    if (!isValidObjectId(id)) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid product ID', status: 400 });
    return success({ product: await remove(id, { userId: auth.user.id, role: auth.user.role }) });
  } catch (error) {
    return failure(toAppError(error));
  }
}
