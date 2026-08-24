import ApiClient from '@/lib/api/client';

export async function listCategories() {
  const data = await ApiClient.get('/api/categories');
  return data?.data?.categories ?? [];
}
