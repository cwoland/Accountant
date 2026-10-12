import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginApi } from '../../api/endpoints';
import { errorFields, errorMessage } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import AuthLayout from './AuthLayout';
import Button from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const expired = params.get('expired') === '1';
  const next = params.get('next') ?? '/';

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const next_: Record<string, string> = {};
    if (!form.email.trim()) next_.email = 'Введите email';
    if (!form.password) next_.password = 'Введите пароль';
    setErrors(next_);
    if (Object.keys(next_).length) return;

    setLoading(true);
    try {
      const { data } = await loginApi({ email: form.email.trim(), password: form.password });
      setAuth(data.user, data.token);
      navigate(decodeURIComponent(next), { replace: true });
    } catch (err) {
      setErrors(errorFields(err));
      toast.error(errorMessage(err, 'Не удалось войти'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Вход"
      footer={<>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></>}
    >
      {expired && <p role="status" style={{ color: 'var(--warn)', fontSize: 'var(--t-meta)' }}>
        Сессия истекла — войдите снова.
      </p>}
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Email" type="email" autoComplete="email" autoFocus value={form.email} error={errors.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <Field label="Пароль" type="password" autoComplete="current-password" value={form.password} error={errors.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        <Button type="submit" variant="bone" size="lg" fullWidth loading={loading}>Войти</Button>
      </form>
    </AuthLayout>
  );
}