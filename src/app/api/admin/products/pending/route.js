import { failure, success } from '@/lib/response';
import { toAppError } from '@/lib/errors';
import { requireAdmin } from '@/lib/authorization';
import { productQuerySchema } from '@/features/products/schemas';
import { listPending } from '@/server/admin/admin.service';

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const parsed = productQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid request', status: 400, details: parsed.error.issues });

    return success(await listPending({ userId: String(auth.user.id), role: auth.user.role }, parsed.data));
  } catch (error) {
    return failure(toAppError(error));
  }
}
