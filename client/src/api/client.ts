import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { ApiError } from '@accountant/shared';
import { useAuthStore } from '../store/authStore';

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 45_000,
});

api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const PUBLIC_401 = ['/auth/login', '/auth/register', '/auth/password'];

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiError>) => {
    const url = error.config?.url ?? '';
    const isFormAuth = PUBLIC_401.some((p) => url.includes(p));

    if (error.response?.status === 401 && !isFormAuth) {
      const { token, logout } = useAuthStore.getState();
      if (token) {
        logout();
        const next = encodeURIComponent(window.location.pathname);
        window.location.replace(`/login?expired=1&next=${next}`);
      }
    }
    return Promise.reject(error);
  },
);

export function errorMessage(err: unknown, fallback = 'Что-то пошло не так'): string {
  if (axios.isAxiosError<ApiError>(err)) {
    if (err.code === 'ECONNABORTED') return 'Сервер не ответил. Попробуйте ещё раз.';
    if (!err.response) return 'Нет связи с сервером.';
    return err.response.data?.message ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

export function errorFields(err: unknown): Record<string, string> {
  return axios.isAxiosError<ApiError>(err) ? (err.response?.data?.fields ?? {}) : {};
}