import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerApi } from '../../api/auth';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function RegisterPage() {
    const navigate = useNavigate();
    const setAuth = useStore((s) => s.setAuth);
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Введите имя';
        if (!form.email) e.email = 'Введите email';
        if (form.password.length < 8) e.password = 'Минимум 8 символов';
        if (form.password !== form.confirm) e.confirm = 'Пароли должны совпадать';
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const { data } = await registerApi({
                name: form.name, email: form.email, password: form.password,
            });
            setAuth(data, data.token);
            toast.success('Аккаунт создан!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="mesh-bg"><span /><span /><span /></div>

            <motion.div
            className="auth-brand"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{
                background: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', padding: '60px 52px',
                position: 'relative', overflow: 'hidden', zIndex: 1,
            }}>
                <div style={{
                    position: 'absolute', top: -80, right: -80, width: 320, height: 320,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--green-dim) 0%, transparent 70%)',
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
                        <div style={{
                            width: 44, height: 44, background: 'var(--accent)',
                            borderRadius: 'var(--radius-m)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'var(--shadow-glow)',
                        }}>
                            <Wallet size={22} color="#fff" />
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.03em' }}>
                            Accountant
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>
                        Начни контролировать<br />
                        <span style={{ color: 'var(--green)' }}>Свои деньги</span>
                    </h1>
                    <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                        Никаких лишних данных.</p>

                </div>
            </motion.div>

            <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px 32px', position: 'relative', zIndex: 1,
            }}
            >
                <div style={{ width: '100%', maxWidth: 400 }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Создать аккаунт</h2>
                    <p style={{ color: 'var(--text-2)', marginBottom: 36, fontSize: '0.9rem' }}>
                        Уже есть аккаунт?{' '}
                        <Link to="/login" style={{ color: 'var(--accent-2)', fontWeight: 600 }}>Войти</Link>
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                     <Input label="Имя" placeholder="Как вас зовут?" value={form.name}
                       onChange={set('name')} error={errors.name} icon={<User size={16} />} required />
                     <Input label="Email" type="email" placeholder="you@example.com" value={form.email}
                       onChange={set('email')} error={errors.email} icon={<Mail size={16} />} required />
                     <Input label="Пароль" type="password" placeholder="Минимум 6 символов" value={form.password}
                       onChange={set('password')} error={errors.password} icon={<Lock size={16} />} required />
                     <Input label="Повторите пароль" type="password" placeholder="Введите пароль ещё раз" value={form.confirm}
                       onChange={set('confirm')} error={errors.confirm} icon={<Lock size={16} />} required />

                     <Button type="submit" fullWidth loading={loading} size="lg"
                       style={{ marginTop: 4, background: 'var(--green)', boxShadow: '0 0 20px rgba(34,211,165,0.3)' }}>Зарегистрироваться</Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}