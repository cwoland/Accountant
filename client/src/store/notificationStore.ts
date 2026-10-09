import { create } from 'zustand';
import type { IconName } from '@accountant/shared';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  /** Имя иконки из реестра — вместо эмодзи 🔔, которое было здесь раньше. */
  icon: IconName;
  url: string;
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  items: AppNotification[];
  unread: number;
  add: (n: Partial<AppNotification> & { title: string }) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

const MAX = 50;

export const useNotificationStore = create<NotificationState>()((set) => ({
  items: [],
  unread: 0,

  add: (input) =>
    set((s) => {
      const n: AppNotification = {
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        body: '',
        icon: 'circle',
        url: '/',
        createdAt: new Date().toISOString(),
        read: false,
        ...input,
      };
      return { items: [n, ...s.items].slice(0, MAX), unread: s.unread + 1 };
    }),

  markAllRead: () =>
    set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })), unread: 0 })),

  dismiss: (id) =>
    set((s) => {
      const target = s.items.find((n) => n.id === id);
      return {
        items: s.items.filter((n) => n.id !== id),
        unread: target && !target.read ? Math.max(0, s.unread - 1) : s.unread,
      };
    }),

  clear: () => set({ items: [], unread: 0 }),
}));
