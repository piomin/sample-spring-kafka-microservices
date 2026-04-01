/**
 * ─────────────────────────────────────────────────────────────────────────────
 * createService – Usage Examples
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This file shows the most common integration patterns.
 * It is NOT meant to be compiled as-is – it imports from the library root.
 */

import { createService } from './index';
import type { ToastService, TokenStorage, RefreshTokenFn, RequestInterceptor, ErrorHandler } from './index';

// ─────────────────────────────────────────────────────────────────────────────
// 1. MINIMAL – only baseURL is required
// ─────────────────────────────────────────────────────────────────────────────

const minimalApi = createService({ baseURL: 'https://api.example.com' });

// Usage
async function getUser(): Promise<{ id: number; name: string }> {
  return await minimalApi.get<{ id: number; name: string }>('/users/1');
}

async function createUser(): Promise<{ id: number }> {
  return await minimalApi.post<{ id: number }>('/users', {
    name: 'Alice'
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. WITH TOAST + REFRESH TOKEN (most common production setup)
// ─────────────────────────────────────────────────────────────────────────────

// Implement the ToastService interface with whatever UI library you use
// e.g. react-toastify, shadcn/ui Toaster, antd message, etc.
const toast: ToastService = {
  error: ({ title, description }) => {
    console.error(`[${title}]`, description);
    // toast.error(`${title}\n${description}`) ← your UI library here
  }
};

// Implement the refresh call against YOUR auth endpoint
const refreshTokenFn: RefreshTokenFn = async (refreshToken) => {
  const response = await fetch('https://api.example.com/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  if (!response.ok) throw new Error('Refresh failed');
  return response.json(); // must return { accessToken, refreshToken }
};

const productionApi = createService({
  baseURL: 'https://api.example.com/v1',
  config: {
    timeout: 15_000, // 15 s
    toastService: toast,
    refreshTokenFn,
    withCredentials: true,
    headers: { 'X-App-Version': '2.0.0' }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. CUSTOM TOKEN STORAGE (e.g. secure cookie, Redux, Zustand)
// ─────────────────────────────────────────────────────────────────────────────

const inMemoryTokenStorage: TokenStorage = (() => {
  let access: string | null = null;
  let refresh: string | null = null;
  return {
    getAccessToken: () => access,
    getRefreshToken: () => refresh,
    setTokens: (a, r) => {
      access = a;
      refresh = r;
    },
    clearTokens: () => {
      access = null;
      refresh = null;
    }
  };
})();

const secureApi = createService({
  baseURL: 'https://api.example.com',
  config: { tokenStorage: inMemoryTokenStorage }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. CUSTOM INTERCEPTORS (extend, not replace, the defaults)
// ─────────────────────────────────────────────────────────────────────────────

const customRequestInterceptor: RequestInterceptor = {
  onFulfilled: (config) => {
    // Add a correlation ID for tracing
    config.headers['X-Correlation-ID'] = crypto.randomUUID();
    // Still attach bearer token by calling default manually, or
    // keep the default interceptor and add another one via .axios.interceptors
    return config;
  }
};

const tracedApi = createService({
  baseURL: 'https://api.example.com',
  requestInterceptor: customRequestInterceptor
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. DISABLE DEFAULTS ENTIRELY (raw axios with no interceptors)
// ─────────────────────────────────────────────────────────────────────────────

const rawApi = createService({
  baseURL: 'https://api.example.com',
  requestInterceptor: null,
  responseInterceptor: null,
  errorHandler: null
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. CUSTOM ERROR HANDLER ONLY
// ─────────────────────────────────────────────────────────────────────────────

const customErrorHandler: ErrorHandler = (error) => {
  // Send to Sentry, Datadog, etc.
  // Sentry.captureException(error);
  console.error('Custom handler:', error.response?.status, error.message);
};

const monitoredApi = createService({
  baseURL: 'https://api.example.com',
  errorHandler: customErrorHandler
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. FILE UPLOAD with progress tracking
// ─────────────────────────────────────────────────────────────────────────────

async function uploadAvatar(file: File): Promise<{ url: string }> {
  return productionApi.upload<{ url: string }>('/users/me/avatar', file, {
    fieldName: 'avatar', // server expects "avatar" not "file"
    extraFields: { category: 'profile' },
    onUploadProgress: (percent) => {
      console.log(`Upload: ${percent}%`);
      // setProgress(percent) ← update your UI state here
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. MULTIPLE INSTANCES (e.g. different microservices)
// ─────────────────────────────────────────────────────────────────────────────

const userApi = createService({
  baseURL: 'https://users.example.com/v1',
  config: { toastService: toast, refreshTokenFn }
});

const paymentApi = createService({
  baseURL: 'https://payments.example.com/v2',
  config: {
    toastService: toast,
    timeout: 30_000, // payments may need longer timeout
    headers: { 'X-Idempotency-Key': crypto.randomUUID() }
  }
});

const analyticsApi = createService({
  baseURL: 'https://analytics.example.com',
  errorHandler: null, // analytics failures should be silent
  config: { timeout: 5_000 }
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. ACCESS THE RAW AXIOS INSTANCE (escape hatch)
// ─────────────────────────────────────────────────────────────────────────────

// Add an extra interceptor on top of what createService already set up
productionApi.axios.interceptors.request.use((config) => {
  config.headers['X-Extra'] = 'yes';
  return config;
});

export {
  minimalApi,
  productionApi,
  secureApi,
  tracedApi,
  rawApi,
  monitoredApi,
  userApi,
  paymentApi,
  analyticsApi,
  uploadAvatar,
  getUser,
  createUser
};
