import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '@accountant/shared';

interface AuthState {
  user: UserDto | null;
  token: string | null;
  setAuth: (user: UserDto, token: string) => void;
  setUser: (user: UserDto) => void;
  logout: () => void;
}

/**
 * Только личность и сессия. Выбор активного счёта живёт в uiStore:
 * раньше всё лежало в одном сторе, поэтому выход из аккаунта не сбрасывал
 * выбранный счёт, и следующий вошедший попадал в чужой контекст.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'accountant-auth',
      partialize: (s) => ({ user: s.user, token: s.token }),
    },
  ),
);
