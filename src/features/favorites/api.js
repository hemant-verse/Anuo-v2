import api from '@/lib/axios';

export async function listFavorites() {
  const response = await api.get('/api/favorites');
  return response.data?.data ?? { items: [], favoriteIds: [] };
}

export async function addFavorite(productId) {
  const response = await api.post(`/api/favorites/${productId}`);
  return response.data?.data ?? null;
}

export async function removeFavorite(productId) {
  const response = await api.delete(`/api/favorites/${productId}`);
  return response.data?.data ?? null;
}

export async function toggleFavorite(productId, isFavorited) {
  return isFavorited ? removeFavorite(productId) : addFavorite(productId);
}
