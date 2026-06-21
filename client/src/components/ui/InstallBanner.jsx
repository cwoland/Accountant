import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import Button from './Button';

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (dismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setTimeout(() => setVisible(true), 3000); // показываем через 3 сек
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-dismissed', '1');
    setVisible(false);
  };

  if (installed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed', bottom: 24, left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9998,
            background: 'var(--surface)',
            border: '1px solid var(--border-2)',
            borderRadius: 'var(--radius-xl)',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 16px 60px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(16px)',
            maxWidth: 'calc(100vw - 32px)',
            width: 420,
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-m)',
            background: 'var(--accent)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)', fontSize: '1.3rem',
          }}>
            <img
            src="/icon.svg"
            alt="Accountant"
            style={{ width: 44, height: 44, borderRadius: 'var(--radius-m)' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 2 }}>
              Установить Accountant
            </p>
            <p style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>
              Работает без браузера, как нативное приложение
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Button
              variant="secondary" size="sm"
              onClick={handleDismiss}
              icon={<X size={14} />}
            >
              Нет
            </Button>
            <Button
              size="sm"
              onClick={handleInstall}
              icon={<Download size={14} />}
            >
              Установить
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}