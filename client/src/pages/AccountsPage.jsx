import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, User, Check, X, LogOut, Trash2, Crown, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    getAccountsApi, getInvitesApi, createAccountApi,
    acceptInviteApi, declineInviteApi, leaveAccountApi, deleteAccountApi,
} from '../api/accounts';
import { searchUsersApi } from '../api/users';
import useAccountChat from '../hooks/useAccountChat';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import AccountChat from '../components/AccountChat';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';

const FADE = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AccountsPage() {
    const { user, activeAccountId, setActiveAccount } = useStore();
    const qc = useQueryClient();
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ name: '', inviteEmail: '' });
    const [userSearch, setUserSearch] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchTimer = useRef(null);

    const { data: accounts = [], isLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => getAccountsApi().then((r) => r.data),
    });

    const { data: invites = [] } = useQuery({
        queryKey: ['invites'],
        queryFn: () => getInvitesApi().then((r) => r.data),
        refetchInterval: 30000,
    });

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ['accounts'] });
        qc.invalidateQueries({ queryKey: ['invites'] });
    };

    const create = useMutation({
        mutationFn: createAccountApi,
        onSuccess: () => { toast.success('Счёт создан, приглашение отправлено!'); invalidate(); setModal(false); },
        onError: (e) => toast.error(e.response?.data?.message || 'Ошибка'),
    });

    const accept = useMutation({
        mutationFn: acceptInviteApi,
        onSuccess: () => { toast.success('Вы присоединились к счёту!'); invalidate(); },
        onError: (e) => toast.error(e.response?.data?.message || 'Ошибка'),
    });

    const decline = useMutation({
        mutationFn: declineInviteApi,
        onSuccess: () => { toast.success('Приглашение отклонено'); invalidate(); },
    });

    const leave = useMutation({
        mutationFn: leaveAccountApi,
        onSuccess: () => { toast.success('Вы покинули счёт'); setActiveAccount: null; invalidate(); },
    });

    const remove = useMutation({
        mutationFn: deleteAccountApi,
        onSuccess: () => { toast.success('Счёт удалён'); setActiveAccount(null); invalidate(); },
    });

    const isOwner = (acc) => acc.owner._id === user?._id || acc.owner === user?._id;

    useEffect(() => {
      if (!userSearch || userSearch.length < 2) { setUserResults([]); return; }
      clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const { data } = await searchUsersApi(userSearch);
          setUserResults(data);
        } catch {}
        finally { setSearchLoading(false); }
      }, 400);
      return () => clearTimeout(searchTimer.current);
    }, [userSearch]);

    return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Счета</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', marginTop: 3 }}>
            Личный и совместные счета
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModal(true)}>
          Создать совместный
        </Button>
      </div>

      {invites.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card style={{ border: '1px solid rgba(251,191,36,0.3)', background: 'var(--amber-dim)' }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12, color: 'var(--amber)' }}>
              Приглашения ({invites.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {invites.map((inv) => (
                <div key={inv._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', background: 'var(--surface)',
                  borderRadius: 'var(--radius-m)', gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.3rem' }}>{inv.icon}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{inv.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        от {inv.owner.name}
                      </p>
                      </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" variant="secondary"
                      icon={<X size={14} />}
                      onClick={() => decline.mutate(inv._id)}>
                      Отклонить
                    </Button>
                    <Button size="sm"
                      icon={<Check size={14} />}
                      onClick={() => accept.mutate(inv._id)}
                      style={{ background: 'var(--green)', boxShadow: '0 0 16px rgba(34,211,165,0.3)' }}>
                      Принять
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div variants={FADE} initial="hidden" animate="show">
        <Card
          onClick={() => setActiveAccount(null)}
          style={{
            border: activeAccountId === null
              ? '1px solid var(--accent)'
              : '1px solid var(--border)',
            cursor: 'pointer',
            background: activeAccountId === null ? 'var(--accent-dim)' : 'var(--surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-m)',
              background: 'var(--surface-2)', fontSize: '1.4rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={22} color="var(--text-2)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Личный счёт</p>
                {activeAccountId === null && <Badge color="accent" size="sm">Активен</Badge>}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                Только вы видите эти транзакции
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {isLoading ? <Loader text="Загружаем счета..." /> : (
        accounts.length === 0
          ? <EmptyState
              icon={<Users size={22} color={acc.color} />}
              title="Нет совместных счетов"
              description="Создайте совместный счёт и пригласите партнёра, члена семьи или друга."
              action={() => setModal(true)}
              actionLabel="Создать счёт"
            />
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {accounts.map((acc) => {
                const active = activeAccountId === acc._id;
                const owner = isOwner(acc);
                const activeMembers = acc.members.filter((m) => m.status === 'active');
                const pendingMembers = acc.members.filter((m) => m.status === 'pending');

                return (
                    <motion.div key={acc._id} variants={FADE} initial="hidden" animate="show">
                    <Card
                      onClick={() => setActiveAccount(acc._id)}
                      style={{
                        border: active ? `1px solid ${acc.color}` : '1px solid var(--border)',
                        cursor: 'pointer',
                        background: active ? `${acc.color}15` : 'var(--surface)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 'var(--radius-m)',
                          background: `${acc.color}25`, fontSize: '1.4rem', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Users size={22} color={acc.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{acc.name}</p>
                            {active && <Badge color="accent" size="sm">Активен</Badge>}
                            {owner && <Badge color="amber" size="sm"><Crown size={10} /> Владелец</Badge>}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{
                                width: 20, height: 20, borderRadius: '50%',
                                background: 'var(--accent-dim)', border: '1px solid var(--accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.6rem', fontWeight: 700, color: 'var(--accent-2)',
                              }}>
                                {acc.owner.avatar || acc.owner.name?.[0]}
                              </div>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>
                                {acc.owner.name} {owner ? '(вы)' : ''}
                              </span>
                            </div>

                            {activeMembers.map((m) => (
                              <div key={m.user._id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                  width: 20, height: 20, borderRadius: '50%',
                                  background: 'var(--green-dim)', border: '1px solid var(--green)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.6rem', fontWeight: 700, color: 'var(--green)',
                                }}>
                                  {m.user.avatar || m.user.name?.[0]}
                                </div>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>
                                  {m.user.name}
                                  {m.user._id === user?._id ? ' (вы)' : ''}
                                </span>
                              </div>
                            ))}

                            {pendingMembers.map((m) => (
                              <div key={m.user._id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Clock size={14} color="var(--amber)" />
                                <span style={{ fontSize: '0.78rem', color: 'var(--amber)' }}>
                                  {m.user.name} — ожидает подтверждения
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          {owner ? (
                            <button onClick={(e) => { e.stopPropagation(); remove.mutate(acc._id); }}
                              style={{
                                width: 30, height: 30, borderRadius: 'var(--radius-s)',
                                background: 'var(--surface-2)', color: 'var(--text-3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'var(--transition)',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                            >
                              <Trash2 size={13} />
                            </button>
                          ) : (
                            <button onClick={(e) => { e.stopPropagation(); leave.mutate(acc._id); }}
                              style={{
                               width: 30, height: 30, borderRadius: 'var(--radius-s)',
                                background: 'var(--surface-2)', color: 'var(--text-3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'var(--transition)',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = 'var(--amber)'; e.currentTarget.style.background = 'var(--amber-dim)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                            >
                              <LogOut size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
              {activeAccountId && <AccountChat accountId={activeAccountId} accounts={accounts} />}
            </div>
      )}

      <Modal open={modal} onClose={() => { setModal(false); setForm({ name: '', inviteEmail: '' }); setUserSearch(''); setUserResults([]); }} title="Создать совместный счёт">
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <Input label="Название счёта" placeholder="Семейный бюджет"
      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)',
        letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
        Найти участника
      </label>
      <input
        placeholder="Имя или email..."
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
        style={{
          width: '100%', background: 'var(--surface)',
          border: '1px solid var(--border-2)', borderRadius: 'var(--radius-m)',
          padding: '12px 14px', color: 'var(--text-1)', fontSize: '0.9rem',
        }}
      />

      {searchLoading && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', padding: '4px 0' }}>Поиск...</p>
      )}
      {userResults.length > 0 && (
        <div style={{
          background: 'var(--surface-2)', borderRadius: 'var(--radius-m)',
          border: '1px solid var(--border)', overflow: 'hidden',
        }}>
          {userResults.map((u) => (
            <button key={u._id}
              onClick={() => {
                setForm(f => ({ ...f, inviteEmail: u.email }));
                setUserSearch(u.name);
                setUserResults([]);
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', cursor: 'pointer', background: 'transparent',
                borderBottom: '1px solid var(--border)', transition: 'var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--accent-dim)', border: '1px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-2)', flexShrink: 0,
              }}>
                {u.avatar || u.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {userSearch.length >= 2 && !searchLoading && userResults.length === 0 && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Пользователь не найден</p>
      )}

      {form.inviteEmail && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', background: 'var(--green-dim)',
          borderRadius: 'var(--radius-s)', border: '1px solid rgba(34,211,165,0.25)',
        }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--green)' }}>
            ✓ {form.inviteEmail}
          </span>
          <button onClick={() => { setForm(f => ({ ...f, inviteEmail: '' })); setUserSearch(''); }}
            style={{ color: 'var(--text-3)', cursor: 'pointer', fontSize: '1rem', background: 'none', border: 'none' }}>
            ×
          </button>
        </div>
      )}
    </div>

    <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
      Участник получит приглашение и сможет принять или отклонить его в разделе «Счета».
    </p>

    <Button fullWidth icon={<Users size={15} />}
      loading={create.isPending}
      onClick={() => create.mutate(form)}>
      Создать и пригласить
    </Button>
  </div>
</Modal>
    </div>
  );
}