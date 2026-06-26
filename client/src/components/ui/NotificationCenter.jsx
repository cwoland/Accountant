import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCheck, Trash2, Bell } from 'lucide-react';
import useNotificationStore from '../../store/useNotificationStore';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'только что';
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  return `${Math.floor(h / 24)} дн назад`;
}

function NotificationPopover({ onClose, anchorRef }) {
  const { notifications, unreadCount, markAllRead, dismiss, clearAll } =
    useNotificationStore();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        ref.current && !ref.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorRef]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{  opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        width: 340,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-l)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        zIndex: 200,
        overflow: 'hidden',
      }}
    >
      <NotificationContent
        notifications={notifications}
        unreadCount={unreadCount}
        markAllRead={markAllRead}
        dismiss={dismiss}
        clearAll={clearAll}
        onClose={onClose}
      />
    </motion.div>
  );
}

function NotificationModal({ onClose }) {
  const { notifications, unreadCount, markAllRead, dismiss, clearAll } =
    useNotificationStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 200,
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{
          width: '100%',
          maxHeight: '80vh',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-l) var(--radius-l) 0 0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>
        <NotificationContent
          notifications={notifications}
          unreadCount={unreadCount}
          markAllRead={markAllRead}
          dismiss={dismiss}
          clearAll={clearAll}
          onClose={onClose}
        />
      </motion.div>
    </motion.div>
  );
}

function NotificationContent({ notifications, unreadCount, markAllRead, dismiss, clearAll, onClose }) {
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 16px 12px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Уведомления</span>
          {unreadCount > 0 && (
            <span style={{
              background: 'var(--accent)', color: '#fff',
              fontSize: '0.68rem', fontWeight: 700,
              padding: '2px 7px', borderRadius: 99,
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} title="Прочитать все" style={iconBtnStyle()}>
              <CheckCheck size={15} />
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} title="Очистить все" style={iconBtnStyle()}>
              <Trash2 size={15} />
            </button>
          )}
          <button onClick={onClose} style={iconBtnStyle()}>
            <X size={15} />
          </button>
        </div>
      </div>

      <div style={{ overflowY: 'auto', maxHeight: 420 }}>
        {notifications.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 10, padding: '40px 20px',
            color: 'var(--text-3)',
          }}>
            <Bell size={28} strokeWidth={1.5} />
            <p style={{ fontSize: '0.85rem' }}>Уведомлений пока нет</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{   opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
              >
                <div style={{
                  display: 'flex', gap: 12, padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  background: n.read ? 'transparent' : 'var(--accent-dim)',
                  transition: 'var(--transition)',
                  cursor: n.url && n.url !== '/' ? 'pointer' : 'default',
                }}
                  onClick={() => { if (n.url && n.url !== '/') window.location.href = n.url; }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 'var(--radius-s)',
                    background: 'var(--surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0,
                  }}>
                    {n.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.82rem', fontWeight: 600,
                      color: 'var(--text-1)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: 2 }}>
                        {n.body}
                      </p>
                    )}
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 4 }}>
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    style={{ ...iconBtnStyle(), flexShrink: 0, alignSelf: 'flex-start' }}
                  >
                    <X size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </>
  );
}

function iconBtnStyle() {
  return {
    width: 28, height: 28, borderRadius: 'var(--radius-s)',
    background: 'transparent', color: 'var(--text-3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', border: 'none', transition: 'var(--transition)',
  };
}

export default function NotificationCenter({ open, onClose, anchorRef, isMobile }) {
  return (
    <AnimatePresence>
      {open && (
        isMobile
          ? <NotificationModal onClose={onClose} />
          : <NotificationPopover onClose={onClose} anchorRef={anchorRef} />
      )}
    </AnimatePresence>
  );
}