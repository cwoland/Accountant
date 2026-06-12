import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server } from 'lucide-react';

export default function WakeUpBanner() {
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    let wakeTimer;
    let hideTimer;
    const controller = new AbortController();
    let shown = false;

    const check = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/health`,
          { signal: controller.signal }
        );
        if (res.ok) {
          if (shown) {
            setStatus('awake');
            hideTimer = setTimeout(() => setStatus('idle'), 2500);
          }
        }
      } catch {
      }
    };

    wakeTimer = setTimeout(() => {
      shown = true;
      setStatus('waking');

      const interval = setInterval(async () => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/health`,
            { signal: controller.signal }
          );
          if (res.ok) {
            clearInterval(interval);
            setStatus('awake');
            hideTimer = setTimeout(() => setStatus('idle'), 2500);
          }
        } catch { }
      }, 3000);

      return () => clearInterval(interval);
    }, 2000);

    check();

    return () => {
      clearTimeout(wakeTimer);
      clearTimeout(hideTimer);
      controller.abort();
    };
  }, []);

  return (
    <AnimatePresence>
      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed', top: 16, left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: status === 'awake' ? 'var(--green-dim)' : 'var(--amber-dim)',
            border: `1px solid ${status === 'awake' ? 'rgba(34,211,165,0.35)' : 'rgba(251,191,36,0.35)'}`,
            borderRadius: 'var(--radius-xl)',
            padding: '10px 20px',
            display: 'flex', alignItems: 'center', gap: 10,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            maxWidth: 'calc(100vw - 32px)',
            whiteSpace: 'nowrap',
          }}
        >
          {status === 'waking' ? (
            <>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                border: '2px solid var(--amber)',
                borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
                flexShrink: 0,
              }} />
              <div>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--amber)' }}>
                  Пробуждаем сервер
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 1 }}>
                  Подождите 20–30 сек
                </p>
              </div>
            </>
          ) : (
            <>
              <Server size={16} color="var(--green)" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--green)' }}>
                Сервер готов к работе
              </p>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}