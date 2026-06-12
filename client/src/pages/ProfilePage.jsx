import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Wallet, Globe, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfileApi, changePasswordApi } from '../api/auth';
import useStore from '../store/useStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';

const FADE = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const CURRENCIES = [
  { value: 'RUB', label: '🇷🇺 Российский рубль (₽)' },
  { value: 'USD', label: '🇺🇸 Доллар США ($)' },
  { value: 'EUR', label: '🇪🇺 Евро (€)' },
];

const AVATARS = ['👤','😊','🧑‍💻','👨‍💼','👩‍💼','🧑‍🎓','🦊','🐼','🦁','🐯','🦅','🌟'];

export default function ProfilePage() {
  const { user, setUser } = useStore();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    currency: user?.currency || 'RUB',
    monthlyBudget: user?.monthlyBudget || '',
    avatar: user?.avatar || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const setP = (f) => (e) => setProfileForm((prev) => ({ ...prev, [f]: e.target ? e.target.value : e }));
  const setPw = (f) => (e) => setPwForm((prev) => ({ ...prev, [f]: e.target.value }));

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { data } = await updateProfileApi({
        name: profileForm.name,
        currency: profileForm.currency,
        monthlyBudget: parseFloat(profileForm.monthlyBudget) || 0,
        avatar: profileForm.avatar,
      });
      setUser(data);
      toast.success('Профиль обновлён');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка обновления');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Введите текущий пароль';
    if (pwForm.newPassword.length < 6) errs.newPassword = 'Минимум 6 символов';
    if (pwForm.newPassword !== pwForm.confirm) errs.confirm = 'Пароли не совпадают';
    setPwErrors(errs);
    if (Object.keys(errs).length) return;

    setPwLoading(true);
    try {
      await changePasswordApi({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Пароль изменён');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка смены пароля');
    } finally {
      setPwLoading(false);
    }
  };

  const currencySymbol = { RUB: '₽', USD: '$', EUR: '€' }[profileForm.currency] || '₽';

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680 }}>

      <motion.div variants={FADE}>
        <Card style={{
          background: 'linear-gradient(135deg, var(--accent-dim), var(--surface))',
          border: '1px solid rgba(124,106,247,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'var(--accent-dim)', border: '2px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: profileForm.avatar ? '2.2rem' : '1.6rem',
                cursor: 'pointer', userSelect: 'none',
              }} onClick={() => setShowAvatarPicker((v) => !v)}>
                {profileForm.avatar || <User size={28} color="var(--accent-2)" />}
              </div>
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 22, height: 22, borderRadius: '50%',
                background: 'var(--accent)', border: '2px solid var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }} onClick={() => setShowAvatarPicker((v) => !v)}>
                <Camera size={10} color="#fff" />
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', marginTop: 3 }}>{user?.email}</p>
              <p style={{ color: 'var(--accent-2)', fontSize: '0.78rem', marginTop: 6, cursor: 'pointer' }}
                onClick={() => setShowAvatarPicker((v) => !v)}>
                Изменить аватар
              </p>
            </div>
          </div>

          {showAvatarPicker && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 16, padding: 12,
                background: 'var(--surface-2)', borderRadius: 'var(--radius-m)',
                border: '1px solid var(--border)',
                display: 'flex', flexWrap: 'wrap', gap: 8,
              }}>
              {AVATARS.map((a) => (
                <button key={a} onClick={() => { setProfileForm((f) => ({ ...f, avatar: a })); setShowAvatarPicker(false); }}
                  style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-s)',
                    fontSize: '1.4rem', cursor: 'pointer',
                    background: profileForm.avatar === a ? 'var(--accent-dim)' : 'var(--surface)',
                    border: profileForm.avatar === a ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'var(--transition)',
                  }}>
                  {a}
                </button>
              ))}
              <button onClick={() => { setProfileForm((f) => ({ ...f, avatar: '' })); setShowAvatarPicker(false); }}
                style={{
                  padding: '0 12px', height: 40, borderRadius: 'var(--radius-s)',
                  fontSize: '0.72rem', cursor: 'pointer', color: 'var(--text-3)',
                  background: 'var(--surface)', border: '2px solid transparent',
                  fontWeight: 600,
                }}>
                Сбросить
              </button>
            </motion.div>
          )}
        </Card>
      </motion.div>

      <motion.div variants={FADE}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-s)',
              background: 'var(--accent-dim)', color: 'var(--accent-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={17} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Личные данные</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 1 }}>Имя, валюта, бюджет</p>
            </div>
          </div>

          <form onSubmit={handleProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Имя" value={profileForm.name}
              onChange={setP('name')} icon={<User size={16} />} required />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Select label="Валюта" value={profileForm.currency}
                onChange={(e) => setProfileForm((f) => ({ ...f, currency: e.target.value }))}
                options={CURRENCIES}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{
                  fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  fontFamily: 'var(--font-display)',
                }}>Бюджет месяца</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 13, top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: '0.9rem',
                  }}>{currencySymbol}</span>
                  <input
                    type="number" min="0" placeholder="0"
                    value={profileForm.monthlyBudget}
                    onChange={setP('monthlyBudget')}
                    style={{
                      width: '100%', background: 'var(--surface)',
                      border: '1px solid var(--border-2)', borderRadius: 'var(--radius-m)',
                      padding: '12px 14px 12px 30px', color: 'var(--text-1)', fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{
                fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)',
                letterSpacing: '0.05em', textTransform: 'uppercase',
                fontFamily: 'var(--font-display)',
              }}>Email</label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '12px 14px',
                color: 'var(--text-3)', fontSize: '0.9rem',
              }}>
                <Mail size={16} color="var(--text-3)" />
                {user?.email}
              </div>
            </div>

            <Button type="submit" icon={<Save size={15} />} loading={profileLoading}>
              Сохранить изменения
            </Button>
          </form>
        </Card>
      </motion.div>

      <motion.div variants={FADE}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-s)',
              background: 'var(--amber-dim)', color: 'var(--amber)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lock size={17} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Безопасность</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 1 }}>Смена пароля</p>
            </div>
          </div>

          <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Текущий пароль" type="password"
              placeholder="Введите текущий пароль"
              value={pwForm.currentPassword} onChange={setPw('currentPassword')}
              error={pwErrors.currentPassword} icon={<Lock size={16} />} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="Новый пароль" type="password"
                placeholder="Минимум 6 символов"
                value={pwForm.newPassword} onChange={setPw('newPassword')}
                error={pwErrors.newPassword} icon={<Lock size={16} />} />
              <Input label="Повторите пароль" type="password"
                placeholder="Ещё раз"
                value={pwForm.confirm} onChange={setPw('confirm')}
                error={pwErrors.confirm} icon={<Lock size={16} />} />
            </div>
            <Button type="submit" variant="secondary" icon={<Lock size={15} />} loading={pwLoading}>
              Сменить пароль
            </Button>
          </form>
        </Card>
      </motion.div>

      <motion.div variants={FADE}>
        <Card style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-s)',
              background: 'var(--green-dim)', color: 'var(--green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Globe size={17} />
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>О приложении</p>
          </div>
          {[
            { label: 'Версия', value: '1.0.0' },
            { label: 'Стек', value: 'React · Node.js · MongoDB' },
            { label: 'ИИ-модель', value: 'Nex N2 Pro (OpenRouter)' },
            { label: 'Хостинг', value: 'Vercel (frontend) · Render (backend)' },
          ].map((r) => (
            <div key={r.label} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '8px 0', borderTop: '1px solid var(--border)',
              fontSize: '0.82rem',
            }}>
              <span style={{ color: 'var(--text-3)' }}>{r.label}</span>
              <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{r.value}</span>
            </div>
          ))}
        </Card>
      </motion.div>
    </motion.div>
  );
}