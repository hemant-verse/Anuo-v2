import api from '@/lib/axios';

export async function getCurrentUser() {
  const response = await api.get('/api/auth/me');
  return response.data?.data?.user ?? null;
}

export async function logout() {
  await api.post('/api/auth/logout');
}
