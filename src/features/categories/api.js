import api from '@/lib/axios';

export async function listCategories() {
  const response = await api.get('/api/categories');
  return response.data?.data?.categories ?? [];
}
