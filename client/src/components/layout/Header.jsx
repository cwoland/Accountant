import useOnlineStatus from '../../hooks/useOnlineStatus';
import { getQueueCount } from '../../utils/offlineQueue';
import { useState, useEffect } from 'react';
import { useState } from '../../store/useStore';
import { useQuery } from '@tanstack/react-query';
import { getAccountsApi } from '../../api/accounts';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, WifiOff } from 'lucide-react';
import useStore from '../../store/useStore';

export default function Header() {
    const isOnline = useOnlineStatus();
    const [queueCount, setQueueCount] = useState(0);

    useEffect(() => {
        const check = async () => {
            const count = await getQueueCount();
            setQueueCount(count);
        };
        check();
        const interval = setInterval(check, 5000);
        return () => clearInterval(interval);
    }, []);

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
    '/goals':        { label: 'Цели',            sub: 'Копилки и накопления' },
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'var(--amber-dim)', padding: '5px 12px',
              borderRadius: 99, border: '1px solid rgba(251,191,36,0.3)',
            }}
          >
            <WifiOff size={13} color="var(--amber)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--amber)', fontWeight: 600 }}>
              Офлайн {queueCount > 0 ? `· ${queueCount} в очереди` : ''}
            </span>
          </motion.div>
        )}

        {isOnline && queueCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'var(--green-dim)', padding: '5px 12px',
              borderRadius: 99, border: '1px solid rgba(34,211,165,0.3)',
            }}
          >
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: 'var(--green)',
              animation: 'pulse 1s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 600 }}>
              Синхронизация...
            </span>
          </motion.div>
        )}

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