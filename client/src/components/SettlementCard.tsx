import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { formatMoney, type AccountDto, type Currency } from '@accountant/shared';
import { getSettlementApi } from '../api/endpoints';
import styles from './SettlementCard.module.css';

interface Props {
  account: AccountDto;
  currency: Currency;
}

export default function SettlementCard({ account, currency }: Props) {
  const { data, isPending } = useQuery({
    queryKey: ['settlement', account._id],
    queryFn: () => getSettlementApi(account._id).then((r) => r.data),
  });

  const names = new Map<string, string>([
    [account.owner._id, account.owner.name],
    ...account.members.filter((m) => m.status === 'active').map((m) => [m.user._id, m.user.name] as const),
  ]);

  if (isPending) return <p className={styles.hint}>Считаем…</p>;
  if (!data || data.debts.length === 0) {
    return <p className={styles.hint}>Все в расчёте — разделённых трат с долгами нет.</p>;
  }

  return (
    <ul className={styles.list}>
      {data.debts.map((d) => (
        <li key={`${d.from}-${d.to}`} className={styles.row}>
          <span className={styles.who}>{names.get(d.from) ?? 'Участник'}</span>
          <ArrowRight size={14} aria-hidden className={styles.arrow} />
          <span className={styles.who}>{names.get(d.to) ?? 'Участник'}</span>
          <span className={styles.amount}>{formatMoney(d.amount, currency)}</span>
        </li>
      ))}
    </ul>
  );
}
