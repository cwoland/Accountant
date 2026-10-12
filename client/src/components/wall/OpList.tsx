import { useQuery } from "@tanstack/react-query";
import type { Currency } from "@accountant/shared";
import { getTransactionsApi } from "../../api/endpoints";
import { formatMoney, formatDay } from "@/lib/format";
import type { Paginated, TransactionDto } from '@accountant/shared';
import { inkStyle } from "@/lib/ink";
import Icon from "../ui/Icon";
import styles from "./OpList.module.css";

interface Props { accountId: string | null; currency: Currency; limit: number; }

export default function OpList({ accountId, currency, limit }: Props) {
    const { data } = useQuery({
        queryKey: ['transactions', 'recent', accountId, limit],
        queryFn: () =>
            getTransactionsApi({ limit, accountId: accountId ?? undefined })
            .then((r): Paginated<TransactionDto> => r.data),
    });

    if (!data?.items.length) {
        return <p className={styles.empty}>Операций пока нет. Первая запись появится здесь.</p>;
    }

    return (
        <ul className={styles.list}>
            {data.items.map((t) => (
                <li key={t._id} className={styles.op} style={inkStyle(t.category?.ink ?? 10)}>
                    <span className={styles.mark} aria-hidden>
                        <Icon name={t.category?.icon} size={15} />
                    </span>
                    <span className={styles.text}>
                        <span className={styles.name}>{t.description || t.category?.name || '—'}</span>
                        <span className={styles.meta}>
                            {(t.category?.name ?? 'БЕЗ КАТЕГОРИИ').toUpperCase()} · {formatDay(t.date)}
                        </span>
                    </span>
                    <span className={styles.sum} data-kind={t.type}>
                        {t.type === 'income' ? '+' : '−'}
                        {formatMoney(t.amount, currency)}
                    </span>
                </li>
            ))}
        </ul>
    );
}undefined