import { AxiosError } from 'axios';
import { ErrorHandler, ToastService } from '../type';
import { extractErrorMessage, NETWORK_ERROR_TITLE, resolveStatusTitle, TIMEOUT_ERROR_TITLE } from './messages';

// ─── Default Error Handler ─────────────────────────────────────────────────────

/**
 * Creates the default error handler.
 * Shows a toast with:
 *   - title  → static text based on HTTP status code
 *   - description → message extracted from the response body
 *
 * If no toast service is provided, falls back to console.error.
 */
export function createDefaultErrorHandler(toastService?: ToastService): ErrorHandler {
  return (error: AxiosError): void => {
    // Network error (no response from server)
    if (!error.response) {
      const title = error.code === 'ECONNABORTED' ? TIMEOUT_ERROR_TITLE : NETWORK_ERROR_TITLE;

      if (toastService) {
        toastService.error({ title, description: error.message });
      } else {
        console.error(`[ServiceError] ${title}:`, error.message);
      }
      return;
    }

    const { status, data } = error.response;
    const title = resolveStatusTitle(status);
    const description = extractErrorMessage(data);

    if (toastService) {
      toastService.error({ title, description });
    } else {
      console.error(`[ServiceError] ${status} – ${title}:`, description ?? data);
    }
  };
}
