import api from '@/lib/axios';

export async function listPendingProducts(params = {}) {
  const { data } = await api.get('/api/admin/products/pending', { params });
  return data.data;
}

export async function approveProduct(productId) {
  const { data } = await api.post(`/api/admin/products/${productId}/approve`);
  return data.data;
}

export async function rejectProduct(productId, reason = '') {
  const { data } = await api.post(`/api/admin/products/${productId}/reject`, { reason });
  return data.data;
}

export async function listAdminAudit(params = {}) {
  const { data } = await api.get('/api/admin/audit', { params });
  return data.data;
}
