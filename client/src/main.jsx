import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

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
    <Toaster />
  </QueryClientProvider>
</React.StrictMode>
);
