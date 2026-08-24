import ApiClient from '@/lib/api/client';

export async function listFavorites() {
  const data = await ApiClient.get('/api/favorites');
  return data?.data ?? { items: [], favoriteIds: [] };
}

export async function addFavorite(productId) {
  const data = await ApiClient.post(`/api/favorites/${productId}`);
  return data?.data ?? null;
}

export async function removeFavorite(productId) {
  const data = await ApiClient.delete(`/api/favorites/${productId}`);
  return data?.data ?? null;
}

export async function toggleFavorite(productId, isFavorited) {
  return isFavorited ? removeFavorite(productId) : addFavorite(productId);
}
