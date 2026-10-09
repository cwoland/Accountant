import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ArrowDownLeft, ArrowUpRight, CreditCard, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDebtsApi, createDebtApi, addPaymentApi, deleteDebtApi } from '../api/debts';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';
import Badge from '../components/ui/Badge';
import ConfirmModal from '../components/ui/ConfirmModal';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/formatters';

const FADE = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const emptyDebt = {
  name: '', totalAmount: '', creditor: '',
  note: '', isOwed: true, dueDate: '',
};
const emptyPayment = { amount: '', note: '' };

export default function DebtsPage() {
  const user = useStore((s) => s.user);
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // 'add' | 'payment'
  const [debtForm, setDebtForm] = useState(emptyDebt);
  const [paymentForm, setPaymentForm] = useState(emptyPayment);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: debts = [], isLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: () => getDebtsApi().then((r) => r.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['debts'] });

  const create = useMutation({
    mutationFn: createDebtApi,
    onSuccess: () => { toast.success('Долг добавлен'); invalidate(); setModal(null); setDebtForm(emptyDebt); },
    onError: (e) => toast.error(e.response?.data?.message || 'Ошибка'),
  });

  const addPayment = useMutation({
    mutationFn: ({ id, data }) => addPaymentApi(id, data),
    onSuccess: () => { toast.success('Платёж записан'); invalidate(); setModal(null); setPaymentForm(emptyPayment); },
    onError: (e) => toast.error(e.response?.data?.message || 'Ошибка'),
  });

  const remove = useMutation({
    mutationFn: deleteDebtApi,
    onSuccess: () => { toast.success('Долг удалён'); invalidate(); setDeleteTarget(null); },
  });

  const totalOwed = debts.filter(d => d.isOwed).reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0);
  const totalLent = debts.filter(d => !d.isOwed).reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0);

  const setD = (f) => (e) => setDebtForm(p => ({ ...p, [f]: e.target ? e.target.value : e }));
  const setP = (f) => (e) => setPaymentForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Долги</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', marginTop: 3 }}>
            Контроль долгов и займов
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModal('add')}>
          Добавить
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {[
          {
            label: 'Я должен',
            value: formatCurrency(totalOwed, user?.currency),
            icon: <TrendingDown size={20} />,
            color: 'var(--red)', bg: 'var(--red-dim)',
          },
          {
            label: 'Мне должны',
            value: formatCurrency(totalLent, user?.currency),
            icon: <ArrowUpRight size={20} />,
            color: 'var(--green)', bg: 'var(--green-dim)',
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

      {isLoading ? <Loader text="Загружаем долги..." /> : (
        debts.length === 0
          ? <EmptyState
              icon={<CreditCard size={32} color="var(--text-3)" />}
              title="Нет долгов"
              description="Добавьте долг — свой или чужой — и отслеживайте выплаты."
              action={() => setModal('add')}
              actionLabel="Добавить долг"
            />
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <AnimatePresence>
                {debts.map((debt, i) => {
                  const remaining = debt.totalAmount - debt.paidAmount;
                  const progress = debt.totalAmount > 0
                    ? Math.min((debt.paidAmount / debt.totalAmount) * 100, 100)
                    : 0;
                  const isDone = remaining <= 0;

                  return (
                    <motion.div key={debt._id}
                      variants={FADE} initial="hidden" animate="show"
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ delay: i * 0.04 }}>
                      <Card style={{
                        border: isDone
                          ? '1px solid rgba(34,211,165,0.25)'
                          : '1px solid var(--border)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: 44, height: 44, borderRadius: 'var(--radius-m)',
                              background: debt.isOwed ? 'var(--red-dim)' : 'var(--green-dim)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              {debt.isOwed
                                ? <ArrowDownLeft size={20} color="var(--red)" />
                                : <ArrowUpRight size={20} color="var(--green)" />
                              }
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem',
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {debt.name}
                                </p>
                                <Badge color={isDone ? 'green' : debt.isOwed ? 'red' : 'accent'} size="sm">
                                  {isDone ? '✓ Закрыт' : debt.isOwed ? 'Я должен' : 'Мне должны'}
                                </Badge>
                              </div>
                              {debt.creditor && (
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                                  {debt.isOwed ? 'Кому: ' : 'Кто: '}{debt.creditor}
                                </p>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                            {!isDone && (
                              <button
                                onClick={() => { setSelectedDebt(debt); setModal('payment'); }}
                                style={{
                                  padding: '5px 10px', borderRadius: 'var(--radius-s)',
                                  background: 'var(--accent-dim)', color: 'var(--accent-2)',
                                  fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                                  border: '1px solid rgba(124,106,247,0.3)',
                                  fontFamily: 'var(--font-display)',
                                }}>
                                + Платёж
                              </button>
                            )}
                            <button onClick={() => setDeleteTarget(debt._id)}
                              style={{
                                width: 30, height: 30, borderRadius: 'var(--radius-s)',
                                background: 'var(--surface-2)', color: 'var(--text-3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', border: 'none',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: 2 }}>Осталось</p>
                            <p style={{ fontWeight: 700, fontSize: '1.1rem',
                              color: isDone ? 'var(--green)' : debt.isOwed ? 'var(--red)' : 'var(--accent-2)',
                              fontFamily: 'var(--font-display)' }}>
                              {formatCurrency(remaining, debt.currency)}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: 2 }}>Оплачено</p>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--green)' }}>
                              {formatCurrency(debt.paidAmount, debt.currency)}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: 2 }}>Всего</p>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-2)' }}>
                              {formatCurrency(debt.totalAmount, debt.currency)}
                            </p>
                          </div>
                        </div>

                        <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{
                              height: '100%', borderRadius: 99,
                              background: isDone ? 'var(--green)' : debt.isOwed ? 'var(--red)' : 'var(--accent)',
                            }}
                          />
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', textAlign: 'right' }}>
                          {progress.toFixed(0)}% выплачено
                        </p>

                        {debt.payments?.length > 0 && (
                          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600,
                              textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Последние платежи
                            </p>
                            {debt.payments.slice(-3).reverse().map((p, pi) => (
                              <div key={pi} style={{
                                display: 'flex', justifyContent: 'space-between',
                                padding: '5px 0', borderTop: '1px solid var(--border)',
                                fontSize: '0.78rem',
                              }}>
                                <span style={{ color: 'var(--text-3)' }}>
                                  {new Date(p.date).toLocaleDateString('ru-RU')}
                                  {p.note && ` · ${p.note}`}
                                </span>
                                <span style={{ color: 'var(--green)', fontWeight: 600 }}>
                                  {formatCurrency(p.amount, debt.currency)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
      )}

      <Modal open={modal === 'add'} onClose={() => { setModal(null); setDebtForm(emptyDebt); }} title="Добавить долг">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { val: true, label: '↓ Я должен', color: 'var(--red)', dim: 'var(--red-dim)' },
              { val: false, label: '↑ Мне должны', color: 'var(--green)', dim: 'var(--green-dim)' },
            ].map((t) => (
              <button key={String(t.val)} type="button"
                onClick={() => setDebtForm(f => ({ ...f, isOwed: t.val }))}
                style={{
                  padding: '10px', borderRadius: 'var(--radius-m)', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem',
                  background: debtForm.isOwed === t.val ? t.dim : 'var(--surface)',
                  color: debtForm.isOwed === t.val ? t.color : 'var(--text-2)',
                  border: `1px solid ${debtForm.isOwed === t.val ? t.color : 'var(--border)'}`,
                  transition: 'var(--transition)',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          <Input label="Название" placeholder="Например: долг за ремонт"
            value={debtForm.name} onChange={setD('name')} required />
          <Input label="Сумма" type="number" placeholder="0.00"
            value={debtForm.totalAmount} onChange={setD('totalAmount')} required />
          <Input label={debtForm.isOwed ? 'Кому должен' : 'Кто должен'}
            placeholder="Имя или описание"
            value={debtForm.creditor} onChange={setD('creditor')} />
          <Input label="Срок (необязательно)" type="date"
            value={debtForm.dueDate} onChange={setD('dueDate')} />
          <Input label="Заметка" placeholder="Дополнительная информация"
            value={debtForm.note} onChange={setD('note')} />

          <Button fullWidth loading={create.isPending}
            onClick={() => create.mutate({
              ...debtForm,
              totalAmount: parseFloat(debtForm.totalAmount),
            })}>
            Добавить долг
          </Button>
        </div>
      </Modal>

      <Modal open={modal === 'payment'} onClose={() => { setModal(null); setPaymentForm(emptyPayment); }}
        title={`Платёж · ${selectedDebt?.name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedDebt && (
            <div style={{
              background: 'var(--surface-2)', borderRadius: 'var(--radius-m)',
              padding: '12px 14px',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>Осталось выплатить</span>
              <span style={{ fontWeight: 700, color: 'var(--red)' }}>
                {formatCurrency(selectedDebt.totalAmount - selectedDebt.paidAmount, selectedDebt.currency)}
              </span>
            </div>
          )}
          <Input label="Сумма платежа" type="number" placeholder="0.00"
            value={paymentForm.amount} onChange={setP('amount')} required />
          <Input label="Заметка" placeholder="Необязательно"
            value={paymentForm.note} onChange={setP('note')} />

          <Button fullWidth loading={addPayment.isPending}
            style={{ background: 'var(--green)', boxShadow: '0 0 20px rgba(34,211,165,0.3)' }}
            onClick={() => addPayment.mutate({
              id: selectedDebt._id,
              data: { amount: parseFloat(paymentForm.amount), note: paymentForm.note },
            })}>
            Записать платёж
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onConfirm={() => remove.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        title="Удалить долг?"
        message="Долг и все платежи по нему будут удалены безвозвратно."
      />
    </div>
  );
}