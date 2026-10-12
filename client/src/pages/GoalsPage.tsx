import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatMoney, parseMinor, type GoalDto } from '@accountant/shared';
import { contributeGoalApi, createGoalApi, deleteGoalApi, getGoalsApi } from '../api/endpoints';
import { errorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';
import Page, { PosterGrid, Section } from '../components/shell/Page';
import Poster from '../components/wall/Poster';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Sheet from '../components/ui/Sheet';
import { Field } from '../components/ui/Field';
import AmountSheet from '../components/capture/AmountSheet';
import EmptyPlate from '../components/ui/EmptyPlate';

export default function GoalsPage() {
  const currency = useAuthStore((s) => s.user?.currency ?? 'RUB');
  const qc = useQueryClient();
  const [target, setTarget] = useState<GoalDto | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', deadline: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const goals = useQuery({ queryKey: ['goals'], queryFn: () => getGoalsApi().then((r) => r.data) });
  const invalidate = () => { void qc.invalidateQueries({ queryKey: ['goals'] }); };

  const create = useMutation({
    mutationFn: createGoalApi,
    onSuccess: () => {
      invalidate(); setCreating(false);
      setForm({ name: '', amount: '', deadline: '' });
      toast.success('Цель создана');
    },
    onError: (e) => toast.error(errorMessage(e, 'Не удалось создать')),
  });

  const contribute = useMutation({
    mutationFn: ({ id, amount, note }: { id: string; amount: number; note: string }) =>
      contributeGoalApi(id, { amount, note }),
    onSuccess: (res) => {
      invalidate(); setTarget(null);
      toast.success(res.data.completed ? 'Цель достигнута' : 'Взнос записан');
    },
    onError: (e) => toast.error(errorMessage(e, 'Не удалось записать взнос')),
  });

  const remove = useMutation({
    mutationFn: deleteGoalApi,
    onSuccess: () => { invalidate(); setTarget(null); toast.success('Цель удалена'); },
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
      targetAmount: minor as number,
      ink: 4,
      icon: 'target',
      ...(form.deadline ? { deadline: form.deadline } : {}),
    });
  };

  const list = goals.data ?? [];
  const active = list.filter((g) => !g.completed);
  const done = list.filter((g) => g.completed);

  return (
    <Page
      title="Цели"
      sub="Копилки: заливка плитки — доля накопленного"
      action={<Button size="sm" variant="quiet" icon={<Plus size={15} />} onClick={() => setCreating(true)}>Цель</Button>}
    >
      {list.length === 0 && !goals.isPending && (
        <EmptyPlate
          icon={<Target size={20} />}
          title="Целей пока нет"
          description="Поставьте цель — и каждый взнос будет закрашивать плитку снизу вверх."
          action={<Button variant="bone" size="sm" onClick={() => setCreating(true)}>Создать цель</Button>}
        />
      )}

      {active.length > 0 && (
        <Section title="В работе" count={String(active.length)}>
          <PosterGrid>
            {active.map((g) => (
              <Poster
                key={g._id}
                ink={g.ink}
                ratio={g.targetAmount > 0 ? g.currentAmount / g.targetAmount : 0}
                icon={<Icon name={g.icon} size={17} />}
                title={g.name}
                amount={formatMoney(g.currentAmount, currency)}
                meta={`ИЗ ${formatMoney(g.targetAmount, currency)}`}
                flag={`${Math.round((g.currentAmount / g.targetAmount) * 100)}%`}
                onClick={() => setTarget(g)}
                ariaLabel={`${g.name}: накоплено ${formatMoney(g.currentAmount, currency)} из ${formatMoney(g.targetAmount, currency)}`}
              />
            ))}
          </PosterGrid>
        </Section>
      )}

      {done.length > 0 && (
        <Section title="Достигнуто" count={String(done.length)}>
          <PosterGrid>
            {done.map((g) => (
              <Poster
                key={g._id}
                ink={g.ink} ratio={1}
                icon={<Icon name={g.icon} size={17} />}
                title={g.name}
                amount={formatMoney(g.targetAmount, currency)}
                meta="ЦЕЛЬ ЗАКРЫТА"
                flag="ГОТОВО"
                onClick={() => setTarget(g)}
              />
            ))}
          </PosterGrid>
        </Section>
      )}

      <Sheet open={creating} onClose={() => setCreating(false)} title="Новая цель">
        <form onSubmit={submitNew} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Название" placeholder="Например: отпуск" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} autoFocus />
          <Field label="Сколько накопить" inputMode="decimal" placeholder="0" value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} error={errors.amount} />
          <Field label="Срок" type="date" value={form.deadline} hint="Необязательно"
            onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
          <Button type="submit" variant="bone" size="lg" fullWidth loading={create.isPending}>Создать</Button>
        </form>
      </Sheet>

      <AmountSheet
        open={Boolean(target) && !target?.completed}
        onClose={() => setTarget(null)}
        title={target ? `Отложить на «${target.name}»` : ''}
        hint={target ? `Осталось ${formatMoney(target.remaining, currency)}` : undefined}
        max={target?.remaining}
        currency={currency}
        submitLabel="Отложить"
        pending={contribute.isPending}
        onSubmit={(amount, note) => target && contribute.mutate({ id: target._id, amount, note })}
      />

      {target?.completed && (
        <Sheet open onClose={() => setTarget(null)} title={target.name}>
          <p style={{ color: 'var(--bone-3)', fontSize: 'var(--t-body)', lineHeight: 1.6, marginBottom: 20 }}>
            Цель закрыта: накоплено {formatMoney(target.currentAmount, currency)} за {target.contributions.length} взнос(ов).
          </p>
          <Button variant="danger" size="md" fullWidth loading={remove.isPending}
            onClick={() => remove.mutate(target._id)}>
            Удалить цель
          </Button>
        </Sheet>
      )}
    </Page>
  );
}