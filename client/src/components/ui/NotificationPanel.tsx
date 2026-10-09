import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BellOff, Trash2, X } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import Icon from './Icon';
import styles from './NotificationPanel.module.css';

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

export default function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, dismiss, clear } = useNotificationStore();
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          className={styles.panel}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.16 }}
        >
          <header className={styles.head}>
            <h2 className={styles.title}>Уведомления</h2>
            {items.length > 0 && (
              <button type="button" onClick={clear} aria-label="Очистить все" className={styles.act}>
                <Trash2 size={15} aria-hidden />
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Закрыть" className={styles.act}>
              <X size={15} aria-hidden />
            </button>
          </header>

          {items.length === 0 ? (
            <p className={styles.empty}>
              <BellOff size={22} strokeWidth={1.6} aria-hidden />
              Пока тихо
            </p>
          ) : (
            <ul className={styles.list}>
              {items.map((n) => (
                <li key={n.id} className={styles.item} data-unread={!n.read || undefined}>
                  {/* Навигация роутером, а не window.location — раньше клик
                      по уведомлению перезагружал всё приложение. */}
                  <button
                    type="button"
                    className={styles.hit}
                    onClick={() => { navigate(n.url); onClose(); }}
                  >
                    <span className={styles.mark}><Icon name={n.icon} size={15} /></span>
                    <span className={styles.text}>
                      <span className={styles.name}>{n.title}</span>
                      {n.body && <span className={styles.body}>{n.body}</span>}
                      <span className={styles.ago}>{timeAgo(n.createdAt)}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={styles.act}
                    aria-label={`Убрать «${n.title}»`}
                    onClick={() => dismiss(n.id)}
                  >
                    <X size={13} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
