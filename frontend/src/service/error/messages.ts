/**
 * Static title strings for the default error handler toast.
 * Extend or replace as needed per project locale.
 */
export const HTTP_STATUS_TITLES: Record<number, string> = {
  // 4xx Client Errors
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  413: 'Payload Too Large',
  415: 'Unsupported Media Type',
  422: 'Unprocessable Entity',
  423: 'Locked',
  429: 'Too Many Requests',

  // 5xx Server Errors
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported'
};

export const FALLBACK_ERROR_TITLE = 'An error occurred';
export const NETWORK_ERROR_TITLE = 'Network Error';
export const TIMEOUT_ERROR_TITLE = 'Request Timed Out';
export const UNHANDLED_ERROR_MESSAGE = 'Error message could not be determined.';

/**
 * Resolve a human-readable title from a numeric HTTP status code.
 */
export function resolveStatusTitle(status?: number): string {
  if (!status) return FALLBACK_ERROR_TITLE;
  return HTTP_STATUS_TITLES[status] ?? `HTTP Error ${status}`;
}

/**
 * Extracts the error message from an API response body.
 * Expects a standard error response shape: { message: string }
 * Falls back to a generic message if the field is missing or the shape is unexpected.
 */
export function extractErrorMessage(data: unknown): string {
  if (data !== null && typeof data === 'object') {
    const message = (data as Record<string, unknown>)['message'];
    if (typeof message === 'string') return message;
  }

  return UNHANDLED_ERROR_MESSAGE;
}
