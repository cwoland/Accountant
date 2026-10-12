import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { forgotPasswordApi, resetPasswordApi } from '../api/endpoints';
import { errorFields, errorMessage } from '../api/client';
import AuthLayout from './auth/AuthLayout';
import Button from '../components/ui/Button';
import { Field } from '../components/ui/Field';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const request = useMutation({
    mutationFn: () => forgotPasswordApi(email.trim()),
    onSuccess: ({ data }) => {
      setSent(true);
      if (data.devToken) {
        navigate(`/reset?token=${data.devToken}`, { replace: true });
        toast.success('Режим разработки: ссылка открыта сразу');
      }
    },
    onError: (err) => {
      setErrors(errorFields(err));
      toast.error(errorMessage(err, 'Не удалось отправить запрос'));
    },
  });

  const confirm = useMutation({
    mutationFn: () => resetPasswordApi({ token: token ?? '', password }),
    onSuccess: () => {
      toast.success('Пароль изменён. Войдите с новым паролем.');
      navigate('/login', { replace: true });
    },
    onError: (err) => {
      setErrors(errorFields(err));
      toast.error(errorMessage(err, 'Ссылка недействительна или истекла'));
    },
  });

  if (token) {
    const submit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (confirm.isPending) return;
      const next: Record<string, string> = {};
      if (password.length < 10) next.password = 'Минимум 10 символов';
      if (password !== repeat) next.repeat = 'Пароли не совпадают';
      setErrors(next);
      if (Object.keys(next).length > 0) return;
      confirm.mutate();
    };

    return (
      <AuthLayout title="Новый пароль" footer={<Link to="/login">Вернуться ко входу</Link>}>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field
            label="Новый пароль"
            type="password"
            autoComplete="new-password"
            autoFocus
            value={password}
            error={errors.password}
            hint="Минимум 10 символов, не только цифры"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Field
            label="Повторите"
            type="password"
            autoComplete="new-password"
            value={repeat}
            error={errors.repeat}
            onChange={(e) => setRepeat(e.target.value)}
          />
          <Button type="submit" variant="bone" size="lg" fullWidth loading={confirm.isPending}>
            Сохранить пароль
          </Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Восстановление" footer={<Link to="/login">Вернуться ко входу</Link>}>
      {sent ? (
        <p style={{ fontSize: 'var(--t-body)', color: 'var(--bone-3)', lineHeight: 1.6 }}>
          Если аккаунт с таким адресом существует, мы отправили ссылку для смены пароля.
          Она действует 30 минут.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (request.isPending) return;
            if (!email.trim()) {
              setErrors({ email: 'Введите email' });
              return;
            }
            setErrors({});
            request.mutate();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            error={errors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="bone" size="lg" fullWidth loading={request.isPending}>
            Прислать ссылку
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
