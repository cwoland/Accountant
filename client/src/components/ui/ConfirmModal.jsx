import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ConfirmModal({ open, onConfirm, onCancel, title, message }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'fixed', 
              inset: 0,
              margin: 'auto',
              zIndex: 201,
              width: 'calc(100vw - 32px)', 
              maxWidth: 380,
              height: 'fit-content',
              background: 'var(--bg-3)',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius-xl)',
              padding: '28px 24px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-m)',
              background: 'var(--red-dim)', color: 'var(--red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <AlertTriangle size={22} />
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>
              {title || 'Подтвердите действие'}
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 24 }}>
              {message || 'Это действие нельзя отменить. Продолжить?'}
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" fullWidth onClick={onCancel}>
                Отмена
              </Button>
              <Button
                fullWidth onClick={onConfirm}
                style={{ background: 'var(--red)', boxShadow: '0 0 20px rgba(248,114,114,0.3)' }}
              >
                Удалить
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}