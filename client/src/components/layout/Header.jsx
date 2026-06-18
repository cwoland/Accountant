import { useState } from '../../store/useStore';
import { useQuery } from '@tanstack/react-query';
import { getAccountsApi } from '../../api/accounts';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import useStore from '../../store/useStore';

export default function Header() {
    const { pathname } = useLocation();
    const user = useStore((s) => s.user);
    const { activeAccountId } = useStore();
    const { data: accounts = [] } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => getAccountsApi().then((r) => r.data),
        enabled: !!activeAccountId,
    });
    const activeAccount = accounts.find((a) => a._id === activeAccountId);

    const titles = {
    '/':             { label: 'Обзор',           sub: 'Сводка по финансам' },
    '/accounts':     { label: 'Счета',           sub: 'Личный и совместные' },
    '/transactions': { label: 'Транзакции',      sub: 'История операций' },
    '/mandatory':    { label: 'Обязательные',    sub: 'Регулярные расходы' },
    '/products':     { label: 'Товары и услуги', sub: 'Покупки и сервисы' },
    '/debts':        { label: 'Долги',           sub: 'Контроль долгов и займов' },
    '/ai':           { label: 'ИИ-советник',     sub: 'Анализ и рекомендации' },
    '/profile':      { label: 'Профиль',         sub: 'Настройки аккаунта' },
    };

    const page = titles[pathname] || { label: 'Accountant', sub: ''};
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Доброе утро'
    : hour < 18 ? 'Добрый день'
    : 'Добрый вечер';
    
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

            {activeAccount && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 12px',
                    borderRadius: 99,
                    background: `${activeAccount.color}20`,
                    border: `1px solid ${activeAccount.color}50`,
                }}>
                    <span style={{ fontSize: '0.9rem' }}>{activeAccount.icon}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: activeAccount.color }}>{activeAccount.name}</span>
                </div>
            )}

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