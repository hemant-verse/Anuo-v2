import ApiClient from '@/lib/api/client';

export async function listProducts({ page = 1, limit = 20, category = 'ALL', search = '', mine = false } = {}, config = {}) {
  const params = { page: String(page), limit: String(limit) };
  if (category && category !== 'ALL') params.category = category;
  if (search?.trim()) params.search = search.trim();
  if (mine) params.mine = 'true';

  const data = await ApiClient.get('/api/products', params, config);
  return data?.data ?? { items: [], pagination: { page, limit, hasNextPage: false, total: 0 } };
}

export async function getProduct(productId, config = {}) {
  const data = await ApiClient.get(`/api/products/${productId}`, {}, config);
  return data?.data?.product ?? data?.data ?? null;
}

export async function createProduct(payload) {
  const data = await ApiClient.post('/api/products', payload);
  return data?.data?.product ?? null;
}

export async function createProductWithImage(payload, file) {
  const body = new FormData();
  body.append('image', file, file.name || 'product.webp');
  body.append('title', payload.title);
  body.append('description', payload.description);
  body.append('price', String(payload.price));
  body.append('isNegotiable', String(Boolean(payload.isNegotiable)));
  body.append('category', payload.category);
  body.append('condition', payload.condition);

  for (const [key, value] of Object.entries(payload.contacts || {})) {
    if (value) body.append(key, value);
  }

  const data = await ApiClient.post('/api/products', body);
  return data?.data?.product ?? null;
}

export async function updateProduct(productId, payload) {
  const data = await ApiClient.patch(`/api/products/${productId}`, payload);
  return data?.data?.product ?? null;
}

export async function deleteProduct(productId) {
  const data = await ApiClient.delete(`/api/products/${productId}`);
  return data?.data ?? null;
}
