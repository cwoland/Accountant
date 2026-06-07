import { motion } from 'framer-motion';

const variants = {
    primary: {
        background: 'var(--accent)',
        color: '#fff',
    },
    secondary: {
        background: 'var(--surface-2)',
        color: 'var(--text-1)',
    },
    ghost: {
        background: 'transparent',
        color: 'var(--text-2)',
    },
    danger: {
        background: 'var(--red-dim)',
        color: 'var(--red)',
    },
};

export default function Button({
    children, variant = 'primary', size = 'md',
    loading = false, fullWidth = false,
    onClick, type = 'button', disabled, style, icon,
}) {
    const sz = { sm: '0.75rem', md: '0.875rem', lg: '1rem' };
    const pad = { sm: '8px 14px', md: '11px 20px', lg: '14px 28px' };

    return (
        <motion.button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        style={{
            ...variants[variant],
            fontSize: sz[size],
            padding: pad[size],
            borderRadius: 'var(--radius-m)',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            letterSpacing: '0.01em',
            width: fullWidth ? '100%' : 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'var(--transition)',
            opacity: disabled || loading ? 0.5 : 1,
            border: variant === 'secondary' ? '1px solid var(--border-2)' : 'none',
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            boxShadow: variant === 'primary' ? '0 0 20px var(--accent-glow)' : 'none',
            ...style,
        }}
        >
            {loading ? (
                <span style={{
                    width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.7s linear infinite',
                }} />
            ) : icon}
            {children}
        </motion.button>
    );
}