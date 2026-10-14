import { useEffect, useState } from 'react';
import { parseMinor, CURRENCY_SYMBOL, type Currency, type Minor } from '@accountant/shared';
import Sheet from '../ui/Sheet';
import Button from '../ui/Button';
import { Field } from '../ui/Field';
import { formatMoney } from '../../lib/format';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  hint?: string;
  max?: Minor;
  currency: Currency;
  submitLabel: string;
  pending: boolean;
  onSubmit: (amountMinor: number, note: string) => void;
}

export default function AmountSheet({
  open, onClose, title, hint, max, currency, submitLabel, pending, onSubmit,
}: Props) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (open) { setAmount(''); setNote(''); setError(undefined); }
  }, [open]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;

    const minor = parseMinor(amount);
    if (minor === null || minor <= 0) { setError('Введите сумму больше нуля'); return; }
    if (max !== undefined && minor > max) {
      setError(`Больше остатка — максимум ${formatMoney(max, currency)}`);
      return;
    }
    onSubmit(minor, note.trim());
  };

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field
          label="Сумма"
          inputMode="decimal"
          autoFocus
          placeholder="0"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError(undefined); }}
          error={error}
          hint={hint}
          suffix={CURRENCY_SYMBOL[currency]}
        />
        <Field
          label="Комментарий"
          placeholder="Необязательно"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button type="submit" variant="bone" size="lg" fullWidth loading={pending}>
          {submitLabel}
        </Button>
      </form>
    </Sheet>
  );
}
