import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            activeAccountId: null,
            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
            setAuth: (user, token) => set({ user, token }),
            setActiveAccount: (id) => set({ activeAccountId: id }),
            logout: () => set({ user: null, token: null }), 
        }),
        {
            name: 'accountant-auth',
            partialize: (state) => ({ user: state.user, token: state.token, activeAccountId: state.activeAccountId, }),
        }
    )
);

export default useStore;