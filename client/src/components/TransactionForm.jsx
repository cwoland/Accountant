import { useState, useEffect } from 'react';
import { Sparkles, WifiOff } from 'lucide-react';
import { categorizeTransactionApi } from '../api/ai';
import useCategories from '../hooks/useCategories';
import { addToQueue, getQueueCount } from '../utils/offlineQueue';
import useOnlineStatus from '../hooks/useOnlineStatus';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import toast from 'react-hot-toast';

const empty = {
  type: 'expense', amount: '', category: '',
  description: '', date: new Date().toISOString().slice(0, 10),
  isRecurring: false, recurringPeriod: '',
};

export default function TransactionForm({ initial, onSubmit, loading }) {
  const isOnline = useOnlineStatus();
  const [form, setForm] = useState(initial || empty);
  const [aiLoading, setAiLoading] = useState(false);
  const { incomeCategories, expenseCategories } = useCategories();

  useEffect(() => { setForm(initial || empty); }, [initial]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target ? e.target.value : e }));

  const cats = form.type === 'income' ? incomeCategories : expenseCategories;

  const handleAI = async () => {
    if (!form.description) return toast.error('Введите описание для ИИ-категоризации');
    setAiLoading(true);
    try {
      const { data } = await categorizeTransactionApi({
        description: form.description,
        categories: cats,
      });
      const matched = cats.find((c) => c.name === data.category);
      if (matched) {
        setForm((f) => ({ ...f, category: matched._id }));
        toast.success(`Категория: ${matched.name}`);
      } else {
        toast('Категория не определена, выберите вручную', { icon: '🤖' });
      }
    } catch {
      toast.error('Ошибка ИИ-категоризации');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    if (!form.amount || !form.category)
      return toast.error('Заполните сумму и категорию');

    const data = {
      ...form,
      amount: parseFloat(form.amount),
      recurringPeriod: form.isRecurring ? form.recurringPeriod || 'monthly' : null,
    };

    if (!isOnline) {
      await addToQueue(data);
      const count = await getQueueCount();
      toast('Сохранено', {
        icon: '📶',
        duration: 4000,
      });
      onSubmit(null, { offline: true });
      return;
    }

    onSubmit(data);
};

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!isOnline && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 'var(--radius-m)',
          background: 'var(--amber-dim)',
          border: '1px solid rgba(251,191,36,0.3)',
        }}>
          <WifiOff size={16} color="var(--amber)" />
          <p style={{ fontSize: '0.82rem', color: 'var(--amber)', fontWeight: 500 }}>
            Офлайн-режим
          </p>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {['expense', 'income'].map((t) => (
          <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t, category: '' }))}
            style={{
              padding: '10px', borderRadius: 'var(--radius-m)', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem',
              transition: 'var(--transition)',
              background: form.type === t
                ? t === 'income' ? 'var(--green-dim)' : 'var(--red-dim)'
                : 'var(--surface)',
              color: form.type === t
                ? t === 'income' ? 'var(--green)' : 'var(--red)'
                : 'var(--text-2)',
              border: `1px solid ${form.type === t
                ? t === 'income' ? 'var(--green)' : 'var(--red)'
                : 'var(--border)'}`,
            }}>
            {t === 'income' ? '↑ Доход' : '↓ Расход'}
          </button>
        ))}
      </div>

      <Input label="Сумма" type="number" placeholder="0.00"
        value={form.amount} onChange={set('amount')} required />

      <div>
        <div style={{ position: 'relative' }}>
          <Input label="Описание" placeholder="Например: продукты в Пятёрочке"
            value={form.description} onChange={set('description')} />
          <button type="button" onClick={handleAI} disabled={aiLoading}
            style={{
              position: 'absolute', right: 10, bottom: 10,
              padding: '4px 10px', borderRadius: 'var(--radius-s)',
              background: 'var(--accent-dim)', color: 'var(--accent-2)',
              fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              border: '1px solid rgba(124,106,247,0.3)',
              fontFamily: 'var(--font-display)',
              opacity: aiLoading ? 0.6 : 1,
            }}>
            <Sparkles size={11} />
            {aiLoading ? '...' : 'AI'}
          </button>
        </div>
      </div>

      <Select label="Категория" value={form.category} onChange={set('category')}
        options={[
          { value: '', label: '— Выберите категорию —' },
          ...cats.map((c) => ({ value: c._id, label: `${c.icon} ${c.name}` })),
        ]}
      />

      <Input label="Дата" type="date" value={form.date} onChange={set('date')} />

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <input type="checkbox" checked={form.isRecurring}
          onChange={(e) => setForm((f) => ({ ...f, isRecurring: e.target.checked }))}
          style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>
          Регулярный платёж
        </span>
      </label>

      {form.isRecurring && (
        <Select label="Период" value={form.recurringPeriod} onChange={set('recurringPeriod')}
          options={[
            { value: 'daily',   label: 'Ежедневно' },
            { value: 'weekly',  label: 'Еженедельно' },
            { value: 'monthly', label: 'Ежемесячно' },
            { value: 'yearly',  label: 'Ежегодно' },
          ]}
        />
      )}

      <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: 4 }}>
        {initial ? 'Сохранить изменения' : 'Добавить транзакцию'}
      </Button>
    </form>
  );
}