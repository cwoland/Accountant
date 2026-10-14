import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CURRENCIES, CURRENCY_SYMBOL, parseMinor, type Currency } from '@accountant/shared';
import { completeOnboardingApi, updateProfileApi } from '../api/endpoints';
import { errorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import styles from './OnboardingPage.module.css';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [currency, setCurrency] = useState<Currency>(user?.currency ?? 'RUB');
  const [budget, setBudget] = useState('');

  const finish = useMutation({
    mutationFn: async () => {
      const minor = budget.trim() ? parseMinor(budget) : 0;
      if (minor !== null) await updateProfileApi({ currency, monthlyBudget: minor });
      const { data } = await completeOnboardingApi();
      return data;
    },
    onSuccess: (u) => { setUser(u); navigate('/', { replace: true }); },
    onError: (e) => toast.error(errorMessage(e, 'Не удалось сохранить')),
  });

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.kicker}>Настройка · 1 минута</p>
        <h1 className={styles.title}>Привет, {user?.name?.split(' ')[0]}</h1>
        <p className={styles.text}>
          Два вопроса, и стена начнёт показывать, где вы относительно плана.
          Всё это меняется в профиле в любой момент.
        </p>

        <fieldset className={styles.currencies}>
          <legend className={styles.legend}>Валюта</legend>
          {CURRENCIES.map((c) => (
            <button key={c} type="button" aria-pressed={currency === c}
              className={styles.currency} onClick={() => setCurrency(c)}>
              <span className={styles.symbol}>{CURRENCY_SYMBOL[c]}</span>
              <span>{c}</span>
            </button>
          ))}
        </fieldset>

        <Field
          label="Бюджет на месяц"
          inputMode="decimal"
          placeholder="Например: 45000"
          value={budget}
          suffix={CURRENCY_SYMBOL[currency]}
          hint="Можно пропустить — но без него «осталось» считается от нуля"
          onChange={(e) => setBudget(e.target.value)}
        />

        <Button variant="bone" size="lg" fullWidth loading={finish.isPending} onClick={() => finish.mutate()}>
          Открыть стену
        </Button>
      </div>
    </div>
  );
}
