import type { TokenStorage } from './type';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Default token storage backed by localStorage.
 * Swap this out for sessionStorage, a secure cookie solution,
 * or an in-memory store depending on your security requirements.
 */
export const localStorageTokenStorage: TokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),

  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};
