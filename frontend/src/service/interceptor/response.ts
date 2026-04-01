import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { ErrorHandler, RefreshTokenFn, ResponseInterceptor, TokenStorage } from '../type';
import { localStorageTokenStorage } from '../token-storage';

// ─── Default Response Interceptor ───────────────────────────────────────────────

/**
 * Tracks whether a token refresh is already in flight so we don't
 * trigger multiple refresh calls for concurrent 401 responses.
 */
let _isRefreshing = false;
let _refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void): void {
  _refreshSubscribers.push(cb);
}

function notifyTokenRefreshed(token: string): void {
  _refreshSubscribers.forEach((cb) => cb(token));
  _refreshSubscribers = [];
}

/**
 * On 401:
 *   1. If a refreshTokenFn is provided → tries to refresh the access token.
 *   2. Retries the original request with the new token.
 *   3. If refresh fails → clears tokens and rejects.
 *   4. Queues concurrent 401 requests and replays them after a single refresh.
 *
 * If no refreshTokenFn is provided, 401 errors are passed through as-is
 * (the error handler will still display a toast).
 */
export function createDefaultResponseInterceptor(
  axiosInstance: AxiosInstance,
  tokenStorage: TokenStorage = localStorageTokenStorage,
  refreshTokenFn?: RefreshTokenFn,
  errorHandler?: ErrorHandler
): ResponseInterceptor {
  return {
    onFulfilled: (response: AxiosResponse): AxiosResponse => response,

    onRejected: async (error: unknown): Promise<unknown> => {
      if (!axios.isAxiosError(error)) return Promise.reject(error);

      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      const is401 = error.response?.status === 401 && !originalRequest?._retry;

      // ── Not a 401 or already retried → run error handler and reject ─────────
      if (!is401) {
        if (errorHandler) errorHandler(error);
        return Promise.reject(error);
      }

      // ── No refresh function configured → error handler + reject ─────────────
      if (!refreshTokenFn) {
        if (errorHandler) errorHandler(error);
        return Promise.reject(error);
      }

      // ── A refresh is already in-flight: queue this request ──────────────────
      if (_isRefreshing) {
        return new Promise<unknown>((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            if (!originalRequest) return reject(error);
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      // ── First 401 → attempt refresh ──────────────────────────────────────────
      originalRequest._retry = true;
      _isRefreshing = true;

      const storedRefreshToken = tokenStorage.getRefreshToken();

      if (!storedRefreshToken) {
        _isRefreshing = false;
        tokenStorage.clearTokens();
        if (errorHandler) errorHandler(error);
        return Promise.reject(error);
      }

      try {
        const { accessToken, refreshToken } = await refreshTokenFn(storedRefreshToken);

        tokenStorage.setTokens(accessToken, refreshToken);
        notifyTokenRefreshed(accessToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        _refreshSubscribers = [];
        tokenStorage.clearTokens();
        // Dispatch the original 401 error to the error handler
        if (errorHandler) errorHandler(error);
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }
  };
}
