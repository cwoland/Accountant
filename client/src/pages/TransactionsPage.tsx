import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftRight, ChevronLeft, ChevronRight, Download, Receipt, Search, Split, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatMoney, type TransactionDto } from '@accountant/shared';
import { deleteTransactionApi, getTransactionsApi, type TxQuery } from '../api/endpoints';
import { errorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useCategories } from '../hooks/useCategories';
import { downloadTransactionsCsv } from '../lib/download';
import { getAccountsApi } from '../api/endpoints';
import SplitSheet from '../components/SplitSheet';
import { useDebounced } from '../hooks/useDebounced';
import { formatDay } from '../lib/format';
import { inkStyle } from '../lib/ink';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import EmptyPlate from '../components/ui/EmptyPlate';
import styles from './TransactionsPage.module.css';

const PAGE_SIZE = 25;

export default function TransactionsPage() {
  const [params, setParams] = useSearchParams();
  const currency = useAuthStore((s) => s.user?.currency ?? 'RUB');
  const accountId = useUiStore((s) => s.activeAccountId);
  const openCapture = useUiStore((s) => s.openCapture);
  const { all: categories } = useCategories();
  const qc = useQueryClient();

  const [splitTarget, setSplitTarget] = useState<TransactionDto | null>(null);
  const [search, setSearch] = useState(() => params.get('q') ?? '');
  const debounced = useDebounced(search, 350);
  const page = Number(params.get('page') ?? 1);
  const type = params.get('type') ?? '';
  const category = params.get('category') ?? '';

  const patch = (next: Record<string, string>) => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(next)) {
        if (v) p.set(k, v);
        else p.delete(k);
      }
      if (!('page' in next)) p.delete('page');
      return p;
    });
  };

  useEffect(() => { patch({ q: debounced }); }, [debounced]);

  const query: TxQuery = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    accountId: accountId ?? undefined,
    ...(debounced ? { search: debounced } : {}),
    ...(type ? { type: type as 'income' | 'expense' } : {}),
    ...(category ? { category } : {}),
  }), [page, accountId, debounced, type, category]);

  const { data, isPending } = useQuery({
    queryKey: ['transactions', query],
    queryFn: () => getTransactionsApi(query).then((r) => r.data),
    placeholderData: keepPreviousData,
  });

  const accounts = useQuery({
    queryKey: ['accounts'],
    queryFn: () => getAccountsApi().then((r) => r.data),
    enabled: Boolean(accountId),
  });

  const activeAccount = (accounts.data ?? []).find((a) => a._id === accountId) ?? null;

  const remove = useMutation({
    mutationFn: (id: string) => deleteTransactionApi(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transactions'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Удалено');
    },
    onError: (err) => toast.error(errorMessage(err, 'Не удалось удалить')),
  });

  const items = data?.items ?? [];
  const pages = data?.pages ?? 1;
  const filtered = Boolean(debounced || type || category);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <h1 className={styles.title}>Операции</h1>
          <p className={styles.count}>{data ? `${data.total} всего` : '—'}</p>
        </div>
        <div className={styles.headActions}>
          <Button
            size="sm"
            variant="quiet"
            icon={<ArrowLeftRight size={14} />}
            onClick={() => openCapture('transfer')}
          >
            Перевод
          </Button>
          <Button
            size="sm"
            variant="quiet"
            icon={<Download size={14} />}
            onClick={() => {
              void downloadTransactionsCsv({
                accountId: accountId ?? undefined,
              }).catch(() => toast.error('Не удалось выгрузить'));
            }}
          >
            CSV
          </Button>
        </div>
      </header>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={15} aria-hidden className={styles.searchIcon} />
          <input
            className={styles.search}
            type="search"
            placeholder="Поиск по описанию"
            aria-label="Поиск по описанию"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className={styles.select}
          aria-label="Тип операции"
          value={type}
          onChange={(e) => patch({ type: e.target.value })}
        >
          <option value="">Все типы</option>
          <option value="expense">Расходы</option>
          <option value="income">Доходы</option>
        </select>

        <select
          className={styles.select}
          aria-label="Категория"
          value={category}
          onChange={(e) => patch({ category: e.target.value })}
        >
          <option value="">Все категории</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {isPending ? (
        <ul className={styles.list} aria-busy="true">
          {Array.from({ length: 8 }, (_, i) => <li key={i} className={styles.ghost} />)}
        </ul>
      ) : items.length === 0 ? (
        <EmptyPlate
          icon={<Receipt size={20} />}
          title={filtered ? 'Ничего не нашлось' : 'Операций пока нет'}
          description={
            filtered
              ? 'Попробуйте снять фильтры или изменить запрос.'
              : 'Запишите первую трату — она появится здесь и на стене.'
          }
          action={
            filtered
              ? <Button variant="quiet" size="sm" onClick={() => setParams(new URLSearchParams())}>Сбросить фильтры</Button>
              : <Button variant="bone" size="sm" onClick={() => openCapture('expense')}>Записать трату</Button>
          }
        />
      ) : (
        <ul className={styles.list}>
          {items.map((t) => (
            <li key={t._id} className={styles.op} style={inkStyle(t.category?.ink ?? 10)}>
              <span className={styles.mark} aria-hidden>
                <Icon name={t.category?.icon} size={15} />
              </span>
              <span className={styles.text}>
                <span className={styles.name}>{t.description || t.category?.name || '—'}</span>
                <span className={styles.meta}>
                  {(t.category?.name ?? 'БЕЗ КАТЕГОРИИ').toUpperCase()} · {formatDay(t.date)}
                  {t.isRecurring && ' · ПОВТОРЯЕТСЯ'}
                </span>
              </span>
              <span className={styles.sum} data-kind={t.type}>
                {t.type === 'income' ? '+' : '−'}{formatMoney(t.amount, currency)}
              </span>
              {accountId && (
                <button
                  type="button"
                  className={styles.split}
                  aria-label={`Разделить операцию «${t.description || t.category?.name || ''}»`}
                  onClick={() => setSplitTarget(t)}
                  data-active={t.split.length > 0 || undefined}
                >
                  <Split size={14} aria-hidden />
                </button>
              )}
              <button
                type="button"
                className={styles.del}
                aria-label={`Удалить операцию «${t.description || t.category?.name || ''}»`}
                onClick={() => remove.mutate(t._id)}
              >
                <Trash2 size={14} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Раньше рисовались ВСЕ кнопки страниц: при 2000 операций это 80 кнопок. */}
      {pages > 1 && (
        <nav className={styles.pager} aria-label="Страницы">
          <Button
            variant="quiet" size="sm" disabled={page <= 1}
            onClick={() => patch({ page: String(page - 1) })}
            icon={<ChevronLeft size={14} />}
          >
            Назад
          </Button>
          <span className={styles.pageNum}>{page} из {pages}</span>
          <Button
            variant="quiet" size="sm" disabled={page >= pages}
            onClick={() => patch({ page: String(page + 1) })}
          >
            Дальше <ChevronRight size={14} />
          </Button>
        </nav>
      )}

      <SplitSheet
        transaction={splitTarget}
        account={activeAccount}
        currency={currency}
        onClose={() => setSplitTarget(null)}
      />
    </div>
  );
}
