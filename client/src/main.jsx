import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import WakeUpBanner from './components/ui/WakeUpBanner';
import InstallBanner from './components/ui/InstallBanner';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const style = document.createElement('style');
style.textContent = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideIn { from { transform: translateX(-16px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <WakeUpBanner />
      <InstallBanner />
      <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--surface-2)',
          color: 'var(--text-1)',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-m)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
        },
        success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg)' } },
        error: { iconTheme: { primary: 'var(--red)', secondary: 'var(--bg)' } },
      }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);