import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationPanel from '../ui/NotificationPanel';
import styles from './TopBar.module.css';

export default function TopBar() {
  const [open, setOpen] = useState(false);
  const unread = useNotificationStore((s) => s.unread);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.brand}>
        <span className={styles.mark} aria-hidden>A</span>
        <span className={styles.name}>Accountant</span>
      </Link>

      <Link to="/transactions?focus=search" className={styles.icon} aria-label="Поиск по операциям">
        <Search size={17} strokeWidth={2.2} aria-hidden />
      </Link>

      <button
        type="button"
        className={styles.icon}
        aria-label={unread > 0 ? `Уведомления, непрочитанных: ${unread}` : 'Уведомления'}
        aria-expanded={open}
        onClick={() => { setOpen((v) => !v); if (!open) markAllRead(); }}
      >
        <Bell size={17} strokeWidth={2.2} aria-hidden />
        {unread > 0 && <span className={styles.dot} aria-hidden />}
      </button>

      <NotificationPanel open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
