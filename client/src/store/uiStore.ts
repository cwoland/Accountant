import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CaptureMode = 'expense' | 'income' | 'receipt';

interface UiState {
  /** null — личный счёт. Сохраняется между запусками. */
  activeAccountId: string | null;
  setActiveAccount: (id: string | null) => void;

  /** Лист записи траты. null — закрыт. */
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
      // Открытый лист записи не переживает перезагрузку — иначе
      // приложение стартует с модалкой поверх пустого экрана.
      partialize: (s) => ({ activeAccountId: s.activeAccountId }),
    },
  ),
);
