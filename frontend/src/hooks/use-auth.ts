import { LocalStorageEnum } from '@/types';

export function useAuth() {
  const token = localStorage.getItem(LocalStorageEnum.AccessToken);
  return { isAuthenticated: Boolean(token), isLoading: false };
}
