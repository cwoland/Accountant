import { motion } from 'framer-motion';

export default function Card({ children, style, onClick, hover = false, glow = false }) {
    return (
        <motion.div
        onClick={onClick}
        whileHover={hover ? { y: -3, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' } : {}}
        style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-1)',
            padding: 24,
            boxShadow: glow ? 'var(--shadow-glow)' : 'var(--shadow-s)',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'var(--transition)',
            ...style,
        }}
        >
            {children}
        </motion.div>
    );
}