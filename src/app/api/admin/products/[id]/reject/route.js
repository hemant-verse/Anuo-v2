import { failure, success } from '@/lib/response';
import { toAppError } from '@/lib/errors';
import { requireAdmin } from '@/lib/authorization';
import { isValidObjectId } from '@/lib/validation';
import { rejectProductSchema } from '@/features/admin/schemas';
import { rejectProduct } from '@/server/admin/admin.service';

export async function POST(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.response) return auth.response;
    const { id } = await params;
    if (!isValidObjectId(id)) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid product ID', status: 400 });
    const parsed = rejectProductSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid request', status: 400, details: parsed.error.issues });
    const product = await rejectProduct(id, { userId: String(auth.user.id), role: auth.user.role }, parsed.data);
    return success({ product });
  } catch (error) {
    return failure(toAppError(error));
  }
}
