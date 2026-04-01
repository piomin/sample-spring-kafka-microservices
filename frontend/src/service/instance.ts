import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

import type { CreateServiceOptions, ServiceInstance, UploadOptions } from './type';
import { localStorageTokenStorage } from './token-storage';
import { createDefaultErrorHandler } from './error/handler';
import { createDefaultRequestInterceptor } from './interceptor/request';
import { createDefaultResponseInterceptor } from './interceptor/response';

/**
 * Creates a fully configured Axios service instance.
 *
 * @example
 * // Minimal usage – only baseURL is required:
 * const api = createService({ baseURL: 'https://api.example.com' });
 *
 * @example
 * // Full customisation:
 * const api = createService({
 *   baseURL: 'https://api.example.com',
 *   config: {
 *     timeout: 10_000,
 *     toastService: myToast,
 *     tokenStorage: myTokenStorage,
 *     refreshTokenFn: myRefreshFn,
 *   },
 * });
 *
 * @example
 * // Disable default interceptors / error handler entirely:
 * const api = createService({
 *   baseURL: 'https://api.example.com',
 *   requestInterceptor: null,
 *   responseInterceptor: null,
 *   errorHandler: null,
 * });
 *
 * @example
 * // Provide custom interceptors while keeping defaults:
 * const api = createService({
 *   baseURL: 'https://api.example.com',
 *   requestInterceptor: {
 *     onFulfilled: (config) => {
 *       config.headers['X-Custom'] = 'value';
 *       return config;
 *     },
 *   },
 * });
 */
export function createService(options: CreateServiceOptions): ServiceInstance {
  const {
    baseURL,
    config = {},
    errorHandler: customErrorHandler,
    requestInterceptor: customRequestInterceptor,
    responseInterceptor: customResponseInterceptor
  } = options;

  const {
    timeout = 0,
    headers: extraHeaders,
    withCredentials = false,
    refreshTokenFn,
    tokenStorage = localStorageTokenStorage,
    toastService,
    ...restAxiosConfig
  } = config;

  // ── Create the axios instance ────────────────────────────────────────────────
  const instance = axios.create({
    baseURL,
    timeout,
    withCredentials,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...extraHeaders
    },
    ...restAxiosConfig
  });

  // ── Resolve error handler ────────────────────────────────────────────────────
  // null  → disabled entirely
  // undefined → use default
  // function  → use custom
  const resolvedErrorHandler =
    customErrorHandler === null ? undefined : (customErrorHandler ?? createDefaultErrorHandler(toastService));

  // ── Register request interceptor ─────────────────────────────────────────────
  if (customRequestInterceptor !== null) {
    const reqInterceptor = customRequestInterceptor ?? createDefaultRequestInterceptor(tokenStorage);

    instance.interceptors.request.use(reqInterceptor.onFulfilled, reqInterceptor.onRejected);
  }

  // ── Register response interceptor ────────────────────────────────────────────
  if (customResponseInterceptor !== null) {
    const resInterceptor =
      customResponseInterceptor ??
      createDefaultResponseInterceptor(instance, tokenStorage, refreshTokenFn, resolvedErrorHandler);

    instance.interceptors.response.use(resInterceptor.onFulfilled, resInterceptor.onRejected);
  } else if (resolvedErrorHandler) {
    // Even when response interceptor is disabled, attach a plain error handler
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error)) resolvedErrorHandler(error);
        return Promise.reject(error);
      }
    );
  }

  // ── Helper: unwrap response data ─────────────────────────────────────────────
  async function request<T>(axiosConfig: AxiosRequestConfig): Promise<T> {
    const response = await instance.request<T>(axiosConfig);
    return response.data;
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  const service: ServiceInstance = {
    axios: instance,

    get<T = unknown>(url: string, config?: AxiosRequestConfig) {
      return request<T>({ ...config, method: 'GET', url });
    },

    post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
      return request<T>({ ...config, method: 'POST', url, data });
    },

    put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
      return request<T>({ ...config, method: 'PUT', url, data });
    },

    patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
      return request<T>({ ...config, method: 'PATCH', url, data });
    },

    delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
      return request<T>({ ...config, method: 'DELETE', url });
    },

    upload<T = unknown>(
      url: string,
      file: File | Blob,
      { fieldName = 'file', extraFields, onUploadProgress, axiosConfig }: UploadOptions = {}
    ): Promise<T> {
      const formData = new FormData();
      formData.append(fieldName, file);

      if (extraFields) {
        Object.entries(extraFields).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      return request<T>({
        ...axiosConfig,
        method: 'POST',
        url,
        data: formData,
        headers: {
          // Let the browser set the multipart boundary automatically.
          // Explicitly setting Content-Type here would break it.
          'Content-Type': 'multipart/form-data',
          ...axiosConfig?.headers
        },
        onUploadProgress: onUploadProgress
          ? (progressEvent) => {
              const total = progressEvent.total ?? 0;
              const percent = total > 0 ? Math.round((progressEvent.loaded * 100) / total) : 0;
              onUploadProgress(percent);
            }
          : undefined
      });
    }
  };

  return service;
}
