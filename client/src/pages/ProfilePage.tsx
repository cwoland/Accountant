import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Bell, BellOff, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { CURRENCIES, CURRENCY_SYMBOL, formatMoney, parseMinor, type Currency } from '@accountant/shared';
import { changePasswordApi, updateProfileApi } from '../api/endpoints';
import { errorFields, errorMessage } from '../api/client';
import { subscribeToPush, unsubscribeFromPush } from '../utils/push';
import { useAuthStore } from '../store/authStore';
import Page, { Section } from '../components/shell/Page';
import Button from '../components/ui/Button';
import { Field, SelectField } from '../components/ui/Field';

const CURRENCY_NAMES: Record<Currency, string> = {
  RUB: 'Российский рубль',
  USD: 'Доллар США',
  EUR: 'Евро',
};

export default function ProfilePage() {
  const { user, setUser, setAuth, logout } = useAuthStore();
  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    currency: (user?.currency ?? 'RUB') as Currency,
    budget: user ? String(user.monthlyBudget / 100) : '',
  });
  const [pw, setPw] = useState({ current: '', next: '', repeat: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pushOn, setPushOn] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    void navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setPushOn(Boolean(sub)))
      .catch(() => setPushOn(false));
  }, []);

  const saveProfile = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (res) => { setUser(res.data); toast.success('Сохранено'); },
    onError: (e) => { setErrors(errorFields(e)); toast.error(errorMessage(e, 'Не удалось сохранить')); },
  });

  const savePassword = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.token);
      setPw({ current: '', next: '', repeat: '' });
      toast.success('Пароль изменён. Остальные устройства разлогинены.');
    },
    onError: (e) => { setErrors(errorFields(e)); toast.error(errorMessage(e, 'Не удалось сменить пароль')); },
  });

  const submitProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const minor = profile.budget.trim() ? parseMinor(profile.budget) : 0;
    if (minor === null) { setErrors({ monthlyBudget: 'Некорректная сумма' }); return; }
    setErrors({});
    saveProfile.mutate({ name: profile.name.trim(), currency: profile.currency, monthlyBudget: minor });
  };

  const submitPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pw.next !== pw.repeat) { setErrors({ repeat: 'Пароли не совпадают' }); return; }
    setErrors({});
    savePassword.mutate({ currentPassword: pw.current, newPassword: pw.next });
  };

  const togglePush = async () => {
    if (pushOn) { await unsubscribeFromPush(); setPushOn(false); toast.success('Уведомления выключены'); return; }
    const ok = await subscribeToPush();
    setPushOn(ok);
    toast[ok ? 'success' : 'error'](ok ? 'Уведомления включены' : 'Браузер не дал разрешение');
  };

  return (
    <Page title="Профиль" sub={user?.email}>
      <Section title="Основное">
        <form onSubmit={submitProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 var(--pad)' }}>
          <Field label="Имя" value={profile.name} error={errors.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />

          <SelectField
            label="Валюта"
            value={profile.currency}
            onChange={(e) => setProfile((p) => ({ ...p, currency: e.target.value as Currency }))}
            options={CURRENCIES.map((c) => ({ value: c, label: `${CURRENCY_SYMBOL[c]}  ${CURRENCY_NAMES[c]}` }))}
          />

          <Field
            label="Бюджет на месяц"
            inputMode="decimal"
            placeholder="0"
            value={profile.budget}
            error={errors.monthlyBudget}
            suffix={CURRENCY_SYMBOL[profile.currency]}
            hint={user ? `Сейчас: ${formatMoney(user.monthlyBudget, user.currency)}` : undefined}
            onChange={(e) => setProfile((p) => ({ ...p, budget: e.target.value }))}
          />

          <Button type="submit" variant="bone" size="md" loading={saveProfile.isPending}>Сохранить</Button>
        </form>
      </Section>

      <Section title="Уведомления">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 var(--pad)' }}>
          {pushOn ? <Bell size={18} /> : <BellOff size={18} color="var(--bone-4)" />}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 'var(--t-body)', fontWeight: 700 }}>Push-уведомления</p>
            <p style={{ fontSize: '11.5px', color: 'var(--bone-3)', marginTop: 2 }}>
              Обязательные платежи, итоги месяца, сообщения в чате
            </p>
          </div>
          <Button variant={pushOn ? 'quiet' : 'bone'} size="sm" onClick={() => void togglePush()}>
            {pushOn ? 'Выключить' : 'Включить'}
          </Button>
        </div>
      </Section>

      <Section title="Безопасность">
        <form onSubmit={submitPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 var(--pad)' }}>
          <Field label="Текущий пароль" type="password" autoComplete="current-password"
            value={pw.current} error={errors.currentPassword}
            onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} />
          <Field label="Новый пароль" type="password" autoComplete="new-password"
            value={pw.next} error={errors.newPassword} hint="Минимум 10 символов, не только цифры"
            onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} />
          <Field label="Повторите" type="password" autoComplete="new-password"
            value={pw.repeat} error={errors.repeat}
            onChange={(e) => setPw((p) => ({ ...p, repeat: e.target.value }))} />
          <Button type="submit" variant="quiet" size="md" loading={savePassword.isPending}>Сменить пароль</Button>
        </form>
      </Section>

      <Section title="Сессия">
        <div style={{ padding: '0 var(--pad)' }}>
          <Button variant="danger" size="md" icon={<LogOut size={15} />} onClick={logout}>Выйти из аккаунта</Button>
        </div>
      </Section>
    </Page>
  );
}