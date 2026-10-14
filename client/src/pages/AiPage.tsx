import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Sparkles } from 'lucide-react';
import { formatMoney } from '@accountant/shared';
import { askAiApi } from '../api/endpoints';
import { errorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import Page from '../components/shell/Page';
import styles from './AiPage.module.css';

interface Turn { id: string; role: 'me' | 'ai'; text: string; basis?: string; pending?: boolean }

const QUICK = [
  { id: 'analyze', label: 'Разбор месяца', question: undefined },
  { id: 'cut', label: 'Где сократить', question: 'На чём мне реально сократить расходы в этом месяце?' },
  { id: 'save', label: 'Как накопить', question: 'Сколько я могу откладывать каждый месяц без ущерба?' },
] as const;

export default function AiPage() {
  const user = useAuthStore((s) => s.user);
  const accountId = useUiStore((s) => s.activeAccountId);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [turns]);

  const ask = useMutation({
    mutationFn: (question?: string) =>
      askAiApi({ ...(question ? { question } : {}), ...(accountId ? { accountId } : {}) }).then((r) => r.data),
    onMutate: (question) => {
      const pendingId = `p-${Date.now()}`;
      setTurns((t) => [
        ...t,
        ...(question ? [{ id: `m-${Date.now()}`, role: 'me' as const, text: question }] : []),
        { id: pendingId, role: 'ai' as const, text: '', pending: true },
      ]);
      return { pendingId };
    },
    onSuccess: (data, _q, ctx) => {
      const basis = `за период: доходы ${formatMoney(data.basis.income, user?.currency ?? 'RUB')}, расходы ${formatMoney(data.basis.expense, user?.currency ?? 'RUB')}`;
      setTurns((t) => t.map((x) => (x.id === ctx?.pendingId ? { ...x, text: data.text, basis, pending: false } : x)));
    },
    onError: (err, _q, ctx) => {
      setTurns((t) => t.map((x) =>
        x.id === ctx?.pendingId ? { ...x, text: errorMessage(err, 'Советник не ответил'), pending: false } : x));
    },
  });

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || ask.isPending) return;
    setInput('');
    ask.mutate(q);
  };

  return (
    <Page title="Советник" sub="Считает по вашим реальным операциям за текущий месяц">
      <div className={styles.quick}>
        {QUICK.map((q) => (
          <button key={q.id} type="button" className={styles.chip} disabled={ask.isPending}
            onClick={() => ask.mutate(q.question)}>
            <Sparkles size={13} aria-hidden /> {q.label}
          </button>
        ))}
      </div>

      <div className={styles.log} role="log" aria-live="polite">
        {turns.length === 0 && (
          <p className={styles.intro}>
            Спросите что угодно о своих финансах — или нажмите кнопку выше.
            Ответ строится только на ваших операциях; выдуманных цифр здесь не будет.
          </p>
        )}
        {turns.map((t) => (
          <div key={t.id} className={styles.turn} data-role={t.role}>
            {t.pending ? (
              <span className={styles.dots} aria-label="Советник думает"><i /><i /><i /></span>
            ) : (
              <>
                <p className={styles.text}>{t.text}</p>
                {t.basis && <p className={styles.basis}>{t.basis}</p>}
              </>
            )}
          </div>
        ))}
        <div ref={bottom} />
      </div>

      <form className={styles.compose} onSubmit={send}>
        <input className={styles.input} value={input} placeholder="Ваш вопрос" aria-label="Вопрос советнику"
          onChange={(e) => setInput(e.target.value)} />
        <button type="submit" className={styles.send} disabled={!input.trim() || ask.isPending} aria-label="Спросить">
          <Send size={16} aria-hidden />
        </button>
      </form>
    </Page>
  );
}
