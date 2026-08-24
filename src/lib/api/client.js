import api, { setAccessToken, notifyAuthChanged } from '../axios.js';
import { parseApiResponseError } from './errors.js';

/**
 * Central API Client Wrapper for Anuo-v2
 * Provides normalized error handling, standardized response extraction, and helper shortcuts.
 */

export class ApiClient {
  static setToken(token) {
    setAccessToken(token);
    notifyAuthChanged();
  }

  static clearToken() {
    setAccessToken('');
    notifyAuthChanged();
  }

  static async request(config) {
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      throw parseApiResponseError(error);
    }
  }

  static async get(url, params = {}, config = {}) {
    return this.request({ method: 'GET', url, params, ...config });
  }

  static async post(url, data = {}, config = {}) {
    return this.request({ method: 'POST', url, data, ...config });
  }

  static async put(url, data = {}, config = {}) {
    return this.request({ method: 'PUT', url, data, ...config });
  }

  static async patch(url, data = {}, config = {}) {
    return this.request({ method: 'PATCH', url, data, ...config });
  }

  static async delete(url, config = {}) {
    return this.request({ method: 'DELETE', url, ...config });
  }

  /**
   * Helper for creating abortable requests
   */
  static createCancelToken() {
    const controller = new AbortController();
    return {
      signal: controller.signal,
      cancel: () => controller.abort(),
    };
  }
}

export default ApiClient;
