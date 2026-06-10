import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, X } from 'lucide-react';
import api from '../../api/axios';

export default function WakeUpBanner() {
    const [status, setStatus] = useState('idle');

    useEffect(() => {
  let timer;
  const controller = new AbortController();

  const check = async () => {
    try {
      const start = Date.now();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/health`,
        { signal: controller.signal }
      );
      if (!res.ok) return;
      const elapsed = Date.now() - start;
      if (elapsed > 3000) {
        setStatus('awake');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
        
    }
  };

  timer = setTimeout(() => {
    setStatus('waking');
    check();
  }, 2000);

  check();

  return () => {
    clearTimeout(timer);
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
          }}
        >
          {status === 'waking' ? (
            <>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
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