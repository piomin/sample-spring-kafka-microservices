import { InternalAxiosRequestConfig } from 'axios';
import { localStorageTokenStorage } from '../token-storage';
import { RequestInterceptor, TokenStorage } from '../type';

// ─── Default Request Interceptor ───────────────────────────────────────────────

/**
 * Default request interceptor.
 * Automatically attaches the Bearer access token from the token storage
 * to every outgoing request's Authorization header.
 */
export function createDefaultRequestInterceptor(
  tokenStorage: TokenStorage = localStorageTokenStorage
): RequestInterceptor {
  return {
    onFulfilled: (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },

    onRejected: (error: unknown) => Promise.reject(error)
  };
}
