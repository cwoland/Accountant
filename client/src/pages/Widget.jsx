import { useEffect, useState } from 'react';
import { getStatsApi } from '../api/transactions';
import { getMonthRange } from '../utils/formatters';
import useStore from '../store/useStore';

export default function Widget() {
  const user = useStore((s) => s.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const range = getMonthRange(0);
    getStatsApi(range)
      .then((r) => setStats(r.data?.summary))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n || 0);

  const symbol = { RUB: '₽', USD: '$', EUR: '€' }[user?.currency] || '₽';
  const balance = (stats?.income || 0) - (stats?.expense || 0);
  const month = new Date().toLocaleDateString('ru-RU', { month: 'long' });

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {loading ? (
        <div style={{ color: '#666', fontSize: '0.85rem' }}>Загрузка...</div>
      ) : (
        <div style={{ width: '100%', maxWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: '#7c6af7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '1rem' }}>₳</span>
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Accountant</p>
              <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'capitalize' }}>{month}</p>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <p style={{ color: '#555', fontSize: '0.72rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Баланс
            </p>
            <p style={{
              fontSize: '2.8rem', fontWeight: 800,
              letterSpacing: '-0.04em',
              color: balance >= 0 ? '#a78bfa' : '#f87171',
              lineHeight: 1,
            }}>
              {balance >= 0 ? '+' : '−'}{fmt(Math.abs(balance))}
              <span style={{ fontSize: '1.2rem', fontWeight: 500, marginLeft: 4 }}>{symbol}</span>
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
          }}>
            {[
              { label: 'Доходы', value: stats?.income, color: '#34d399', prefix: '+' },
              { label: 'Расходы', value: stats?.expense, color: '#f87171', prefix: '−' },
            ].map((item) => (
              <div key={item.label} style={{
                background: '#111116',
                borderRadius: 16,
                padding: '14px 16px',
                border: '1px solid #1e1e2a',
              }}>
                <p style={{ color: '#555', fontSize: '0.68rem', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  {item.label}
                </p>
                <p style={{ color: item.color, fontWeight: 700, fontSize: '1.15rem',
                  letterSpacing: '-0.02em' }}>
                  {item.prefix}{fmt(item.value)}{' '}
                  <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>{symbol}</span>
                </p>
              </div>
            ))}
          </div>

          <p style={{ color: '#333', fontSize: '0.68rem', textAlign: 'center', marginTop: 28 }}>
            {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}
    </div>
  );
}