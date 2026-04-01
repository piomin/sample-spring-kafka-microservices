import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// ─── Token Storage Contract ────────────────────────────────────────────────────

export interface TokenStorage {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
}

// ─── Toast Contract ────────────────────────────────────────────────────────────

export interface ToastService {
  error: (options: { title: string; description?: string }) => void;
  warning?: (options: { title: string; description?: string }) => void;
  info?: (options: { title: string; description?: string }) => void;
}

// ─── Interceptor Types ─────────────────────────────────────────────────────────

export type RequestInterceptorFulfilled = (
  config: InternalAxiosRequestConfig
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;

export type RequestInterceptorRejected = (error: unknown) => unknown;

export type ResponseInterceptorFulfilled = (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;

export type ResponseInterceptorRejected = (error: unknown) => unknown;

export interface RequestInterceptor {
  onFulfilled?: RequestInterceptorFulfilled;
  onRejected?: RequestInterceptorRejected;
}

export interface ResponseInterceptor {
  onFulfilled?: ResponseInterceptorFulfilled;
  onRejected?: ResponseInterceptorRejected;
}

// ─── Error Handler ─────────────────────────────────────────────────────────────

export type ErrorHandler = (error: AxiosError) => void;

// ─── Refresh Token ─────────────────────────────────────────────────────────────

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export type RefreshTokenFn = (refreshToken: string) => Promise<RefreshTokenResponse>;

// ─── Service Config ────────────────────────────────────────────────────────────

export interface ServiceConfig extends Omit<AxiosRequestConfig, 'baseURL' | 'timeout'> {
  /** Request timeout in ms. 0 = unlimited (default). */
  timeout?: number;

  /** Override headers merged on top of defaults. */
  headers?: Record<string, string>;

  /** Enable withCredentials (cookies). Default: false. */
  withCredentials?: boolean;

  /**
   * Called when a 401 is received. Supply this to enable automatic
   * token refresh via the default response interceptor.
   */
  refreshTokenFn?: RefreshTokenFn;

  /** Token storage implementation. Defaults to localStorage adapter. */
  tokenStorage?: TokenStorage;

  /** Toast service for the default error handler. */
  toastService?: ToastService;
}

// ─── createService Options ─────────────────────────────────────────────────────

export interface CreateServiceOptions {
  baseURL: string;
  errorHandler?: ErrorHandler | null;
  requestInterceptor?: RequestInterceptor | null;
  responseInterceptor?: ResponseInterceptor | null;
  config?: ServiceConfig;
}

// ─── File Upload ───────────────────────────────────────────────────────────────

export interface UploadOptions {
  /** Field name expected by the server. Default: "file". */
  fieldName?: string;
  /** Extra form fields to include alongside the file. */
  extraFields?: Record<string, string>;
  /** Progress callback (0–100). */
  onUploadProgress?: (percent: number) => void;
  /** Additional per-request axios config. */
  axiosConfig?: AxiosRequestConfig;
}

// ─── Service Instance ──────────────────────────────────────────────────────────

export interface ServiceInstance {
  /** Underlying axios instance – use for advanced scenarios. */
  readonly axios: AxiosInstance;

  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;

  /**
   * Upload a single file (or Blob) with optional extra form fields.
   * Automatically sets multipart/form-data and tracks progress.
   */
  upload<T = unknown>(url: string, file: File | Blob, options?: UploadOptions): Promise<T>;
}
