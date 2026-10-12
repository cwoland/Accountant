import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  CURRENCY_SYMBOL,
  formatMoney,
  parseMinor,
  type AccountDto,
  type Currency,
  type Minor,
  type TransactionDto,
} from '@accountant/shared';
import { clearSplitApi, setSplitApi } from '../api/endpoints';
import { errorMessage } from '../api/client';
import Sheet from './ui/Sheet';
import Button from './ui/Button';
import styles from './SplitSheet.module.css';

interface Props {
  transaction: TransactionDto | null;
  account: AccountDto | null;
  currency: Currency;
  onClose: () => void;
}

function members(account: AccountDto): { id: string; name: string }[] {
  return [
    { id: account.owner._id, name: account.owner.name },
    ...account.members
      .filter((m) => m.status === 'active')
      .map((m) => ({ id: m.user._id, name: m.user.name })),
  ];
}

function equalShares(amount: number, ids: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  if (ids.length === 0) return out;
  const base = Math.floor(amount / ids.length);
  let rest = amount - base * ids.length;
  for (const id of ids) {
    const extra = rest > 0 ? 1 : 0;
    rest -= extra;
    out[id] = base + extra;
  }
  return out;
}

export default function SplitSheet({ transaction, account, currency, onClose }: Props) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Record<string, string>>({});

  const people = useMemo(() => (account ? members(account) : []), [account]);

  useEffect(() => {
    if (!transaction || people.length === 0) return;
    const existing = new Map(transaction.split?.map((s) => [s.user, s.share]) ?? []);
    const fallback = equalShares(transaction.amount, people.map((p) => p.id));
    const next: Record<string, string> = {};
    for (const p of people) {
      const value = existing.get(p.id) ?? fallback[p.id] ?? 0;
      next[p.id] = (value / 100).toFixed(2);
    }
    setDraft(next);
  }, [transaction, people]);

  const save = useMutation({
    mutationFn: (shares: { user: string; share: number }[]) =>
      setSplitApi(transaction!._id, shares),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transactions'] });
      void qc.invalidateQueries({ queryKey: ['settlement'] });
      toast.success('Разделение сохранено');
      onClose();
    },
    onError: (err) => toast.error(errorMessage(err, 'Не удалось разделить')),
  });

  const clear = useMutation({
    mutationFn: () => clearSplitApi(transaction!._id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transactions'] });
      void qc.invalidateQueries({ queryKey: ['settlement'] });
      toast.success('Разделение снято');
      onClose();
    },
  });

  if (!transaction || !account) return null;

  const parsed = people.map((p) => ({ id: p.id, value: parseMinor(draft[p.id] ?? '0') }));
  const invalid = parsed.some((p) => p.value === null);
  const total = parsed.reduce((sum, p) => sum + (p.value ?? 0), 0);
  const diff = total - transaction.amount;

  const applyEqual = () => {
    const shares = equalShares(transaction.amount, people.map((p) => p.id));
    const next: Record<string, string> = {};
    for (const p of people) next[p.id] = ((shares[p.id] ?? 0) / 100).toFixed(2);
    setDraft(next);
  };

  return (
    <Sheet open onClose={onClose} title="Разделить трату">
      <div className={styles.wrap}>
        <p className={styles.head}>
          {transaction.description || transaction.category?.name || 'Операция'}
          <b>{formatMoney(transaction.amount, currency)}</b>
        </p>

        <Button variant="quiet" size="sm" onClick={applyEqual}>
          Разделить поровну
        </Button>

        <ul className={styles.list}>
          {people.map((p) => (
            <li key={p.id} className={styles.row}>
              <span className={styles.name}>{p.name}</span>
              <span className={styles.input}>
                <input
                  inputMode="decimal"
                  aria-label={`Доля участника ${p.name}`}
                  value={draft[p.id] ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                />
                <span className={styles.cur}>{CURRENCY_SYMBOL[currency]}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className={styles.sum} data-bad={diff !== 0 || invalid || undefined}>
          {invalid
            ? 'Одна из долей введена некорректно'
            : diff === 0
              ? 'Доли сходятся'
              : diff > 0
                ? `Перебор на ${formatMoney(diff as Minor, currency)}`
                : `Не хватает ${formatMoney(Math.abs(diff) as Minor, currency)}`}
        </p>

        <div className={styles.actions}>
          {transaction.split && transaction.split.length > 0 && (
            <Button variant="danger" size="md" fullWidth loading={clear.isPending} onClick={() => clear.mutate()}>
              Снять
            </Button>
          )}
          <Button
            variant="bone"
            size="md"
            fullWidth
            disabled={invalid || diff !== 0}
            loading={save.isPending}
            onClick={() =>
              save.mutate(parsed.map((p) => ({ user: p.id, share: p.value ?? 0 })))
            }
          >
            Сохранить
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
