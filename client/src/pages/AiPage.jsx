import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, TrendingUp, Lightbulb, Tag, Bot, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { analyzeExpensesApi, getBudgetAdviceApi, categorizeTransactionApi } from '../api/ai';
import { getStatsApi } from '../api/transactions';
import useStore from '../store/useStore';
import useCategories from '../hooks/useCategories';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { formatCurrency, getMonthRange } from '../utils/formatters';
import toast from 'react-hot-toast';

const QUICK = [
  { id: 'analyze', icon: <TrendingUp size={16} />, label: 'Анализ расходов',    desc: 'Разбор трат за месяц' },
  { id: 'advice',  icon: <Lightbulb size={16} />,  label: 'Советы по бюджету', desc: 'Как оптимизировать' },
  { id: 'cat',     icon: <Tag size={16} />,         label: 'Категоризация',     desc: 'Определи категорию' },
];

const Bubble = ({ msg }) => {
  const isAi = msg.role === 'ai';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      style={{
        display: 'flex', gap: 12, justifyContent: isAi ? 'flex-start' : 'flex-end',
        alignItems: 'flex-end',
      }}
    >
      {isAi && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)',
        }}>
          <Bot size={16} color="#fff" />
        </div>
      )}
      <div style={{
        maxWidth: '75%',
        background: isAi ? 'var(--surface)' : 'var(--accent)',
        border: isAi ? '1px solid var(--border)' : 'none',
        borderRadius: isAi ? '4px 16px 16px 16px' : '16px 16px 4px 16px',
        padding: '12px 16px',
        fontSize: '0.875rem', lineHeight: 1.65,
        color: isAi ? 'var(--text-1)' : '#fff',
        boxShadow: isAi ? 'var(--shadow-s)' : '0 0 20px var(--accent-glow)',
        whiteSpace: 'pre-wrap',
      }}>
        {msg.loading
          ? <span style={{ display: 'flex', gap: 4, alignItems: 'center', color: 'var(--text-3)' }}>
              {[0,1,2].map(i => (
                <motion.span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', display: 'inline-block' }}
                  animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
              ))}
            </span>
          : msg.text
        }
      </div>
      {!isAi && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User size={16} color="var(--text-2)" />
        </div>
      )}
    </motion.div>
  );
};

