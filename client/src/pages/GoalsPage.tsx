import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Trash2, Target, Plane, Home, Car,
  Smartphone, GraduationCap, Heart, Star, Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import ConfirmModal from '../components/ui/ConfirmModal';
import { formatCurrency, formatDate } from '../utils/formatters';

const getGoalsApi     = ()             => api.get('/goals');
const createGoalApi   = (data)         => api.post('/goals', data);
const contributeApi   = ({ id, data }) => api.post(`/goals/${id}/contribute`, data);
const deleteGoalApi   = (id)           => api.delete(`/goals/${id}`);

const ICONS = [
  { id: 'target',       icon: <Target size={20} />,       label: 'Цель' },
  { id: 'plane',        icon: <Plane size={20} />,        label: 'Путешествие' },
  { id: 'home',         icon: <Home size={20} />,         label: 'Жильё' },
  { id: 'car',          icon: <Car size={20} />,          label: 'Авто' },
  { id: 'smartphone',   icon: <Smartphone size={20} />,   label: 'Техника' },
  { id: 'graduation',   icon: <GraduationCap size={20} />, label: 'Образование' },
  { id: 'heart',        icon: <Heart size={20} />,        label: 'Здоровье' },
  { id: 'star',         icon: <Star size={20} />,         label: 'Другое' },
];

const COLORS = [
  '#7c6af7', '#22d3a5', '#f87272', '#fbbf24',
  '#3b82f6', '#ec4899', '#10b981', '#f97316',
];

const getIcon = (id, size = 22) => {
  const map = {
    target: <Target size={size} />, plane: <Plane size={size} />,
    home: <Home size={size} />, car: <Car size={size} />,
    smartphone: <Smartphone size={size} />, graduation: <GraduationCap size={size} />,
    heart: <Heart size={size} />, star: <Star size={size} />,
  };
  return map[id] || <Target size={size} />;
};

const emptyForm = { name: '', targetAmount: '', deadline: '', note: '', icon: 'target', color: '#7c6af7' };

