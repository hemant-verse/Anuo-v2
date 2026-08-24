import ApiClient from '@/lib/api/client';

export async function listPendingProducts(params = {}) {
  const data = await ApiClient.get('/api/admin/products/pending', params);
  return data?.data;
}

export async function approveProduct(productId) {
  const data = await ApiClient.post(`/api/admin/products/${productId}/approve`);
  return data?.data;
}

export async function rejectProduct(productId, reason = '') {
  const data = await ApiClient.post(`/api/admin/products/${productId}/reject`, { reason });
  return data?.data;
}

export async function listAdminAudit(params = {}) {
  const data = await ApiClient.get('/api/admin/audit', params);
  return data?.data;
}
