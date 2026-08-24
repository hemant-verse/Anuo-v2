import { success, failure } from '@/lib/response';
import { toAppError } from '@/lib/errors';
import { listCategories } from '@/server/products/product.service';

export async function GET() {
  try {
    return success({ categories: await listCategories() });
  } catch (error) {
    return failure(toAppError(error));
  }
}
