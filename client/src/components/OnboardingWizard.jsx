import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Users, Sparkles, Smartphone, ChevronRight,
  Check, X, Download, Globe, ArrowRight,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { completeOnboardingApi, updateProfileApi } from '../api/auth';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const CURRENCIES = [
  { value: 'RUB', label: '₽', name: 'Рубль' },
  { value: 'USD', label: '$', name: 'Доллар' },
  { value: 'EUR', label: '€', name: 'Евро' },
];

function detectPlatform() {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

function useInstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  return prompt;
}

function StepWelcome({ user }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'var(--accent)', margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)',
        }}>
        <Wallet size={32} color="#fff" />
      </motion.div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.03em' }}>
        Добро пожаловать, {user?.name?.split(' ')[0]}!
      </h2>
      <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: '0.95rem' }}>
        Accountant поможет контролировать расходы, ставить цели и управлять бюджетом.
        Давай быстро настроим всё под тебя — займёт меньше минуты.
      </p>
    </div>
  );
}

function StepCurrency({ currency, setCurrency, budget, setBudget }) {
  return (
    <div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>Валюта и бюджет</h3>
      <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: 20 }}>
        Эти настройки можно изменить в профиле в любой момент.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {CURRENCIES.map((c) => (
          <button key={c.value} onClick={() => setCurrency(c.value)}
            style={{
              flex: 1, padding: '14px 8px', borderRadius: 'var(--radius-m)',
              border: `2px solid ${currency === c.value ? 'var(--accent)' : 'var(--border)'}`,
              background: currency === c.value ? 'var(--accent-dim)' : 'var(--surface)',
              cursor: 'pointer', transition: 'var(--transition)',
            }}>
            <p style={{
              fontSize: '1.4rem', fontWeight: 700, marginBottom: 4,
              color: currency === c.value ? 'var(--accent-2)' : 'var(--text-2)',
            }}>{c.label}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{c.name}</p>
          </button>
        ))}
      </div>

      <label style={{
        fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2)',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        fontFamily: 'var(--font-display)', display: 'block', marginBottom: 8,
      }}>
        Бюджет на месяц (необязательно)
      </label>
      <input
        type="number" min="0" placeholder="Например: 50000"
        value={budget} onChange={(e) => setBudget(e.target.value)}
        style={{
          width: '100%', background: 'var(--surface)',
          border: '1px solid var(--border-2)', borderRadius: 'var(--radius-m)',
          padding: '12px 14px', color: 'var(--text-1)', fontSize: '1rem',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function StepAccounts() {
  const features = [
    { icon: '👤', title: 'Личный счёт', desc: 'Только твои доходы и расходы. Приватно.' },
    { icon: '👥', title: 'Совместный счёт', desc: 'Общий бюджет с партнёром, семьёй или командой.' },
    { icon: '🔄', title: 'Переключение', desc: 'Переключайся между счетами в любой момент через шапку.' },
  ];
  return (
    <div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>Счета</h3>
      <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: 20 }}>
        В Accountant можно вести несколько счетов одновременно.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {features.map((f) => (
          <div key={f.title} style={{
            display: 'flex', gap: 14, alignItems: 'flex-start',
            padding: '14px 16px', borderRadius: 'var(--radius-m)',
            background: 'var(--surface)', border: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{f.icon}</span>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 3 }}>{f.title}</p>
              <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepAI() {
  const features = [
    { emoji: '🤖', text: 'Анализирует расходы и находит паттерны' },
    { emoji: '💡', text: 'Советы по оптимизации бюджета' },
    { emoji: '🏷️', text: 'Автоматическая категоризация транзакций' },
    { emoji: '📊', text: 'Прогнозирует расходы на конец месяца' },
  ];
  return (
    <div>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'var(--accent)', margin: '0 0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow-glow)',
      }}>
        <Sparkles size={26} color="#fff" />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>ИИ-советник</h3>
      <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: 20 }}>
        Встроенный ИИ помогает принимать финансовые решения.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {features.map((f) => (
          <div key={f.text} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 'var(--radius-m)',
            background: 'var(--accent-dim)', border: '1px solid rgba(124,106,247,0.2)',
          }}>
            <span style={{ fontSize: '1.1rem' }}>{f.emoji}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{f.text}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 16 }}>
        Найди его в разделе <strong style={{ color: 'var(--accent-2)' }}>Советник</strong> в меню.
      </p>
    </div>
  );
}

