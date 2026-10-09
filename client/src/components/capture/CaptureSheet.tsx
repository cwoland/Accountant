import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { parseMinor, CURRENCY_SYMBOL } from '@accountant/shared';
import { categorizeApi, createTransactionApi, getCategoriesApi, type TxBody } from '../../api/endpoints';
import { errorFields, errorMessage } from '../../api/client';
import { enqueue } from '../../lib/offlineQueue';
import { useOnline } from '../../hooks/useOnline';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import Sheet from '../ui/Sheet';
import Button from '../ui/Button';
import { Field } from '../ui/Field';
import Icon from '../ui/Icon';
import styles from './CaptureSheet.module.css';

const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Самый частый жест в продукте. Правила, которым подчинён экран:
 * сумма в фокусе сразу, категория выбирается одним тапом по сетке
 * (а не из выпадающего списка), и форма работает офлайн без оговорок.
 */
export default function CaptureSheet() {
  const mode = useUiStore((s) => s.capture);
  const close = useUiStore((s) => s.closeCapture);
  const accountId = useUiStore((s) => s.activeAccountId);
  const currency = useAuthStore((s) => s.user?.currency ?? 'RUB');
  const online = useOnline();
  const qc = useQueryClient();

  const open = mode === 'expense' || mode === 'income';
  const type = mode === 'income' ? 'income' : 'expense';

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount(''); setCategoryId(''); setDescription('');
    setDate(todayISO()); setErrors({});
  }, [open, type]);

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategoriesApi().then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const visible = useMemo(
    () => (categories.data ?? []).filter((c) => c.type === type || c.type === 'both'),
    [categories.data, type],
  );

  const create = useMutation({
    mutationFn: (body: TxBody) => createTransactionApi(body).then((r) => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transactions'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
      void qc.invalidateQueries({ queryKey: ['pending'] });
      toast.success(type === 'income' ? 'Доход записан' : 'Трата записана');
      close();
    },
    onError: (err) => {
      setErrors(errorFields(err));
      toast.error(errorMessage(err, 'Не удалось записать'));
    },
  });

  const askAi = async () => {
    if (!description.trim()) {
      setErrors({ description: 'Добавьте описание — по нему ИИ определит категорию' });
      return;
    }
    setAiBusy(true);
    try {
      // Сервер возвращает id категории, а не её имя: раньше клиент искал
      // категорию по строке ответа модели и промахивался на любом отклонении.
      const { data } = await categorizeApi(description.trim());
      if (data.categoryId) {
        setCategoryId(data.categoryId);
        toast.success(`Категория: ${data.name}`);
      } else {
        toast('Не удалось определить — выберите вручную');
      }
    } catch (err) {
      toast.error(errorMessage(err, 'ИИ недоступен'));
    } finally {
      setAiBusy(false);
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (create.isPending) return;

    const minor = parseMinor(amount);
    const next: Record<string, string> = {};
    if (minor === null || minor <= 0) next.amount = 'Введите сумму больше нуля';
    if (!categoryId) next.category = 'Выберите категорию';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const body: TxBody = {
      accountId: accountId ?? null,
      type,
      amount: minor as number,
      category: categoryId,
      description: description.trim(),
      date,
    };

    if (!online) {
      // В очередь уходит И accountId: раньше его добавляли только в онлайн-ветке,
      // и запись, сделанная офлайн по семейному счёту, приземлялась в личный.
      await enqueue(body);
      await qc.invalidateQueries({ queryKey: ['pending'] });
      toast('Сохранено офлайн — отправим, когда появится сеть');
      close();
      return;
    }

    create.mutate(body);
  };

  return (
    <Sheet open={open} onClose={close} title={type === 'income' ? 'Новый доход' : 'Новая трата'}>
      <form onSubmit={submit} className={styles.form}>
        {!online && (
          <p className={styles.offline} role="status">
            <WifiOff size={15} aria-hidden />
            Офлайн. Запись встанет в очередь и уйдёт при первой же сети.
          </p>
        )}

        <div className={styles.types} role="radiogroup" aria-label="Тип операции">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={type === t}
              className={styles.type}
              onClick={() => useUiStore.getState().openCapture(t)}
            >
              {t === 'expense' ? 'Расход' : 'Доход'}
            </button>
          ))}
        </div>

        <Field
          label="Сумма"
          inputMode="decimal"
          autoFocus
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          suffix={CURRENCY_SYMBOL[currency]}
          className={styles.amount}
        />

        <div className={styles.descWrap}>
          <Field
            label="Описание"
            placeholder="Например: продукты в Пятёрочке"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
          />
          <button type="button" onClick={askAi} disabled={aiBusy} className={styles.ai}>
            <Sparkles size={12} aria-hidden />
            {aiBusy ? '…' : 'ИИ'}
          </button>
        </div>

        {/* Категория — сетка в один тап, а не выпадающий список: в списке
            из 24 пунктов выбор на телефоне стоит трёх взаимодействий. */}
        <fieldset className={styles.cats}>
          <legend className={styles.legend}>Категория</legend>
          <div className={styles.grid}>
            {visible.map((c) => (
              <button
                key={c._id}
                type="button"
                aria-pressed={categoryId === c._id}
                className={styles.cat}
                style={{ ['--ink' as string]: `var(--ink-${c.ink})` }}
                onClick={() => { setCategoryId(c._id); setErrors((p) => ({ ...p, category: '' })); }}
              >
                <Icon name={c.icon} size={17} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
          {errors.category && <p className={styles.err} role="alert">{errors.category}</p>}
        </fieldset>

        <Field
          label="Дата"
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
        />

        <Button type="submit" variant="bone" size="lg" fullWidth loading={create.isPending}>
          {online ? 'Записать' : 'Сохранить офлайн'}
        </Button>
      </form>
    </Sheet>
  );
}
