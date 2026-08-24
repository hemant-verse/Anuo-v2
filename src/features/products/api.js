import api from '@/lib/axios';

export async function listProducts({ page = 1, limit = 20, category = 'ALL', search = '', mine = false } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category && category !== 'ALL') params.set('category', category);
  if (search?.trim()) params.set('search', search.trim());
  if (mine) params.set('mine', 'true');
  const response = await api.get(`/api/products?${params.toString()}`);
  return response.data?.data ?? { items: [], pagination: { page, limit, hasNextPage: false, total: 0 } };
}

export async function getProduct(productId) {
  const response = await api.get(`/api/products/${productId}`);
  return response.data?.data?.product ?? response.data?.data ?? null;
}

export async function createProduct(payload) {
  const response = await api.post('/api/products', payload);
  return response.data?.data?.product ?? null;
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

  const response = await api.post('/api/products', body);
  return response.data?.data?.product ?? null;
}

export async function updateProduct(productId, payload) {
  const response = await api.patch(`/api/products/${productId}`, payload);
  return response.data?.data?.product ?? null;
}

export async function deleteProduct(productId) {
  const response = await api.delete(`/api/products/${productId}`);
  return response.data?.data ?? null;
}
