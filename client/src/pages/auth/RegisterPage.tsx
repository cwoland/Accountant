import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerApi } from '../../api/endpoints';
import { errorFields, errorMessage } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import AuthLayout from './AuthLayout';
import Button from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: '', email: '', password: '', repeat: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Введите имя';
    if (!form.email.trim()) next.email = 'Введите email';
    if (form.password.length < 10) next.password = 'Минимум 10 символов';
    if (form.password !== form.repeat) next.repeat = 'Пароли не совпадают';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const { data } = await registerApi({
        name: form.name.trim(), email: form.email.trim(), password: form.password,
      });
      setAuth(data.user, data.token);
      navigate('/welcome', { replace: true });
    } catch (err) {
      setErrors(errorFields(err));
      toast.error(errorMessage(err, 'Не удалось зарегистрироваться'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Регистрация" footer={<>Уже есть аккаунт? <Link to="/login">Войти</Link></>}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Имя" autoComplete="name" autoFocus value={form.name} error={errors.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Field label="Email" type="email" autoComplete="email" value={form.email} error={errors.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <Field label="Пароль" type="password" autoComplete="new-password" value={form.password} error={errors.password}
          hint="Минимум 10 символов, не только цифры"
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        <Field label="Повторите" type="password" autoComplete="new-password" value={form.repeat} error={errors.repeat}
          onChange={(e) => setForm((f) => ({ ...f, repeat: e.target.value }))} />
        <Button type="submit" variant="bone" size="lg" fullWidth loading={loading}>Создать аккаунт</Button>
      </form>
    </AuthLayout>
  );
}
