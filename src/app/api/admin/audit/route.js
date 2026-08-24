import { requireAdmin } from '@/lib/authorization';
import { failure, success } from '@/lib/response';
import { toAppError } from '@/lib/errors';
import { isValidObjectId } from '@/lib/validation';
import { auditQuerySchema } from '@/features/admin/schemas';
import { listAudit } from '@/server/admin/admin.service';

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.response) return auth.response;
    const { searchParams } = new URL(request.url);
    const parsed = auditQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsed.success) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid request', status: 400, details: parsed.error.issues });
    const { adminId, productId } = parsed.data;
    if (adminId && !isValidObjectId(adminId)) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid admin ID', status: 400 });
    if (productId && !isValidObjectId(productId)) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid product ID', status: 400 });
    return success(await listAudit({ userId: String(auth.user.id), role: auth.user.role }, parsed.data));
  } catch (error) { return failure(toAppError(error)); }
}
