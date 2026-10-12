import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CURRENCY_SYMBOL, formatMoney, parseMinor, type Minor } from '@accountant/shared';
import { getCategoryBudgetsApi, setCategoryBudgetsApi } from '../api/endpoints';
import { errorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useCategories } from '../hooks/useCategories';
import { monthMeta } from '../lib/month';
import Page, { Section } from '../components/shell/Page';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import styles from './CategoryBudgetsPage.module.css';

export default function CategoryBudgetsPage() {
  const currency = useAuthStore((s) => s.user?.currency ?? 'RUB');
  const { expense: categories } = useCategories();
  const { year, month, label } = useMemo(() => monthMeta(), []);
  const qc = useQueryClient();

  const [draft, setDraft] = useState<Record<string, string>>({});

  const budgets = useQuery({
    queryKey: ['category-budgets', year, month],
    queryFn: () => getCategoryBudgetsApi({ year, month }).then((r) => r.data),
  });

  useEffect(() => {
    if (!budgets.data) return;
    const next: Record<string, string> = {};
    for (const b of budgets.data) next[b.category] = String(b.amount / 100);
    setDraft(next);
  }, [budgets.data]);

  const spentBy = new Map((budgets.data ?? []).map((b) => [b.category, b.spent]));

  const save = useMutation({
    mutationFn: setCategoryBudgetsApi,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['category-budgets'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Лимиты сохранены');
    },
    onError: (err) => toast.error(errorMessage(err, 'Не удалось сохранить')),
  });

  const submit = () => {
    const items: { category: string; amount: number }[] = [];
    for (const [category, raw] of Object.entries(draft)) {
      const trimmed = raw.trim();
      if (trimmed === '') {
        items.push({ category, amount: 0 });
        continue;
      }
      const minor = parseMinor(trimmed);
      if (minor === null) {
        toast.error('Проверьте суммы — одна из них некорректна');
        return;
      }
      items.push({ category, amount: minor });
    }
    save.mutate({ year, month, items });
  };

  const total = Object.values(draft).reduce((sum, raw) => {
    const minor = parseMinor(raw.trim() || '0');
    return sum + (minor ?? 0);
  }, 0);

  return (
    <Page
      title="Лимиты по категориям"
      sub={`${label}: заливка плитки на стене покажет, сколько съедено от лимита`}
      action={
        <Button size="sm" variant="bone" loading={save.isPending} onClick={submit}>
          Сохранить
        </Button>
      }
    >
      <Section title="Итого по лимитам">
        <p className={styles.total}>{formatMoney(total as Minor, currency)}</p>
      </Section>

      <Section title="Категории" count={String(categories.length)}>
        <ul className={styles.list}>
          {categories.map((c) => {
            const spent = spentBy.get(c._id) ?? (0 as Minor);
            const raw = draft[c._id] ?? '';
            const limit = parseMinor(raw.trim() || '0') ?? 0;
            const over = limit > 0 && spent > limit;

            return (
              <li key={c._id} className={styles.row} style={{ ['--ink' as string]: `var(--ink-${c.ink})` }}>
                <span className={styles.mark}>
                  <Icon name={c.icon} size={15} />
                </span>
                <span className={styles.text}>
                  <span className={styles.name}>{c.name}</span>
                  <span className={styles.spent} data-over={over || undefined}>
                    потрачено {formatMoney(spent, currency)}
                  </span>
                </span>
                <span className={styles.input}>
                  <input
                    inputMode="decimal"
                    placeholder="без лимита"
                    aria-label={`Лимит для категории ${c.name}`}
                    value={raw}
                    onChange={(e) => setDraft((d) => ({ ...d, [c._id]: e.target.value }))}
                  />
                  <span className={styles.cur}>{CURRENCY_SYMBOL[currency]}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Section>
    </Page>
  );
}
