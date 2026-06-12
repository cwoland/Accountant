import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/useStore';

export default function Header() {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const user = useStore((s) => s.user);
    const page = titles[pathname] || { label: 'Accountant', sub: ''};

    const titles = {
    '/':             { label: t('dashboard.title'),      sub: t('dashboard.subtitle') },
    '/transactions': { label: t('transactions.title'),   sub: t('common.loading') },
    '/mandatory':    { label: t('mandatory.title'),      sub: t('mandatory.subtitle') },
    '/products':     { label: t('products.title'),       sub: t('products.subtitle') },
    '/ai':           { label: t('ai.title'),             sub: t('ai.subtitle') },
    '/profile':      { label: t('profile.title'),        sub: t('profile.subtitle') },
    };

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? t('common.greeting.morning') : hour < 18 ? t('common.greeting.afternoon') : t('common.greeting.evening');

    return (
        <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
            gridColumn: 2,
            gridRow: 1,
            height: 'var(--header-h)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
        }}>
            <div>
                <h1 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {page.label}
                </h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 1 }}>
                    {page.sub}
                </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                    {greeting},{' '}
                    <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>
                        {user?.name?.split(' ')[0]}
                    </span>
                </p>
                <div style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-3)', cursor: 'pointer',
                    transition: 'var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <Bell size={16} />
                </div>
            </div>
        </motion.header>
    );
}