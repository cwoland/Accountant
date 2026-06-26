import { create } from 'zustand';

const useNotificationStore = create((set) => ({
    notifications: [],
    unreadCount: 0,

    addNotification: (notification) =>
        set((s) => {
            const n = {
                id: `n-${Date.now()}-${Math.random()}`,
                title: '',
                body: '',
                icon: '🔔',
                url: '/',
                createdAt: new Date().toISOString(),
                read: false,
                ...notification,
            };
            return {
                notifications: [n, ...s.notifications].slice(0, 50),
                unreadCount: s.unreadCount + 1,
            };
        }),

        markAllRead: () =>
            set((s) => ({
                notifications: s.notifications.map((n) => ({ ...n, read: true })),
                unreadCount: 0,
            })),

        dismiss: (id) =>
            set((s) => {
                const target = s.notifications.find((n) => n.id === id);
                return {
                    notifications: s.notifications.filter((n) => n.id !== id),
                    unreadCount: target && !target.read ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
                };
            }),

        clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

export default useNotificationStore;