export default function AiPage() {
  const user = useStore((s) => s.user);
  const { categories } = useCategories();
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Привет, ${user?.name?.split(' ')[0] || 'друг'}! 👋\n\nЯ ИИ-советник по финансам. Могу проанализировать твои расходы, дать советы по бюджету или определить категорию транзакции.\n\nВыбери быстрое действие ниже или напиши свой вопрос.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeQuick, setActiveQuick] = useState(null);
  const [catInput, setCatInput] = useState('');
  const bottomRef = useRef(null);
  const range = getMonthRange(0);

  const { data: stats } = useQuery({
    queryKey: ['stats', range],
    queryFn: () => getStatsApi(range).then((r) => r.data),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pushMsg = (role, text, loading = false) => {
    const msg = { role, text, loading, id: Date.now() + Math.random() };
    setMessages((m) => [...m, msg]);
    return msg.id;
  };

  const updateMsg = (id, text) => {
    setMessages((m) => m.map((msg) => msg.id === id ? { ...msg, text, loading: false } : msg));
  };

  const handleQuick = async (id) => {
    setActiveQuick(id);
    if (id === 'cat') return;

    if (id === 'analyze') {
      if (!stats?.summary?.expense) {
        pushMsg('ai', 'Нет данных о расходах за этот месяц. Сначала добавь несколько транзакций!');
        return;
      }
      pushMsg('user', 'Проанализируй мои расходы за этот месяц');
      setLoading(true);
      const loadId = pushMsg('ai', '', true);
      try {
        const { data } = await analyzeExpensesApi({
          stats: stats.summary,
          byCategory: stats.byCategory,
          currency: user?.currency,
        });
        updateMsg(loadId, data.text);
      } catch {
        updateMsg(loadId, 'Ошибка обращения к ИИ. Попробуй позже.');
      } finally {
        setLoading(false);
      }
    }

    if (id === 'advice') {
      pushMsg('user', 'Дай советы по оптимизации бюджета');
      setLoading(true);
      const loadId = pushMsg('ai', '', true);
      try {
        const { data } = await getBudgetAdviceApi({
          income: stats?.summary?.income || 0,
          expense: stats?.summary?.expense || 0,
          monthlyBudget: user?.monthlyBudget || 0,
          currency: user?.currency,
        });
        updateMsg(loadId, data.text);
      } catch {
        updateMsg(loadId, 'Ошибка обращения к ИИ. Попробуй позже.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCategorize = async () => {
    if (!catInput.trim()) return toast.error('Введите описание');
    pushMsg('user', `Определи категорию: "${catInput}"`);
    setLoading(true);
    const loadId = pushMsg('ai', '', true);
    try {
      const { data } = await categorizeTransactionApi({ description: catInput, categories });
      updateMsg(loadId, `Предлагаемая категория: **${data.category}**\n\nЕсли не подходит — выбери вручную при добавлении транзакции.`);
    } catch {
      updateMsg(loadId, 'Ошибка категоризации. Попробуй позже.');
    } finally {
      setLoading(false);
      setCatInput('');
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    pushMsg('user', text);
    setLoading(true);
    const loadId = pushMsg('ai', '', true);
    try {
      const { data } = await getBudgetAdviceApi({
        income: stats?.summary?.income || 0,
        expense: stats?.summary?.expense || 0,
        monthlyBudget: user?.monthlyBudget || 0,
        currency: user?.currency,
        customQuestion: text,
      });
      updateMsg(loadId, data.text);
    } catch {
      updateMsg(loadId, 'Не удалось получить ответ. Проверь подключение.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: 'calc(100vh - var(--header-h) - 64px)' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--radius-m)',
          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)',
        }}>
          <Sparkles size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>ИИ-советник</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', marginTop: 2 }}>
            Powered by Mistral 7B · OpenRouter
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--green-dim)', padding: '6px 14px', borderRadius: 99 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)',
            animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600 }}>Online</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, flexShrink: 0 }}>
        {QUICK.map((q) => (
          <motion.button key={q.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={() => handleQuick(q.id)} disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 'var(--radius-m)', cursor: 'pointer',
              background: activeQuick === q.id ? 'var(--accent-dim)' : 'var(--surface)',
              border: `1px solid ${activeQuick === q.id ? 'rgba(124,106,247,0.35)' : 'var(--border)'}`,
              color: activeQuick === q.id ? 'var(--accent-2)' : 'var(--text-2)',
              textAlign: 'left', transition: 'var(--transition)',
              opacity: loading ? 0.6 : 1,
            }}>
            <div style={{
              width: 34, height: 34, borderRadius: 'var(--radius-s)', flexShrink: 0,
              background: activeQuick === q.id ? 'var(--accent)' : 'var(--surface-2)',
              color: activeQuick === q.id ? '#fff' : 'var(--text-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'var(--transition)',
            }}>
              {q.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.82rem', fontWeight: 600,
                color: activeQuick === q.id ? 'var(--accent-2)' : 'var(--text-1)' }}>
                {q.label}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 1 }}>{q.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activeQuick === 'cat' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} style={{ flexShrink: 0 }}>
            <Card style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginBottom: 12, fontWeight: 600 }}>
                Введите описание транзакции — ИИ определит категорию
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  placeholder="Например: Оплата Яндекс Плюс"
                  value={catInput}
                  onChange={(e) => setCatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCategorize()}
                  style={{
                    flex: 1, background: 'var(--surface-2)',
                    border: '1px solid var(--border-2)', borderRadius: 'var(--radius-m)',
                    padding: '10px 14px', color: 'var(--text-1)', fontSize: '0.875rem',
                  }}
                />
                <Button onClick={handleCategorize} loading={loading} icon={<Sparkles size={15} />}>
                  Определить
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: 0, overflow: 'hidden', minHeight: 0,
      }}>
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <AnimatePresence>
            {messages.map((msg) => <Bubble key={msg.id || msg.text} msg={msg} />)}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {stats?.summary && (
          <div style={{
            padding: '10px 20px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: 20, background: 'var(--bg-2)',
          }}>
            {[
              { label: 'Доходы', value: formatCurrency(stats.summary.income, user?.currency), color: 'var(--green)' },
              { label: 'Расходы', value: formatCurrency(stats.summary.expense, user?.currency), color: 'var(--red)' },
              { label: 'Баланс', value: formatCurrency(stats.summary.balance, user?.currency), color: 'var(--accent-2)' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{s.label}:</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{
          padding: '14px 16px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 10, alignItems: 'flex-end',
        }}>
          <textarea
            placeholder="Задай вопрос по финансам..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            rows={1}
            style={{
              flex: 1, background: 'var(--surface-2)',
              border: '1px solid var(--border-2)', borderRadius: 'var(--radius-m)',
              padding: '10px 14px', color: 'var(--text-1)', fontSize: '0.875rem',
              resize: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleSend} disabled={!input.trim() || loading}
            style={{
              width: 42, height: 42, borderRadius: 'var(--radius-m)',
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--surface-2)',
              color: input.trim() && !loading ? '#fff' : 'var(--text-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              boxShadow: input.trim() && !loading ? 'var(--shadow-glow)' : 'none',
              transition: 'var(--transition)', flexShrink: 0,
            }}>
            <Send size={17} />
          </motion.button>
        </div>
      </Card>
    </div>
  );
}