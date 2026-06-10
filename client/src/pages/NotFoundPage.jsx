import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="mesh-bg"><span /><span /><span /></div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center',
          padding: '40px 24px', position: 'relative', zIndex: 1,
          maxWidth: 480,
        }}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          style={{ position: 'relative', marginBottom: 8 }}
        >
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(7rem, 20vw, 10rem)',
            fontWeight: 800,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            background: 'linear-gradient(135deg, var(--accent-2), var(--green))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'block',
            userSelect: 'none',
          }}>
            404
          </span>
          <div style={{
            position: 'absolute', bottom: -20, left: '50%',
            transform: 'translateX(-50%)',
            width: '80%', height: 40,
            background: 'var(--accent)',
            filter: 'blur(40px)',
            opacity: 0.25,
            borderRadius: '50%',
          }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 style={{
            fontSize: '1.5rem', fontWeight: 700,
            marginBottom: 12, letterSpacing: '-0.02em',
          }}>
            Страница не найдена
          </h2>
          <p style={{
            color: 'var(--text-3)', fontSize: '0.925rem',
            lineHeight: 1.7, marginBottom: 36,
          }}>
            Такой страницы не существует или она была удалена.<br />
            Вернитесь на главную и продолжите работу.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Button
            variant="secondary"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Назад
          </Button>
          <Button
            icon={<Home size={16} />}
            onClick={() => navigate('/')}
          >
            На главную
          </Button>
        </motion.div>

        {['💸', '📊', '💰', '🧾'].map((emoji, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [-20, -80],
              x: [0, (i % 2 === 0 ? 30 : -30)],
            }}
            transition={{
              duration: 3,
              delay: 0.5 + i * 0.4,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            style={{
              position: 'absolute',
              fontSize: '1.5rem',
              left: `${20 + i * 20}%`,
              bottom: '20%',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}