import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, width = 480 }) {
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onclose(); };
        if (open) document.addEventListener('keydown', handler);
        return () => document.addEventListener('keydown', handler);
    }, [open, onClose]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <>
                <motion.div
                initial={{opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                }} />
                <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{
                    position: 'fixed', top: '50%', left: '50%', zIndex: 201,
                    transform: 'translate(-50%, -50%)',
                    width: '100%', maxWidth: width,
                    background: '1px solid var(--border-2)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '28px 28px 24px',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
                    maxHeight: '90vh', overflowY: 'auto',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h3>
                        <button onClick={onClose} style={{
                            width: 32, height: 32, borderRadius: 'var(--radius-s)',
                            background: 'var(--surface)', color: 'var(--text-2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'var(--transition)',
                        }}
                        onMouseEnter={e => {e.currentTarget.style.background = 'var(--red-dim)'; e.currentTarget.style.color = 'var(--red)';}}
                        onMouseLeave={e => {e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-2)';}}>
                            <X size={16} />
                        </button>
                    </div>
                    {children}
                </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}