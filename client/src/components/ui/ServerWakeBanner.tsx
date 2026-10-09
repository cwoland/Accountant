import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Server } from 'lucide-react';

type Phase = 'idle' | 'waking' | 'awake';

const HEALTH_URL = `${import.meta.env.VITE_API_URL || '/api'}/health`;

const SHOW_AFTER_MS = 2_000;
const POLL_MS = 3_000;
const HIDE_AFTER_MS = 2_500;

export default function ServerWakeBanner() {
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    const controller = new AbortController();
    const timers: ReturnType<typeof setTimeout>[] = [];
    let poll: ReturnType<typeof setInterval> | undefined;
    let shown = false;
    let done = false;

    const ping = async (): Promise<boolean> => {
      try {
        const res = await fetch(HEALTH_URL, {
          signal: controller.signal,
          cache: 'no-store',
        });
        return res.ok;
      } catch {
        return false;
      }
    };

    const finish = () => {
      if (done) return;
      done = true;
      if (poll) clearInterval(poll);
      if (!shown) {
        setPhase('idle');
        return;
      }
      setPhase('awake');
      timers.push(setTimeout(() => setPhase('idle'), HIDE_AFTER_MS));
    };

    void ping().then((ok) => {
      if (ok) finish();
    });

    timers.push(
      setTimeout(() => {
        if (done) return;
        shown = true;
        setPhase('waking');
        poll = setInterval(() => {
          void ping().then((ok) => {
            if (ok) finish();
          });
        }, POLL_MS);
      }, SHOW_AFTER_MS),
    );

    return () => {
      done = true;
      controller.abort();
      timers.forEach(clearTimeout);
      if (poll) clearInterval(poll);
    };
  }, []);

  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -48 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className={`wake-banner wake-banner--${phase}`}
        >
          {phase === 'waking' ? (
            <>
              <span className="wake-spinner" aria-hidden />
              <span>
                <strong>Будим сервер</strong>
                <small>Бесплатный хостинг засыпает · 20–30 сек</small>
              </span>
            </>
          ) : (
            <>
              <Server size={16} aria-hidden />
              <strong>Сервер готов</strong>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}