import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Crown, LogOut, Plus, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AccountDto } from '@accountant/shared';
import {
  acceptInviteApi, archiveAccountApi, createAccountApi, declineInviteApi,
  getAccountsApi, getInvitesApi, leaveAccountApi, searchUsersApi,
} from '../api/endpoints';
import { errorFields, errorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useDebounced } from '../hooks/useDebounced';
import Page, { Section } from '../components/shell/Page';
import Button from '../components/ui/Button';
import Sheet from '../components/ui/Sheet';
import { Field } from '../components/ui/Field';
import EmptyPlate from '../components/ui/EmptyPlate';
import AccountChat from '../components/AccountChat';
import SettlementCard from '../components/SettlementCard';
import styles from './AccountsPage.module.css';

export default function AccountsPage() {
  const currency = useAuthStore((s) => s.user?.currency ?? 'RUB');
  const activeId = useUiStore((s) => s.activeAccountId);
  const setActive = useUiStore((s) => s.setActiveAccount);
  const qc = useQueryClient();

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<{ account: AccountDto; action: 'leave' | 'archive' } | null>(null);
  const [peopleQuery, setPeopleQuery] = useState('');
  const debounced = useDebounced(peopleQuery, 400);

  const accounts = useQuery({ queryKey: ['accounts'], queryFn: () => getAccountsApi().then((r) => r.data) });
  const invites = useQuery({
    queryKey: ['invites'],
    queryFn: () => getInvitesApi().then((r) => r.data),
    refetchInterval: 60_000,
  });
  const people = useQuery({
    queryKey: ['people', debounced],
    queryFn: () => searchUsersApi(debounced).then((r) => r.data),
    enabled: debounced.trim().length >= 2,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['accounts'] });
    void qc.invalidateQueries({ queryKey: ['invites'] });
  };

  const create = useMutation({
    mutationFn: createAccountApi,
    onSuccess: () => {
      invalidate(); setCreating(false);
      setForm({ name: '', email: '' }); setPeopleQuery('');
      toast.success('Счёт создан, приглашение отправлено');
    },
    onError: (e) => { setErrors(errorFields(e)); toast.error(errorMessage(e, 'Не удалось создать счёт')); },
  });

  const accept = useMutation({ mutationFn: acceptInviteApi, onSuccess: () => { invalidate(); toast.success('Вы присоединились'); } });
  const decline = useMutation({ mutationFn: declineInviteApi, onSuccess: () => { invalidate(); toast.success('Отклонено'); } });
  const leave = useMutation({
    mutationFn: leaveAccountApi,
    onSuccess: () => { invalidate(); setActive(null); setConfirm(null); toast.success('Вы покинули счёт'); },
    onError: (e) => toast.error(errorMessage(e, 'Не удалось выйти')),
  });
  const archive = useMutation({
    mutationFn: archiveAccountApi,
    onSuccess: () => { invalidate(); setActive(null); setConfirm(null); toast.success('Счёт убран в архив'); },
    onError: (e) => toast.error(errorMessage(e, 'Не удалось архивировать')),
  });

  const submitNew = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Введите название';
    if (!form.email.trim()) next.inviteEmail = 'Укажите email участника';
    setErrors(next);
    if (Object.keys(next).length) return;
    create.mutate({ name: form.name.trim(), inviteEmail: form.email.trim() });
  };

  const list = accounts.data ?? [];
  const activeAccount = list.find((a) => a._id === activeId) ?? null;

  return (
    <Page
      title="Счета"
      sub="Личный счёт виден только вам. Совместный — всем участникам."
      action={<Button size="sm" variant="quiet" icon={<Plus size={15} />} onClick={() => setCreating(true)}>Счёт</Button>}
    >
      {(invites.data?.length ?? 0) > 0 && (
        <Section title="Приглашения" count={String(invites.data?.length)}>
          <ul className={styles.invites}>
            {invites.data?.map((inv) => (
              <li key={inv._id} className={styles.invite}>
                <div className={styles.inviteText}>
                  <p className={styles.inviteName}>{inv.name}</p>
                  <p className={styles.inviteFrom}>от {inv.owner.name}</p>
                </div>
                <Button size="sm" variant="ghost" icon={<X size={14} />} onClick={() => decline.mutate(inv._id)}>Отклонить</Button>
                <Button size="sm" variant="bone" icon={<Check size={14} />} onClick={() => accept.mutate(inv._id)}>Принять</Button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Ваши счета" count={`${list.length + 1}`}>
        <ul className={styles.list}>
          <li className={styles.item} data-current={activeId === null || undefined}>
            <button type="button" className={styles.pick} onClick={() => setActive(null)} aria-pressed={activeId === null}>
              <span className={styles.name}>Личный счёт</span>
              <span className={styles.meta}>Только вы видите эти операции</span>
            </button>
          </li>

          {list.map((a) => {
            const members = a.members.filter((m) => m.status === 'active');
            const pending = a.members.filter((m) => m.status === 'pending');
            return (
              <li key={a._id} className={styles.item} data-current={activeId === a._id || undefined}>
                <button type="button" className={styles.pick} onClick={() => setActive(a._id)} aria-pressed={activeId === a._id}>
                  <span className={styles.name}>
                    {a.name}
                    {a.role === 'owner' && <Crown size={12} aria-label="вы владелец" />}
                  </span>
                  <span className={styles.meta}>
                    {a.owner.name}{members.length > 0 && `, ${members.map((m) => m.user.name).join(', ')}`}
                    {pending.length > 0 && ` · ${pending.length} ждёт подтверждения`}
                  </span>
                </button>

                <button
                  type="button"
                  className={styles.danger}
                  aria-label={a.role === 'owner' ? `Архивировать счёт ${a.name}` : `Покинуть счёт ${a.name}`}
                  onClick={() => setConfirm({ account: a, action: a.role === 'owner' ? 'archive' : 'leave' })}
                >
                  <LogOut size={14} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      {list.length === 0 && !accounts.isPending && (
        <EmptyPlate
          icon={<Users size={20} />}
          title="Совместных счетов нет"
          description="Создайте общий счёт и пригласите партнёра — траты каждого будут видны обоим."
          action={<Button variant="bone" size="sm" onClick={() => setCreating(true)}>Создать счёт</Button>}
        />
      )}

      {activeAccount && (
        <Section title="Кто кому должен">
          <SettlementCard account={activeAccount} currency={currency} />
        </Section>
      )}

      {activeAccount && (
        <Section title="Обсуждение">
          <AccountChat accountId={activeAccount._id} accountName={activeAccount.name} />
        </Section>
      )}

      <Sheet open={creating} onClose={() => setCreating(false)} title="Совместный счёт">
        <form onSubmit={submitNew} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Название" placeholder="Например: семейный бюджет" value={form.name} autoFocus
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />

          <Field
            label="Найти участника"
            placeholder="Имя"
            value={peopleQuery}
            onChange={(e) => setPeopleQuery(e.target.value)}
            hint="Поиск по имени. Email введите вручную ниже — сервер его не раскрывает."
          />
          {(people.data?.length ?? 0) > 0 && (
            <ul className={styles.people}>
              {people.data?.map((p) => (
                <li key={p._id}><span>{p.name}</span></li>
              ))}
            </ul>
          )}

          <Field label="Email участника" type="email" placeholder="partner@example.com" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.inviteEmail} />

          <Button type="submit" variant="bone" size="lg" fullWidth loading={create.isPending}>
            Создать и пригласить
          </Button>
        </form>
      </Sheet>

      <Sheet
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title={confirm?.action === 'archive' ? 'Архивировать счёт?' : 'Покинуть счёт?'}
      >
        <p style={{ color: 'var(--bone-3)', fontSize: 'var(--t-body)', lineHeight: 1.6, marginBottom: 20 }}>
          {confirm?.action === 'archive'
            ? `«${confirm.account.name}» исчезнет из списка, но операции сохранятся и останутся привязанными к счёту. Это обратимо.`
            : `Вы перестанете видеть операции счёта «${confirm?.account.name}». Ваши записи останутся на счёте.`}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="quiet" size="md" fullWidth onClick={() => setConfirm(null)}>Отмена</Button>
          <Button
            variant="danger" size="md" fullWidth
            loading={leave.isPending || archive.isPending}
            onClick={() => {
              if (!confirm) return;
              if (confirm.action === 'archive') archive.mutate(confirm.account._id);
              else leave.mutate(confirm.account._id);
            }}
          >
            {confirm?.action === 'archive' ? 'Архивировать' : 'Выйти'}
          </Button>
        </div>
      </Sheet>
    </Page>
  );
}undefined