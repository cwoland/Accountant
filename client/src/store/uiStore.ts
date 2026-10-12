import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CaptureMode = 'expense' | 'income' | 'receipt' | 'transfer';

interface UiState {

  activeAccountId: string | null;
  setActiveAccount: (id: string | null) => void;

  capture: CaptureMode | null;
  openCapture: (mode: CaptureMode) => void;
  closeCapture: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeAccountId: null,
      setActiveAccount: (activeAccountId) => set({ activeAccountId }),

      capture: null,
      openCapture: (capture) => set({ capture }),
      closeCapture: () => set({ capture: null }),
    }),
    {
      name: 'accountant-ui',

      partialize: (s) => ({ activeAccountId: s.activeAccountId }),
    },
  ),
);
