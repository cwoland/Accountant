import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingCart, Package, Wrench, Search } from 'lucide-react';
import useTransactions from '../hooks/useTransactions';
import useStore from '../store/useStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import TransactionForm from '../components/TransactionForm';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatDate, getMonthRange } from '../utils/formatters';

const PRODUCT_KEYWORDS = ['продукт', 'еда', 'товар', 'покупк', 'магазин', 'аптек', 'одежд', 'обувь', 'техник'];
const SERVICE_KEYWORDS = ['услуг', 'подписк', 'интернет', 'связь', 'сервис', 'доставк', 'ремонт'];

const classify = (tx) => {
  const desc = (tx.description || tx.category?.name || '').toLowerCase();
  if (SERVICE_KEYWORDS.some((k) => desc.includes(k))) return 'service';
  if (PRODUCT_KEYWORDS.some((k) => desc.includes(k))) return 'product';
  return 'other';
};

export default function ProductsPage() {
  const user = useStore((s) => s.user);
  const [modal, setModal] = useState(false);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const range = getMonthRange(0);

  const { transactions, create, isLoading } = useTransactions({
    ...range, type: 'expense', limit: 100,
  });

  const handleAdd = (data) => create.mutate(data, { onSuccess: () => setModal(false) });

  const classified = transactions.map((t) => ({ ...t, _kind: classify(t) }));

  const filtered = classified
    .filter((t) => tab === 'all' || t._kind === tab)
    .filter((t) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (t.description || '').toLowerCase().includes(s) ||
        (t.category?.name || '').toLowerCase().includes(s);
    });

  const total = filtered.reduce((s, t) => s + t.amount, 0);
  const products = classified.filter((t) => t._kind === 'product');
  const services = classified.filter((t) => t._kind === 'service');

  const tabs = [
    { id: 'all',     label: 'Все',      icon: <ShoppingCart size={15} />, count: classified.length },
    { id: 'product', label: 'Товары',   icon: <Package size={15} />,      count: products.length },
    { id: 'service', label: 'Услуги',   icon: <Wrench size={15} />,       count: services.length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Товары и услуги</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', marginTop: 3 }}>
            Расходы текущего месяца
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModal(true)}>Добавить</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {[
          { label: 'Итого за месяц', value: formatCurrency(total, user?.currency), color: 'var(--accent-2)', bg: 'var(--accent-dim)', icon: <ShoppingCart size={20} /> },
          { label: 'На товары', value: formatCurrency(products.reduce((s,t)=>s+t.amount,0), user?.currency), color: 'var(--amber)', bg: 'var(--amber-dim)', icon: <Package size={20} /> },
          { label: 'На услуги', value: formatCurrency(services.reduce((s,t)=>s+t.amount,0), user?.currency), color: 'var(--green)', bg: 'var(--green-dim)', icon: <Wrench size={20} /> },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-m)', background: c.bg, color: c.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 }}>{c.label}</p>
                <p style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: c.color }}>{c.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card style={{ padding: '14px 20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 2 }}>
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 14px', borderRadius: 'var(--radius-m)', cursor: 'pointer',
                  background: tab === t.id ? 'var(--accent)' : 'var(--surface-2)',
                  color: tab === t.id ? '#fff' : 'var(--text-2)',
                  fontSize: '0.82rem', fontWeight: 600,
                  fontFamily: 'var(--font-display)', transition: 'var(--transition)',
                  border: 'none',
                  flexShrink: 0,
                }}>
                {t.icon}{t.label}
                <span style={{
                  background: tab === t.id ? 'rgba(255,255,255,0.25)' : 'var(--surface)',
                  borderRadius: 99, padding: '1px 7px', fontSize: '0.7rem',
                }}>{t.count}</span>
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '8px 12px 8px 30px',
                color: 'var(--text-1)', fontSize: '0.82rem', width: 200,
              }}
            />
          </div>
        </div>
      </Card>

      {isLoading ? <Loader text="Загружаем покупки..." /> : (
        filtered.length === 0
          ? <Card>
              <EmptyState
          icon={tab === 'service' ? '⚙️' : tab === 'product' ? '📦' : '🛒'}
          title={search
            ? 'Ничего не найдено'
            : tab === 'all'
              ? 'Покупок пока нет'
              : tab === 'product'
                ? 'Товаров пока нет'
                : 'Услуг пока нет'}
          description={search
            ? 'Попробуйте изменить поисковый запрос.'
            : 'Добавьте расход с описанием — и он появится здесь с автоматической классификацией.'}
          action={!search ? () => setModal(true) : null}
          actionLabel="Добавить покупку"
        />
            </Card>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filtered.map((tx, i) => (
                <motion.div key={tx._id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}>
                  <Card hover style={{ padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 'var(--radius-m)', flexShrink: 0,
                        background: 'var(--red-dim)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '1.2rem',
                      }}>{tx.category?.icon || '🛒'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 3,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.description || tx.category?.name || '—'}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                          {tx.category?.name}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Badge color={tx._kind === 'service' ? 'accent' : tx._kind === 'product' ? 'amber' : 'muted'} size="sm">
                        {tx._kind === 'service' ? '⚙ Услуга' : tx._kind === 'product' ? '📦 Товар' : '● Прочее'}
                      </Badge>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, color: 'var(--red)', fontSize: '0.95rem' }}>
                          {formatCurrency(tx.amount, user?.currency)}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 2 }}>
                          {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Добавить покупку">
        <TransactionForm onSubmit={handleAdd} loading={create.isPending} />
      </Modal>
    </div>
  );
}