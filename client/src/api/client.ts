import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { ApiError } from '@accountant/shared';
import { useAuthStore } from '../store/authStore';
import { translateCode } from '../i18n';

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

export function errorMessage(err: unknown, fallback?: string): string {
  if (axios.isAxiosError<ApiError>(err)) {
    if (err.code === 'ECONNABORTED') return translateCode('error.timeout', {}, fallback);
    if (!err.response) return translateCode('error.serverDown', {}, fallback);
    const data = err.response.data;
    if (data?.code) return translateCode(data.code, data.params, data.message ?? fallback);
    return data?.message ?? translateCode('error.unknown', {}, fallback);
  }
  return translateCode('error.unknown', {}, fallback);
}

export function errorFields(err: unknown): Record<string, string> {
  return axios.isAxiosError<ApiError>(err) ? (err.response?.data?.fields ?? {}) : {};
}