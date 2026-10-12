import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { formatMoney } from '@accountant/shared';
import { getStatsApi } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useCategories } from '../hooks/useCategories';
import { monthMeta } from '../lib/month';
import Page, { PosterGrid, Section } from '../components/shell/Page';
import Poster from '../components/wall/Poster';
import Icon from '../components/ui/Icon';
import EmptyPlate from '../components/ui/EmptyPlate';

export default function MandatoryPage() {
  const currency = useAuthStore((s) => s.user?.currency ?? 'RUB');
  const accountId = useUiStore((s) => s.activeAccountId);
  const openCapture = useUiStore((s) => s.openCapture);
  const { mandatory, isPending } = useCategories();
  const { label, range, daysInMonth } = useMemo(() => monthMeta(), []);

  const stats = useQuery({
    queryKey: ['stats', range, accountId],
    queryFn: () => getStatsApi({ ...range, accountId: accountId ?? undefined }).then((r) => r.data),
  });

  const paid = new Map(
    (stats.data?.byCategory ?? [])
      .filter((c) => c.type === 'expense')
      .map((c) => [c.categoryId, c]),
  );

  const done = mandatory.filter((c) => paid.has(c._id));
  const total = done.reduce((sum, c) => sum + (paid.get(c._id)?.total ?? 0), 0);
  const today = new Date().getDate();

  if (!isPending && mandatory.length === 0) {
    return (
      <Page title="Обязательные" sub="Аренда, ЖКХ, кредиты и другие регулярные платежи">
        <EmptyPlate
          icon={<ShieldCheck size={20} />}
          title="Нет обязательных категорий"
          description="Запустите на сервере npm run seed — он создаст системные категории с датами платежей."
        />
      </Page>
    );
  }

  return (
    <Page
      title="Обязательные"
      sub={`${label}: закрыто ${done.length} из ${mandatory.length} · ${formatMoney(total as never, currency)}`}
    >
      <Section title="Платежи месяца" count={`${mandatory.length}`}>
        <PosterGrid>
          {mandatory.map((c) => {
            const slice = paid.get(c._id);
            const isPaid = Boolean(slice);
            const overdue = !isPaid && typeof c.dueDay === 'number' && c.dueDay < today;
            const soon = !isPaid && typeof c.dueDay === 'number' && c.dueDay - today <= 3 && c.dueDay >= today;

            return (
              <Poster
                key={c._id}
                ink={c.ink}
                ratio={isPaid ? 1 : 0}
                icon={<Icon name={c.icon} size={17} />}
                title={c.name}
                amount={slice ? formatMoney(slice.total, currency) : undefined}
                meta={
                  isPaid ? `ОПЛАЧЕНО · ${slice?.count} ОПЕР.`
                  : typeof c.dueDay === 'number' ? `СРОК ${c.dueDay} ЧИСЛА`
                  : 'НЕ ОПЛАЧЕНО'
                }
                flag={isPaid ? 'ЗАКРЫТО' : overdue ? 'ПРОСРОЧЕНО' : soon ? 'СКОРО' : undefined}
                flagAlert={overdue}
                onClick={() => openCapture('expense')}
                ariaLabel={`${c.name}, ${isPaid ? 'оплачено' : 'не оплачено'}. Записать платёж`}
              />
            );
          })}
        </PosterGrid>
      </Section>

      <p style={{ padding: '0 var(--pad)', fontSize: 'var(--t-meta)', color: 'var(--bone-4)', lineHeight: 1.6 }}>
        Категория считается закрытой, если в текущем месяце по ней есть хотя бы один расход.
        В месяце {daysInMonth} дней.
      </p>
    </Page>
  );
}