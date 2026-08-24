import { requireAuth } from '@/lib/authorization';
import { failure, success } from '@/lib/response';
import { toAppError } from '@/lib/errors';
import { createProductSchema, productQuerySchema } from '@/features/products/schemas';
import { createWithImage, list, listMine } from '@/server/products/product.service';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function parseCreateRequest(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const image = formData.get('image');
    const raw = {
      title: formData.get('title'),
      description: formData.get('description'),
      price: formData.get('price'),
      isNegotiable: formData.get('isNegotiable'),
      category: formData.get('category'),
      condition: formData.get('condition'),
      contacts: {
        whatsapp: formData.get('whatsapp') || '',
        telegram: formData.get('telegram') || '',
        instagram: formData.get('instagram') || '',
      },
      images: [],
    };
    return { parsed: createProductSchema.safeParse(raw), image };
  }

  return { parsed: createProductSchema.safeParse(await request.json()), image: null };
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const parsed = productQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) return failure({ code: 'VALIDATION_ERROR', message: 'Invalid request', status: 400, details: parsed.error.issues });
    if (parsed.data.mine) {
      const auth = await requireAuth(request);
      if (auth.response) return auth.response;
      return success(await listMine({ userId: auth.user.id, role: auth.user.role }, parsed.data));
    }
    return success(await list(parsed.data));
  } catch (error) {
    return failure(toAppError(error));
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;

    const { parsed, image } = await parseCreateRequest(request);
    if (!parsed.success) {
      return failure({ code: 'VALIDATION_ERROR', message: 'Invalid request', status: 400, details: parsed.error.issues });
    }

    const product = await createWithImage(parsed.data, image, { userId: auth.user.id, role: auth.user.role });
    return success({ product }, 201);
  } catch (error) {
    return failure(toAppError(error));
  }
}
