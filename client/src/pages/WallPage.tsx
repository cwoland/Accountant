import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { asMinor, formatMoney, type AccountDto, type PendingItemDto } from '@accountant/shared';
import {
  getAccountsApi,
  getBudgetApi,
  getCategoryBudgetsApi,
  getStatsApi,
} from '../api/endpoints';
import { getPendingApi } from '../api/pending';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import Row from '../components/wall/Row';
import Rail from '../components/wall/Rail';
import Poster from '../components/wall/Poster';
import Hero from '../components/wall/Hero';
import OpList from '../components/wall/OpList';
import WallSkeleton from '../components/wall/WallSkeleton';
import Icon from '../components/ui/Icon';
import { monthMeta } from '../lib/month';

function dueFlag(iso: string): string {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return 'ПРОСРОЧЕНО';
  if (days === 0) return 'СЕГОДНЯ';
  if (days === 1) return 'ЗАВТРА';
  return `ЧЕРЕЗ ${days} ДН`;
}

export default function WallPage() {
  const navigate = useNavigate();
  const currency = useAuthStore((s) => s.user?.currency ?? 'RUB');
  const activeAccountId = useUiStore((s) => s.activeAccountId);
  const setActiveAccount = useUiStore((s) => s.setActiveAccount);

  const { year, month, label, daysPassed, daysInMonth, range } = useMemo(() => monthMeta(), []);

  const accounts = useQuery({
    queryKey: ['accounts'],
    queryFn: () => getAccountsApi().then((r) => r.data),
  });

  const stats = useQuery({
    queryKey: ['stats', range, activeAccountId],
    queryFn: () =>
      getStatsApi({ ...range, accountId: activeAccountId ?? undefined }).then((r) => r.data),
  });

  const budget = useQuery({
    queryKey: ['budget', year, month],
    queryFn: () => getBudgetApi({ year, month }).then((r) => r.data),
  });

  const pending = useQuery({
    queryKey: ['pending', activeAccountId],
    queryFn: () => getPendingApi({ accountId: activeAccountId ?? undefined }).then((r) => r.data),
  });

  if (stats.isPending || budget.isPending) return <WallSkeleton />;

  const spent = stats.data?.summary.expense ?? asMinor(0);
  const plan = budget.data?.amount ?? asMinor(0);
  const remaining = asMinor(plan - spent);
  const forecast = asMinor(daysPassed > 0 ? Math.round((spent / daysPassed) * daysInMonth) : 0);

  const expenseCats = (stats.data?.byCategory ?? []).filter((c) => c.type === 'expense');

  const fillBase = plan > 0 ? plan : (expenseCats[0]?.total ?? asMinor(1));

  const list: AccountDto[] = accounts.data ?? [];
  const position = activeAccountId === null ? 1 : list.findIndex((a) => a._id === activeAccountId) + 2;

  const catBudgets = useQuery({
    queryKey: ['category-budgets', year, month],
    queryFn: () => getCategoryBudgetsApi({ year, month }).then((r) => r.data),
  });

  const limitBy = new Map((catBudgets.data ?? []).map((b) => [b.category, b.amount]));

  return (
    <>
      <Row title="Счета" count={`${position} / ${list.length + 1}`} allHref="/accounts">
        <Rail selectable label="Выбор счёта">
          <Poster
            shape="spine" ink={10}
            ratio={activeAccountId === null ? 1 : 0}
            title="Личный" meta="только вы"
            current={activeAccountId === null}
            dimWhenNotCurrent
            onClick={() => setActiveAccount(null)}
            ariaLabel="Личный счёт"
          />
          {list.map((a) => {
            const members = a.members.filter((m) => m.status === 'active').length;
            return (
              <Poster
                key={a._id}
                shape="spine" ink={4}
                ratio={activeAccountId === a._id ? 1 : 0}
                title={a.name}
                meta={`вы + ${members}`}
                current={activeAccountId === a._id}
                dimWhenNotCurrent
                onClick={() => setActiveAccount(a._id)}
                ariaLabel={`Счёт ${a.name}`}
              />
            );
          })}
        </Rail>
      </Row>

      <Hero
        monthLabel={label}
        remaining={remaining}
        budget={plan}
        spent={spent}
        forecast={forecast}
        daysPassed={daysPassed}
        daysInMonth={daysInMonth}
        currency={currency}
      />

      {(pending.data?.length ?? 0) > 0 && (
        <Row title="Продолжить" count={String(pending.data?.length ?? 0)} allHref="/mandatory">
          <Rail label="Незакрытые дела">
            {(pending.data ?? []).map((item: PendingItemDto) => (
              <Poster
                key={`${item.kind}-${item.id}`}
                shape="wide"
                ink={item.ink}
                icon={<Icon name={item.icon} size={17} />}
                title={item.title}
                meta={item.subtitle}
                amount={item.amount ? formatMoney(item.amount, currency) : undefined}
                flag={item.dueDate ? dueFlag(item.dueDate) : undefined}
                flagAlert={item.dueDate ? new Date(item.dueDate) < new Date() : false}
                onClick={() => navigate(item.url)}
              />
            ))}
          </Rail>
        </Row>
      )}

      <Row title="Этот месяц" count={`${expenseCats.length} КАТЕГОРИЙ`} allHref="/transactions">
        <Rail label="Расходы по категориям">
          {expenseCats.map((c) => {
            const limit = limitBy.get(c.categoryId);
            const base = limit ?? fillBase;
            const ratio = c.total / base;
            return (
              <Poster
                key={c.categoryId}
                ink={c.ink}
                ratio={ratio}
                icon={<Icon name={c.icon} size={17} />}
                title={c.name}
                amount={formatMoney(c.total, currency)}
                meta={limit ? `ИЗ ${formatMoney(limit, currency)}` : `${c.count} ОПЕР.`}
                flag={`${Math.round(ratio * 100)}%`}
                flagAlert={ratio > 1}
                onClick={() => navigate(`/transactions?category=${c.categoryId}`)}
              />
            );
          })}
        </Rail>
      </Row>

      <Row title="Последние" allHref="/transactions">
        <OpList accountId={activeAccountId} currency={currency} limit={5} />
      </Row>
    </>
  );
}