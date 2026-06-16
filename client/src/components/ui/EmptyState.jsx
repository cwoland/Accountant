import { motion } from 'framer-motion';
import Button from './Button';

export default function EmptyState({
  icon, title, description, action, actionLabel,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 24px',
        gap: 16,
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
        style={{
          width: 80, height: 80,
          borderRadius: 'var(--radius-xl)',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: typeof icon === 'string' ? '2.2rem' : undefined,
          marginBottom: 8,
        }}
      >
        {icon}
      </motion.div>

      <div style={{ maxWidth: 320 }}>
        <h3 style={{
          fontSize: '1.1rem', fontWeight: 700,
          marginBottom: 8, letterSpacing: '-0.02em',
        }}>
          {title}
        </h3>
        <p style={{
          color: 'var(--text-3)', fontSize: '0.875rem',
          lineHeight: 1.65,
        }}>
          {description}
        </p>
      </div>

      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{ marginTop: 8 }}
        >
          <Button onClick={action}>{actionLabel || 'Начать'}</Button>
        </motion.div>
      )}
    </motion.div>
  );
}