export default function GoalsPage() {
  const user = useStore((s) => s.user);
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [contribModal, setContribModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [contribAmount, setContribAmount] = useState('');
  const [contribNote, setContribNote] = useState('');

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => getGoalsApi().then((r) => r.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['goals'] });

  const create = useMutation({
    mutationFn: createGoalApi,
    onSuccess: () => { toast.success('Цель создана!'); invalidate(); setModal(null); setForm(emptyForm); },
    onError: (e) => toast.error(e.response?.data?.message || 'Ошибка'),
  });

  const contribute = useMutation({
    mutationFn: contributeApi,
    onSuccess: (res) => {
      if (res.data.completed) toast.success('🎉 Цель достигнута!');
      else toast.success('Пополнение записано');
      invalidate();
      setContribModal(null);
      setContribAmount('');
      setContribNote('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Ошибка'),
  });

  const remove = useMutation({
    mutationFn: deleteGoalApi,
    onSuccess: () => { toast.success('Цель удалена'); invalidate(); setDeleteTarget(null); },
  });

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved  = goals.reduce((s, g) => s + g.currentAmount, 0);
  const completed   = goals.filter((g) => g.completed).length;

  const pct = (g) => Math.min((g.currentAmount / g.targetAmount) * 100, 100);

  const daysLeft = (g) => {
    if (!g.deadline) return null;
    const diff = new Date(g.deadline) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const monthlyNeeded = (g) => {
    const days = daysLeft(g);
    if (!days || days <= 0) return null;
    const months = days / 30;
    const left = g.targetAmount - g.currentAmount;
    return left > 0 ? left / months : 0;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Финансовые цели</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', marginTop: 3 }}>
            Копилки и накопления
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModal('add')}>
          Новая цель
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Всего целей', value: goals.length, color: 'var(--accent-2)', bg: 'var(--accent-dim)', icon: <Target size={20} /> },
          { label: 'Накоплено', value: formatCurrency(totalSaved, user?.currency), color: 'var(--green)', bg: 'var(--green-dim)', icon: <Star size={20} /> },
          { label: 'Достигнуто', value: completed, color: 'var(--amber)', bg: 'var(--amber-dim)', icon: <Heart size={20} /> },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 'var(--radius-m)',
                background: c.bg, color: c.color, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{c.icon}</div>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)',
                  textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 3 }}>
                  {c.label}
                </p>
                <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: c.color }}>
                  {c.value}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {isLoading ? <Loader text="Загружаем цели..." /> : (
        goals.length === 0
          ? <Card>
              <EmptyState
                icon={<Target size={32} color="var(--text-3)" />}
                title="Нет финансовых целей"
                description="Создайте первую цель — накопление на отпуск, технику или что угодно."
                action={() => setModal('add')}
                actionLabel="Создать цель"
              />
            </Card>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              <AnimatePresence>
                {goals.map((goal, i) => {
                  const p = pct(goal);
                  const left = Math.max(goal.targetAmount - goal.currentAmount, 0);
                  const days = daysLeft(goal);
                  const monthly = monthlyNeeded(goal);
                  const overdue = days !== null && days < 0 && !goal.completed;

                  return (
                    <motion.div key={goal._id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card style={{
                        border: goal.completed
                          ? '1px solid rgba(34,211,165,0.35)'
                          : overdue ? '1px solid rgba(248,114,114,0.3)'
                          : '1px solid var(--border)',
                        background: goal.completed
                          ? 'linear-gradient(135deg, var(--green-dim), var(--surface))'
                          : 'var(--surface)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 46, height: 46, borderRadius: 'var(--radius-m)',
                              background: `${goal.color}20`, color: goal.color, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: `1px solid ${goal.color}40`,
                            }}>
                              {getIcon(goal.icon)}
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 3 }}>{goal.name}</p>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {goal.completed && <Badge color="green" size="sm">✓ Достигнута</Badge>}
                                {overdue && <Badge color="red" size="sm">Просрочена</Badge>}
                                {days !== null && !overdue && !goal.completed && (
                                  <span style={{ fontSize: '0.72rem', color: days < 30 ? 'var(--amber)' : 'var(--text-3)',
                                    display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Calendar size={11} /> {days} дн.
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => setDeleteTarget(goal._id)}
                            style={{
                              width: 28, height: 28, borderRadius: 'var(--radius-s)',
                              background: 'var(--surface-2)', color: 'var(--text-3)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', border: 'none', flexShrink: 0,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 2 }}>Накоплено</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-display)' }}>
                              {formatCurrency(goal.currentAmount, user?.currency)}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 2 }}>Цель</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}>
                              {formatCurrency(goal.targetAmount, user?.currency)}
                            </p>
                          </div>
                        </div>

                        <div style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Прогресс</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: goal.color }}>{p.toFixed(0)}%</span>
                          </div>
                          <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${p}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              style={{ height: '100%', borderRadius: 99, background: goal.color }}
                            />
                          </div>
                        </div>

                        {monthly !== null && !goal.completed && monthly > 0 && (
                          <div style={{
                            padding: '8px 12px', background: `${goal.color}12`,
                            borderRadius: 'var(--radius-s)', marginBottom: 12,
                            border: `1px solid ${goal.color}25`,
                          }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>
                              Откладывайте ~<strong style={{ color: goal.color }}>
                                {formatCurrency(monthly, user?.currency)}
                              </strong> в месяц чтобы успеть в срок
                            </p>
                          </div>
                        )}

                        {!goal.completed && (
                          <Button fullWidth size="sm" onClick={() => setContribModal(goal)}
                            style={{ background: goal.color, boxShadow: `0 0 16px ${goal.color}50` }}>
                            + Пополнить копилку
                          </Button>
                        )}

                        {goal.completed && (
                          <div style={{ textAlign: 'center', padding: '8px 0',
                            color: 'var(--green)', fontWeight: 700, fontSize: '0.9rem' }}>
                            Цель достигнута!
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
      )}

      <Modal open={modal === 'add'} onClose={() => { setModal(null); setForm(emptyForm); }} title="Новая финансовая цель">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Название цели" placeholder="Накопить на отпуск"
            value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />

          <Input label="Целевая сумма" type="number" placeholder="100000"
            value={form.targetAmount} onChange={(e) => setForm(f => ({ ...f, targetAmount: e.target.value }))} />

          <Input label="Срок" type="date"
            value={form.deadline} onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))} />

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)',
              letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-display)',
              display: 'block', marginBottom: 8 }}>Иконка</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ICONS.map((ic) => (
                <button key={ic.id} onClick={() => setForm(f => ({ ...f, icon: ic.id }))}
                  title={ic.label}
                  style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-s)', cursor: 'pointer',
                    background: form.icon === ic.id ? `${form.color}25` : 'var(--surface-2)',
                    color: form.icon === ic.id ? form.color : 'var(--text-3)',
                    border: `2px solid ${form.icon === ic.id ? form.color : 'transparent'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'var(--transition)',
                  }}>
                  {ic.icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)',
              letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-display)',
              display: 'block', marginBottom: 8 }}>Цвет</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORS.map((c) => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
                    background: c, border: `3px solid ${form.color === c ? 'white' : 'transparent'}`,
                    outline: form.color === c ? `2px solid ${c}` : 'none',
                    transition: 'var(--transition)',
                  }}
                />
              ))}
            </div>
          </div>

          <Input label="Заметка" placeholder="Опционально"
            value={form.note} onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))} />

          <Button fullWidth loading={create.isPending}
            style={{ background: form.color, boxShadow: `0 0 20px ${form.color}50` }}
            onClick={() => {
              if (!form.name || !form.targetAmount) return toast.error('Заполните название и сумму');
              create.mutate({ ...form, targetAmount: parseFloat(form.targetAmount) });
            }}>
            Создать цель
          </Button>
        </div>
      </Modal>

      <Modal open={!!contribModal} onClose={() => { setContribModal(null); setContribAmount(''); setContribNote(''); }}
        title={`Пополнить: ${contribModal?.name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            padding: '12px 16px', 
            background: 'var(--surface-2)',
            borderRadius: 'var(--radius-m)',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Осталось накопить</span>
            <span style={{ fontWeight: 700, color: contribModal?.color }}>
              {contribModal && formatCurrency(
                Math.max(contribModal.targetAmount - contribModal.currentAmount, 0),
                user?.currency
              )}
            </span>
          </div>
          <Input label="Сумма пополнения" type="number" placeholder="0.00"
            value={contribAmount} onChange={(e) => setContribAmount(e.target.value)} />
          <Input label="Заметка" placeholder="Опционально"
            value={contribNote} onChange={(e) => setContribNote(e.target.value)} />
          <Button fullWidth loading={contribute.isPending}
            style={{ background: contribModal?.color, boxShadow: `0 0 20px ${contribModal?.color}50` }}
            onClick={() => {
              if (!contribAmount) return toast.error('Введите сумму');
              contribute.mutate({
                id: contribModal._id,
                data: { amount: parseFloat(contribAmount), note: contribNote },
              });
            }}>
            Пополнить
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onConfirm={() => remove.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        title="Удалить цель?"
        message="Цель и история пополнений будут удалены безвозвратно."
      />
    </div>
  );
}