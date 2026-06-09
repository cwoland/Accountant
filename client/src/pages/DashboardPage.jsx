import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Wallet, ArrowUpRight,
  ArrowDownRight, Sparkles,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { getStatsApi, getTransactionsApi } from '../api/transactions';
import { formatCurrency, getMonthRange } from '../utils/formatters';
import useStore from '../store/useStore';
import Loader from '../components/ui/Loader';
import Card from '../components/ui/Card';

const FADE = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border-2)',
      borderRadius: 'var(--radius-m)', padding: '10px 14px', fontSize: '0.8rem',
    }}>
      <p style={{ color: 'var(--text-2)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const user = useStore((s) => s.user);
  const [monthOffset] = useState(0);
  const range = getMonthRange(monthOffset);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', range],
    queryFn: () => getStatsApi(range).then((r) => r.data),
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['transactions-recent'],
    queryFn: () =>
      getTransactionsApi({ limit: 5, sortBy: 'date', order: 'desc' }).then((r) => r.data),
  });

  if (statsLoading) return <Loader text="Загружаем данные..." />;

  const { summary = {}, byCategory = [], monthly = [] } = stats || {};
  const { income = 0, expense = 0, balance = 0 } = summary;

  const monthlyMap = {};
  monthly.forEach(({ _id, total }) => {
    const key = `${_id.year}-${String(_id.month).padStart(2, '0')}`;
    if (!monthlyMap[key]) monthlyMap[key] = { name: key, income: 0, expense: 0 };
    monthlyMap[key][_id.type] = total;
  });
  const chartData = Object.values(monthlyMap).slice(-6);

  const expenseCats = byCategory
    .filter((c) => c.type === 'expense')
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const budgetUsed = user?.monthlyBudget
    ? Math.min((expense / user.monthlyBudget) * 100, 100)
    : null;

  const statCards = [
    {
      label: 'Баланс',
      value: balance,
      icon: <Wallet size={20} />,
      color: balance >= 0 ? 'var(--accent-2)' : 'var(--red)',
      bg: balance >= 0 ? 'var(--accent-dim)' : 'var(--red-dim)',
      glow: balance >= 0,
    },
    {
      label: 'Доходы',
      value: income,
      icon: <TrendingUp size={20} />,
      color: 'var(--green)',
      bg: 'var(--green-dim)',
      prefix: '+',
    },
    {
      label: 'Расходы',
      value: expense,
      icon: <TrendingDown size={20} />,
      color: 'var(--red)',
      bg: 'var(--red-dim)',
      prefix: '−',
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {statCards.map((c, i) => (
          <motion.div key={i} variants={FADE}>
            <Card glow={c.glow} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-2)', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-display)' }}>
                  {c.label}
                </span>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-s)',
                  background: c.bg, color: c.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {c.icon}
                </div>
              </div>
              <p style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)',
                fontWeight: 700, letterSpacing: '-0.03em', color: c.color }}>
                {c.prefix}{formatCurrency(c.value, user?.currency)}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {budgetUsed !== null && (
        <motion.div variants={FADE}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Бюджет месяца</p>
                <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: 2 }}>
                  {formatCurrency(expense, user?.currency)} из {formatCurrency(user?.monthlyBudget, user?.currency)}
                </p>
              </div>
              <span style={{
                fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700,
                color: budgetUsed > 90 ? 'var(--red)' : budgetUsed > 70 ? 'var(--amber)' : 'var(--green)',
              }}>
                {budgetUsed.toFixed(0)}%
              </span>
            </div>
            <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${budgetUsed}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  height: '100%', borderRadius: 99,
                  background: budgetUsed > 90 ? 'var(--red)'
                    : budgetUsed > 70 ? 'var(--amber)' : 'var(--green)',
                }}
              />
            </div>
          </Card>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <motion.div variants={FADE}>
          <Card style={{ padding: '24px 20px' }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>
              Динамика за 6 месяцев
            </p>
            {chartData.length === 0
              ? <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', textAlign: 'center', padding: '40px 0' }}>
                  Нет данных за выбранный период
                </p>
              : <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="income-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--green)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expense-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--red)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--red)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="income" name="Доходы"
                      stroke="var(--green)" fill="url(#income-grad)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="expense" name="Расходы"
                      stroke="var(--red)" fill="url(#expense-grad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
            }
          </Card>
        </motion.div>

        <motion.div variants={FADE}>
          <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>
              Расходы по категориям
            </p>
            {expenseCats.length === 0
              ? <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', textAlign: 'center', padding: '40px 0' }}>
                  Нет расходов
                </p>
              : <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={expenseCats} dataKey="total" nameKey="category"
                        cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                        {expenseCats.map((entry, i) => (
                          <Cell key={i} fill={entry.color || `hsl(${i * 60}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    {expenseCats.map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                          background: c.color || `hsl(${i * 60}, 70%, 60%)`,
                        }} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-2)', flex: 1,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.icon} {c.category}
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-1)' }}>
                          {formatCurrency(c.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
            }
          </Card>
        </motion.div>
      </div>

      <motion.div variants={FADE}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Последние транзакции</p>
            <a href="/transactions" style={{ fontSize: '0.8rem', color: 'var(--accent-2)',
              display: 'flex', alignItems: 'center', gap: 4 }}>
              Все <ArrowUpRight size={14} />
            </a>
          </div>
          {txLoading
            ? <Loader size={24} />
            : txData?.transactions?.length === 0
              ? <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
                  Транзакций пока нет. Добавьте первую!
                </p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {txData?.transactions?.map((tx) => (
                    <div key={tx._id} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '10px 12px', borderRadius: 'var(--radius-m)',
                      transition: 'var(--transition)',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: 38, height: 38, borderRadius: 'var(--radius-s)',
                        background: tx.type === 'income' ? 'var(--green-dim)' : 'var(--red-dim)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', flexShrink: 0,
                      }}>
                        {tx.category?.icon || (tx.type === 'income' ? '💰' : '💸')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.description || tx.category?.name || '—'}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>
                          {tx.category?.name} · {new Date(tx.date).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <p style={{
                        fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
                        color: tx.type === 'income' ? 'var(--green)' : 'var(--red)',
                        display: 'flex', alignItems: 'center', gap: 3,
                      }}>
                        {tx.type === 'income'
                          ? <ArrowUpRight size={14} />
                          : <ArrowDownRight size={14} />}
                        {formatCurrency(tx.amount, user?.currency)}
                      </p>
                    </div>
                  ))}
                </div>
          }
        </Card>
      </motion.div>

      <motion.div variants={FADE}>
        <a href="/ai" style={{ textDecoration: 'none', display: 'block' }}>
          <Card hover style={{
            background: 'linear-gradient(135deg, var(--accent-dim), var(--surface))',
            border: '1px solid rgba(124,106,247,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-m)',
                background: 'var(--accent)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
              }}>
                <Sparkles size={22} color="#fff" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                  Спроси ИИ-советника
                </p>
                <p style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>
                  Анализ расходов, советы по бюджету и автоматическая категоризация
                </p>
              </div>
              <ArrowUpRight size={20} color="var(--accent-2)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </div>
          </Card>
        </a>
      </motion.div>
    </motion.div>
  );
}