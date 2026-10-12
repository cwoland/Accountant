import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { parseMinor, CURRENCY_SYMBOL } from '@accountant/shared';
import { createTransferApi, getAccountsApi } from '../../api/endpoints';
import { errorFields, errorMessage } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import Sheet from '../ui/Sheet';
import Button from '../ui/Button';
import { Field, SelectField } from '../ui/Field';

const PERSONAL = 'personal';
const todayISO = () => new Date().toISOString().slice(0, 10);

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TransferSheet({ open, onClose }: Props) {
  const currency = useAuthStore((s) => s.user?.currency ?? 'RUB');
  const qc = useQueryClient();

  const [from, setFrom] = useState(PERSONAL);
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const accounts = useQuery({
    queryKey: ['accounts'],
    queryFn: () => getAccountsApi().then((r) => r.data),
    enabled: open,
  });

  const options = useMemo(() => {
    const list = accounts.data ?? [];
    return [
      { value: PERSONAL, label: 'Личный счёт' },
      ...list.map((a) => ({ value: a._id, label: a.name })),
    ];
  }, [accounts.data]);

  useEffect(() => {
    if (!open) return;
    setFrom(PERSONAL);
    setTo('');
    setAmount('');
    setDate(todayISO());
    setNote('');
    setErrors({});
  }, [open]);

  const create = useMutation({
    mutationFn: createTransferApi,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transactions'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Перевод записан');
      onClose();
    },
    onError: (err) => {
      setErrors(errorFields(err));
      toast.error(errorMessage(err, 'Не удалось записать перевод'));
    },
  });

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (create.isPending) return;

    const minor = parseMinor(amount);
    const next: Record<string, string> = {};
    if (!to) next.toAccountId = 'Выберите счёт назначения';
    if (to && to === from) next.toAccountId = 'Счета должны различаться';
    if (minor === null || minor <= 0) next.amount = 'Введите сумму больше нуля';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    create.mutate({
      fromAccountId: from === PERSONAL ? null : from,
      toAccountId: to === PERSONAL ? null : to,
      amount: minor as number,
      date,
      note: note.trim(),
    });
  };

  return (
    <Sheet open={open} onClose={onClose} title="Перевод между счетами">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <SelectField
          label="Откуда"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          options={options}
        />
        <SelectField
          label="Куда"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          error={errors.toAccountId}
          options={[{ value: '', label: '— выберите счёт —' }, ...options]}
        />
        <Field
          label="Сумма"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          suffix={CURRENCY_SYMBOL[currency]}
        />
        <Field label="Дата" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
        <Field
          label="Комментарий"
          placeholder="Необязательно"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <p style={{ fontSize: 'var(--t-meta)', color: 'var(--bone-3)', lineHeight: 1.55 }}>
          Перевод не попадает ни в доходы, ни в расходы — это перекладывание из кармана в карман.
        </p>
        <Button type="submit" variant="bone" size="lg" fullWidth loading={create.isPending}>
          Записать перевод
        </Button>
      </form>
    </Sheet>
  );
}
