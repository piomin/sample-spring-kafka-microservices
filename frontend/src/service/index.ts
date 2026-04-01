export { createService } from './instance';
export { localStorageTokenStorage } from './token-storage';
export { createDefaultErrorHandler } from './error/handler';
export { resolveStatusTitle, extractErrorMessage } from './error/messages';
export { createDefaultRequestInterceptor } from './interceptor/request';
export { createDefaultResponseInterceptor } from './interceptor/response';

export type {
  ServiceInstance,
  ServiceConfig,
  CreateServiceOptions,
  TokenStorage,
  ToastService,
  ErrorHandler,
  RequestInterceptor,
  ResponseInterceptor,
  RequestInterceptorFulfilled,
  RequestInterceptorRejected,
  ResponseInterceptorFulfilled,
  ResponseInterceptorRejected,
  RefreshTokenFn,
  RefreshTokenResponse,
  UploadOptions
} from './type';
