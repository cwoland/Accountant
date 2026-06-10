import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useTransactions from '../hooks/useTransactions';
import useCategories from '../hooks/useCategories';
import useStore from '../store/useStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Loader from '../components/ui/Loader';
import Badge from '../components/ui/Badge';
import TransactionForm from '../components/TransactionForm';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, getMonthRange } from '../utils/formatters';

export default function MandatoryPage() {
  const user = useStore((s) => s.user);
  const [modal, setModal] = useState(false);
  const range = getMonthRange(0);
  const { mandatoryCategories } = useCategories();
  const { transactions, create, isLoading } = useTransactions({ ...range, limit: 100 });

  const mandatoryTx = transactions.filter((t) => t.category?.isMandatory);

  const paidCatIds = new Set(mandatoryTx.map((t) => t.category?._id));
  const totalMandatory = mandatoryCategories.reduce((acc, c) => {
    const paid = mandatoryTx
      .filter((t) => t.category?._id === c._id)
      .reduce((s, t) => s + t.amount, 0);
    return acc + paid;
  }, 0);

  const handleAdd = (data) => create.mutate(data, { onSuccess: () => setModal(false) });

  const stats = {
    total: mandatoryCategories.length,
    paid: mandatoryCategories.filter((c) => paidCatIds.has(c._id)).length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Обязательные расходы</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', marginTop: 3 }}>
            Аренда, ЖКХ, кредиты и другие регулярные платежи
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModal(true)}>
          Добавить оплату
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          {
            label: 'Оплачено категорий',
            value: `${stats.paid} / ${stats.total}`,
            icon: <CheckCircle2 size={20} />,
            color: 'var(--green)', bg: 'var(--green-dim)',
          },
          {
            label: 'Ожидают оплаты',
            value: stats.total - stats.paid,
            icon: <Clock size={20} />,
            color: 'var(--amber)', bg: 'var(--amber-dim)',
          },
          {
            label: 'Потрачено в месяц',
            value: formatCurrency(totalMandatory, user?.currency),
            icon: <AlertCircle size={20} />,
            color: 'var(--red)', bg: 'var(--red-dim)',
          },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-m)',
                background: c.bg, color: c.color, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{c.icon}</div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: 4,
                  fontFamily: 'var(--font-display)', textTransform: 'uppercase',
                  letterSpacing: '0.05em', fontWeight: 600 }}>{c.label}</p>
                <p style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)',
                  fontWeight: 700, color: c.color }}>{c.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {isLoading ? <Loader text="Загружаем данные..." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {mandatoryCategories.length === 0 ? (
            <EmptyState
             icon="🏠"
             title="Нет обязательных категорий"
             description="Запустите сид-скрипт на сервере чтобы добавить системные категории: аренда, ЖКХ, кредиты и другие."
             />
          ) : mandatoryCategories.map((cat, i) => {
            const catTx = mandatoryTx.filter((t) => t.category?._id === cat._id);
            const paid = catTx.reduce((s, t) => s + t.amount, 0);
            const isPaid = catTx.length > 0;

            return (
              <motion.div key={cat._id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <Card style={{
                  border: isPaid
                    ? '1px solid rgba(34,211,165,0.25)'
                    : '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 'var(--radius-m)',
                        background: isPaid ? 'var(--green-dim)' : 'var(--surface-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.3rem',
                      }}>{cat.icon}</div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>
                          {catTx.length > 0
                            ? `${catTx.length} платёж${catTx.length > 1 ? 'а' : ''} в этом месяце`
                            : 'Не оплачено'}
                        </p>
                      </div>
                    </div>
                    <Badge color={isPaid ? 'green' : 'amber'} size="sm">
                      {isPaid ? '✓ Оплачено' : '⏳ Ждёт'}
                    </Badge>
                  </div>

                  {paid > 0 && (
                    <div style={{
                      background: 'var(--green-dim)', borderRadius: 'var(--radius-s)',
                      padding: '8px 12px', marginBottom: 12,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>Оплачено в этом месяце</span>
                      <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.9rem' }}>
                        {formatCurrency(paid, user?.currency)}
                      </span>
                    </div>
                  )}

                  {catTx.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {catTx.slice(0, 3).map((tx) => (
                        <div key={tx._id} style={{
                          display: 'flex', justifyContent: 'space-between',
                          padding: '6px 0', borderTop: '1px solid var(--border)',
                          fontSize: '0.8rem',
                        }}>
                          <span style={{ color: 'var(--text-3)' }}>
                            {new Date(tx.date).toLocaleDateString('ru-RU')}
                          </span>
                          <span style={{ color: 'var(--red)', fontWeight: 600 }}>
                            {formatCurrency(tx.amount, user?.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Добавить обязательный платёж">
        <TransactionForm
          initial={{ type: 'expense', amount: '', category: '', description: '',
            date: new Date().toISOString().slice(0, 10), isRecurring: true, recurringPeriod: 'monthly' }}
          onSubmit={handleAdd}
          loading={create.isPending}
        />
      </Modal>
    </div>
  );
}