import axios from 'axios';

// 1. Keep the short-lived access token in application memory
let accessToken = '';

export const setAccessToken = (token) => {
  accessToken = token;
};

export const notifyAuthChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-changed'));
  }
};

// 2. Create the custom Axios instance
const api = axios.create({
  baseURL: '/', // Points to your Next.js app root
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Request Interceptor: Attach Bearer Token automatically
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. Response Interceptor: Handle 401 Expirations & Token Rotation
api.interceptors.response.use(
  (response) => {
    if (response?.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. Check if the error is a 401
    // 2. Ensure we haven't tried to retry this request already
    // 3. FIX: Ensure the failed request was NOT the login endpoint!
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('/api/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post('/api/auth/refresh');
        const newAccessToken = refreshResponse.data?.data?.accessToken;
        
        setAccessToken(newAccessToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken('');
        return Promise.reject(refreshError);
      }
    }

    // If it was a login request failing with a 401, let it pass through normally
    // so your frontend can show "Invalid email or password" to the user.
    return Promise.reject(error);
  }
);

export default api;