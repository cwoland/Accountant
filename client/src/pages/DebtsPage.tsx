import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Landmark, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatMoney, parseMinor, type DebtDto } from '@accountant/shared';
import { addDebtPaymentApi, createDebtApi, deleteDebtApi, getDebtsApi } from '../api/endpoints';
import { errorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';
import Page, { PosterGrid, Section } from '../components/shell/Page';
import Poster from '../components/wall/Poster';
import Button from '../components/ui/Button';
import Sheet from '../components/ui/Sheet';
import { Field, SelectField } from '../components/ui/Field';
import AmountSheet from '../components/capture/AmountSheet';
import EmptyPlate from '../components/ui/EmptyPlate';
import Icon from '../components/ui/Icon';

export default function DebtsPage() {
  const currency = useAuthStore((s) => s.user?.currency ?? 'RUB');
  const qc = useQueryClient();
  const [target, setTarget] = useState<DebtDto | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', creditor: '', dueDate: '', isOwed: 'true' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const debts = useQuery({ queryKey: ['debts'], queryFn: () => getDebtsApi().then((r) => r.data) });
  const invalidate = () => { void qc.invalidateQueries({ queryKey: ['debts'] }); void qc.invalidateQueries({ queryKey: ['pending'] }); };

  const create = useMutation({
    mutationFn: createDebtApi,
    onSuccess: () => {
      invalidate(); setCreating(false);
      setForm({ name: '', amount: '', creditor: '', dueDate: '', isOwed: 'true' });
      toast.success('Долг добавлен');
    },
    onError: (e) => toast.error(errorMessage(e, 'Не удалось добавить')),
  });

  const pay = useMutation({
    mutationFn: ({ id, amount, note }: { id: string; amount: number; note: string }) =>
      addDebtPaymentApi(id, { amount, note }),
    onSuccess: (res) => {
      invalidate(); setTarget(null);
      toast.success(res.data.settled ? 'Долг закрыт' : 'Платёж записан');
    },
    onError: (e) => toast.error(errorMessage(e, 'Не удалось записать платёж')),
  });

  const remove = useMutation({
    mutationFn: deleteDebtApi,
    onSuccess: () => { invalidate(); setTarget(null); toast.success('Удалено'); },
  });

  const submitNew = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const minor = parseMinor(form.amount);
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Введите название';
    if (minor === null || minor <= 0) next.amount = 'Введите сумму больше нуля';
    setErrors(next);
    if (Object.keys(next).length) return;

    create.mutate({
      name: form.name.trim(),
      totalAmount: minor as number,
      isOwed: form.isOwed === 'true',
      ...(form.creditor.trim() ? { creditor: form.creditor.trim() } : {}),
      ...(form.dueDate ? { dueDate: form.dueDate } : {}),
    });
  };

  const list = debts.data ?? [];
  const owe = list.filter((d) => d.isOwed && !d.settled);
  const owed = list.filter((d) => !d.isOwed && !d.settled);
  const closed = list.filter((d) => d.settled);
  const today = new Date();

  const tile = (d: DebtDto) => {
    const overdue = !d.settled && d.dueDate !== null && new Date(d.dueDate) < today;
    return (
      <Poster
        key={d._id}
        ink={d.isOwed ? 11 : 10}
        ratio={d.totalAmount > 0 ? d.paidAmount / d.totalAmount : 0}
        icon={<Icon name="landmark" size={17} />}
        title={d.name}
        amount={formatMoney(d.remaining, currency)}
        meta={d.creditor ? d.creditor.toUpperCase() : `ИЗ ${formatMoney(d.totalAmount, currency)}`}
        flag={d.settled ? 'ЗАКРЫТ' : overdue ? 'ПРОСРОЧЕН' : undefined}
        flagAlert={overdue}
        onClick={() => setTarget(d)}
        ariaLabel={`${d.name}: осталось ${formatMoney(d.remaining, currency)} из ${formatMoney(d.totalAmount, currency)}`}
      />
    );
  };

  return (
    <Page
      title="Долги"
      sub="Заливка плитки — какая часть уже погашена"
      action={<Button size="sm" variant="quiet" icon={<Plus size={15} />} onClick={() => setCreating(true)}>Долг</Button>}
    >
      {list.length === 0 && !debts.isPending && (
        <EmptyPlate
          icon={<Landmark size={20} />}
          title="Долгов нет"
          description="Добавьте долг — и приложение само напомнит о платеже в ряду «Продолжить»."
          action={<Button variant="bone" size="sm" onClick={() => setCreating(true)}>Добавить долг</Button>}
        />
      )}

      {owe.length > 0 && <Section title="Я должен" count={String(owe.length)}><PosterGrid>{owe.map(tile)}</PosterGrid></Section>}
      {owed.length > 0 && <Section title="Мне должны" count={String(owed.length)}><PosterGrid>{owed.map(tile)}</PosterGrid></Section>}
      {closed.length > 0 && <Section title="Закрытые" count={String(closed.length)}><PosterGrid>{closed.map(tile)}</PosterGrid></Section>}

      <Sheet open={creating} onClose={() => setCreating(false)} title="Новый долг">
        <form onSubmit={submitNew} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <SelectField
            label="Направление"
            value={form.isOwed}
            onChange={(e) => setForm((f) => ({ ...f, isOwed: e.target.value }))}
            options={[{ value: 'true', label: 'Я должен' }, { value: 'false', label: 'Мне должны' }]}
          />
          <Field label="Название" placeholder="Например: кредит на машину" value={form.name} autoFocus
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
          <Field label="Сумма" inputMode="decimal" placeholder="0" value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} error={errors.amount} />
          <Field label="Кому / от кого" placeholder="Необязательно" value={form.creditor}
            onChange={(e) => setForm((f) => ({ ...f, creditor: e.target.value }))} />
          <Field label="Срок" type="date" value={form.dueDate} hint="Появится в ряду «Продолжить» за несколько дней"
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
          <Button type="submit" variant="bone" size="lg" fullWidth loading={create.isPending}>Добавить</Button>
        </form>
      </Sheet>

      <AmountSheet
        open={Boolean(target) && !target?.settled}
        onClose={() => setTarget(null)}
        title={target ? `Платёж по «${target.name}»` : ''}
        hint={target ? `Осталось ${formatMoney(target.remaining, currency)}` : undefined}
        max={target?.remaining}
        currency={currency}
        submitLabel="Записать платёж"
        pending={pay.isPending}
        onSubmit={(amount, note) => target && pay.mutate({ id: target._id, amount, note })}
      />

      {target?.settled && (
        <Sheet open onClose={() => setTarget(null)} title={target.name}>
          <p style={{ color: 'var(--bone-3)', fontSize: 'var(--t-body)', lineHeight: 1.6, marginBottom: 20 }}>
            Долг закрыт: {formatMoney(target.totalAmount, currency)} за {target.payments.length} платёж(ей).
          </p>
          <Button variant="danger" size="md" fullWidth loading={remove.isPending}
            onClick={() => remove.mutate(target._id)}>Удалить запись</Button>
        </Sheet>
      )}
    </Page>
  );
}