function StepPWA() {
  const platform = detectPlatform();
  const installPrompt = useInstallPrompt();
  const [installed, setInstalled] = useState(false);

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') setInstalled(true);
    }
  };

  return (
    <div>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'var(--surface)', border: '1px solid var(--border)',
        margin: '0 0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Smartphone size={26} color="var(--accent-2)" />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>
        Установи приложение
      </h3>
      <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: 20 }}>
        Accountant работает как нативное приложение — без браузерной строки, с офлайн-режимом.
      </p>

      {platform === 'ios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { step: '1', text: 'Нажми кнопку «Поделиться»', sub: 'Квадрат со стрелкой вверх внизу Safari' },
            { step: '2', text: 'Выбери «На экран Домой»', sub: 'Прокрути список действий вниз' },
            { step: '3', text: 'Нажми «Добавить»', sub: 'Иконка появится на главном экране' },
          ].map((s) => (
            <div key={s.step} style={{
              display: 'flex', gap: 14, alignItems: 'flex-start',
              padding: '12px 14px', borderRadius: 'var(--radius-m)',
              background: 'var(--surface)', border: '1px solid var(--border)',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
              }}>{s.step}</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.text}</p>
                <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: 2 }}>{s.sub}</p>
              </div>
            </div>
          ))}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 4, textAlign: 'center' }}>
            Работает только в Safari
          </p>
        </div>
      )}

      {platform === 'android' && (
        installed ? (
          <div style={{
            padding: '20px', borderRadius: 'var(--radius-m)',
            background: 'var(--green-dim)', border: '1px solid rgba(34,211,165,0.3)',
            textAlign: 'center',
          }}>
            <Check size={28} color="var(--green)" style={{ margin: '0 auto 8px', display: 'block' }} />
            <p style={{ fontWeight: 600, color: 'var(--green)' }}>Приложение установлено!</p>
          </div>
        ) : (
          <button onClick={handleInstall} style={{
            width: '100%', padding: '14px',
            borderRadius: 'var(--radius-m)',
            background: 'var(--accent)', color: '#fff',
            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            border: 'none', boxShadow: 'var(--shadow-glow)',
          }}>
            <Download size={18} />
            Установить Accountant
          </button>
        )
      )}

      {platform === 'desktop' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            padding: '14px 16px', borderRadius: 'var(--radius-m)',
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', gap: 12, alignItems: 'center',
          }}>
            <Globe size={20} color="var(--text-3)" />
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>Chrome / Edge</p>
              <p style={{ color: 'var(--text-3)', fontSize: '0.78rem', marginTop: 2 }}>
                Нажми иконку установки (⊕) в адресной строке браузера
              </p>
            </div>
          </div>
          {installPrompt && (
            <button onClick={handleInstall} style={{
              width: '100%', padding: '12px',
              borderRadius: 'var(--radius-m)',
              background: 'var(--accent)', color: '#fff',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              border: 'none',
            }}>
              <Download size={16} />
              Установить сейчас
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const STEPS = [
  { id: 'welcome',  label: 'Начало' },
  { id: 'currency', label: 'Бюджет' },
  { id: 'accounts', label: 'Счета' },
  { id: 'ai',       label: 'ИИ' },
  { id: 'pwa',      label: 'Приложение' },
];

export default function OnboardingWizard() {
  const { user, setUser } = useStore();
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState(user?.currency || 'RUB');
  const [budget, setBudget] = useState('');
  const [direction, setDirection] = useState(1);

  const goTo = (next) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const saveProfile = useMutation({
    mutationFn: () => updateProfileApi({
      currency,
      monthlyBudget: parseFloat(budget) || 0,
    }),
    onSuccess: ({ data }) => setUser({ ...user, ...data }),
  });

  const complete = useMutation({
    mutationFn: completeOnboardingApi,
    onSuccess: ({ data }) => {
      setUser({ ...user, ...data, onboardingCompleted: true });
      toast.success('Настройка завершена!');
    },
    onError: () => toast.error('Ошибка. Попробуй ещё раз.'),
  });

  const handleNext = async () => {
    if (step === 1) await saveProfile.mutateAsync();
    if (step === STEPS.length - 1) { complete.mutate(); return; }
    goTo(step + 1);
  };

  const handleSkip = () => {
    complete.mutate();
  };

  const isLast = step === STEPS.length - 1;

  const variants = {
    enter:  (d) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit:   (d) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-l)',
          width: '100%', maxWidth: 440,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>

        <div style={{ padding: '20px 24px 0' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{
                flex: 1, height: 3, borderRadius: 99,
                background: i <= step ? 'var(--accent)' : 'var(--surface-2)',
                transition: 'var(--transition)',
              }} />
            ))}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginTop: 14,
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600 }}>
              {step + 1} / {STEPS.length}
            </span>
            <button onClick={handleSkip} style={{
              fontSize: '0.78rem', color: 'var(--text-3)', cursor: 'pointer',
              background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Пропустить <X size={13} />
            </button>
          </div>
        </div>

        <div style={{ padding: '24px', minHeight: 320, overflow: 'hidden' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              {step === 0 && <StepWelcome user={user} />}
              {step === 1 && <StepCurrency currency={currency} setCurrency={setCurrency} budget={budget} setBudget={setBudget} />}
              {step === 2 && <StepAccounts />}
              {step === 3 && <StepAI />}
              {step === 4 && <StepPWA />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{
          padding: '0 24px 24px',
          display: 'flex', gap: 10,
        }}>
          {step > 0 && (
            <button onClick={() => goTo(step - 1)} style={{
              padding: '12px 20px', borderRadius: 'var(--radius-m)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-2)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
            }}>
              Назад
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={complete.isPending || saveProfile.isPending}
            style={{
              flex: 1, padding: '12px',
              borderRadius: 'var(--radius-m)',
              background: 'var(--accent)', color: '#fff',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              border: 'none', boxShadow: 'var(--shadow-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              opacity: complete.isPending ? 0.7 : 1,
              transition: 'var(--transition)',
            }}>
            {isLast
              ? (complete.isPending ? 'Сохраняем...' : 'Начать работу')
              : 'Далее'}
            {!isLast && <ChevronRight size={16} />}
            {isLast && !complete.isPending && <ArrowRight size={16} />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}