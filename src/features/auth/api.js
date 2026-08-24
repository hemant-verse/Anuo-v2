import ApiClient from '@/lib/api/client';

export async function getCurrentUser() {
  const data = await ApiClient.get('/api/auth/me');
  return data?.data?.user ?? null;
}

export async function login({ email, password }) {
  const data = await ApiClient.post('/api/auth/login', { email, password });
  if (data?.data?.accessToken) {
    ApiClient.setToken(data.data.accessToken);
  }
  return data?.data;
}

export async function register({ userName, email, password }) {
  const data = await ApiClient.post('/api/auth/register', { userName, email, password });
  return data?.data;
}

export async function verifyEmail({ email, otp }) {
  const data = await ApiClient.post('/api/auth/verify-email', { email, otp });
  if (data?.data?.accessToken) {
    ApiClient.setToken(data.data.accessToken);
  }
  return data?.data;
}

export async function requestPasswordReset(email) {
  const data = await ApiClient.post('/api/auth/forgot-password', { email });
  return data?.data;
}

export async function resetPassword({ email, otp, newPassword }) {
  const data = await ApiClient.post('/api/auth/reset-password', { email, otp, newPassword });
  return data?.data;
}

export async function logout() {
  try {
    await ApiClient.post('/api/auth/logout');
  } finally {
    ApiClient.clearToken();
  }
}
