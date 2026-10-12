import './i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { registerSW } from 'virtual:pwa-register';
import toast from 'react-hot-toast';
import App from './App';
import './styles/tokens.css';
import './styles/base.css';

const updateSW = registerSW({
  onNeedRefresh() {
    toast(
      (t) => (
        <span>
          Доступна новая версия.{' '}
          <button
            type="button"
            onClick={() => { toast.dismiss(t.id); void updateSW(true); }}
            style={{ textDecoration: 'underline', fontWeight: 700 }}
          >
            Обновить
          </button>
        </span>
      ),
      { duration: Infinity, id: 'sw-update' },
    );
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,

      networkMode: 'offlineFirst',
    },
  },
});

const root = document.getElementById('root');
if (!root) throw new Error('Не найден #root');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3200,
          style: {
            background: 'var(--wall-2)',
            color: 'var(--bone)',
            border: '1px solid var(--hairline-2)',
            borderRadius: 'var(--r-tile)',
            fontFamily: 'var(--font-word)',
            fontSize: '13.5px',
            fontWeight: 600,
            maxWidth: '92vw',
          },
          success: { iconTheme: { primary: 'var(--ok)', secondary: 'var(--wall-2)' } },
          error: { iconTheme: { primary: 'var(--over)', secondary: 'var(--wall-2)' } },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
);
