import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, Filter, ArrowUpRight, ArrowDownRight, Search, Receipt } from 'lucide-react';
import useTransactions from '../hooks/useTransactions';
import useCategories from '../hooks/useCategories';
import useStore from '../store/useStore';
import Button from '../components/ui/Button';
import ConfirmModal from '../components/ui/ConfirmModal';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import Select from '../components/ui/Select';
import TransactionForm from '../components/TransactionForm';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';

const FADE = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function TransactionsPage() {
  const user = useStore((s) => s.user);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const params = {
    page, limit: 15,
    ...(typeFilter && { type: typeFilter }),
    ...(catFilter && { category: catFilter }),
  };

  const { transactions, pagination, isLoading, create, update, remove } = useTransactions(params);
  const { categories } = useCategories();

  const filtered = search
    ? transactions.filter((t) =>
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.name?.toLowerCase().includes(search.toLowerCase()))
    : transactions;

  const handleAdd = (data, meta) => {
    if (meta?.online) {
      setModal(null);
      return;
    }
    create.mutate(data, { onSuccess: () => setModal(null) });
  };
  const handleEdit = (data) => update.mutate(
    { id: editing._id, data },
    { onSuccess: () => { setModal(null); setEditing(null); } }
  );
  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = () => {
    remove.mutate(deleteTarget);
    setDeleteTarget(null);
  };

  const openEdit = (tx) => {
    setEditing({
      ...tx,
      category: tx.category?._id || tx.category,
      date: new Date(tx.date).toISOString().slice(0, 10),
    });
    setModal('edit');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Транзакции</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', marginTop: 3 }}>
            Всего: {pagination.total || 0}
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModal('add')}>
          Добавить
        </Button>
      </div>
      <Card style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 200px', gap: 12, alignItems: 'end' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{
              position: 'absolute', left: 13, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-3)',
            }} />
            <input placeholder="Поиск по описанию..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', background: 'var(--surface-2)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-m)',
                padding: '10px 14px 10px 36px', color: 'var(--text-1)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            options={[
              { value: '', label: 'Все типы' },
              { value: 'income', label: 'Доходы' },
              { value: 'expense', label: 'Расходы' },
            ]}
          />

          <Select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
            options={[
              { value: '', label: 'Все категории' },
              ...categories.map((c) => ({ value: c._id, label: `${c.icon} ${c.name}` })),
            ]}
          />
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? <Loader text="Загружаем транзакции..." /> : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 140px 120px 100px 80px',
              gap: 12, padding: '12px 20px',
              borderBottom: '1px solid var(--border)',
              color: 'var(--text-3)', fontSize: '0.72rem',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              fontFamily: 'var(--font-display)',
            }}>
              <div />
              <div>Описание</div>
              <div>Категория</div>
              <div>Дата</div>
              <div style={{ textAlign: 'right' }}>Сумма</div>
              <div />
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '16px 0' }}>
                <EmptyState
                 icon={<Receipt size={24} color="var(--text-3)" />}
                 title={search || typeFilter || catFilter
                 ? 'Ничего не найдено'
                 : 'Транзакций пока нет'}
                 description={search || typeFilter || catFilter
                 ? 'Попробуйте изменить фильтры или поисковый запрос.'
                 : 'Начните вести учёт — добавьте первый доход или расход.'}
                 action={!search && !typeFilter && !catFilter
                 ? () => setModal('add')
                 : null}
                actionLabel="Добавить первую транзакцию"
                 />
              </div>
            ) : (
              <AnimatePresence>
                {filtered.map((tx, i) => (
                  <motion.div key={tx._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 140px 120px 100px 80px',
                      gap: 12, padding: '14px 20px',
                      borderBottom: '1px solid var(--border)',
                      alignItems: 'center', transition: 'var(--transition)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-s)',
                      background: tx.type === 'income' ? 'var(--green-dim)' : 'var(--red-dim)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem',
                    }}>
                      {tx.category?.icon || '💸'}
                    </div>

                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.875rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.description || '—'}
                      </p>
                      {tx.isRecurring && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-2)' }}>
                          🔄 {tx.recurringPeriod}
                        </span>
                      )}
                    </div>
                    <Badge color="muted" size="sm">
                      {tx.category?.name || '—'}
                    </Badge>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
                      {formatDate(tx.date)}
                    </p>
                    <p style={{
                      fontWeight: 700, fontSize: '0.9rem', textAlign: 'right',
                      color: tx.type === 'income' ? 'var(--green)' : 'var(--red)',
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3,
                    }}>
                      {tx.type === 'income'
                        ? <ArrowUpRight size={14} />
                        : <ArrowDownRight size={14} />}
                      {formatCurrency(tx.amount, user?.currency)}
                    </p>

                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(tx)} style={{
                        width: 30, height: 30, borderRadius: 'var(--radius-s)',
                        background: 'var(--surface-2)', color: 'var(--text-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'var(--transition)',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-2)'; e.currentTarget.style.background = 'var(--accent-dim)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                      ><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(tx._id)} style={{
                        width: 30, height: 30, borderRadius: 'var(--radius-s)',
                        background: 'var(--surface-2)', color: 'var(--text-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'var(--transition)',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                      ><Trash2 size={13} /></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 20px' }}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{
                      width: 34, height: 34, borderRadius: 'var(--radius-s)',
                      background: page === p ? 'var(--accent)' : 'var(--surface-2)',
                      color: page === p ? '#fff' : 'var(--text-2)',
                      fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                      border: 'none', transition: 'var(--transition)',
                    }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Новая транзакция">
        <TransactionForm onSubmit={handleAdd} loading={create.isPending} />
      </Modal>

      <Modal open={modal === 'edit'} onClose={() => { setModal(null); setEditing(null); }} title="Редактировать">
        <TransactionForm initial={editing} onSubmit={handleEdit} loading={update.isPending} />
      </Modal>
      <ConfirmModal
      open={!!deleteTarget}
      onConfirm={confirmDelete}
      onCancel={() => setDeleteTarget(null)}
      title="Удалить транзакцию?"
      message="Транзакция будет удалена безвозвратно." />
    </div>
  );
}