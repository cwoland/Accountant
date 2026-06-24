import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, TrendingUp, Wallet, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginApi } from '../../api/auth';
import useStore from '../../store/useStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const features = [
    { icon: <Wallet size={20} />, title: 'Доходы и расходы', desc: 'Учёт транзакций' },
    { icon: <TrendingUp size={20} />, title: 'Аналитика', desc: 'Графики и динамика' },
    { icon: <PieChart size={20} />, title: 'Советник', desc: 'Умные рекомендации' },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const setAuth = useStore((s) => s.setAuth);
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.email) e.email = 'Введите Email';
        if (!form.password) e.password = 'Введите пароль';
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = async (e) => {
        if (loading) return; 
        
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const { data } = await loginApi(form);
            setAuth(data, data.token);
            toast.success(`С возвращением, ${data.name}!`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="mesh-bg">
                <span /><span /><span />
            </div>

            <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="auth-brand"
            style={{
                background: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '60px 52px',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
            }}>
                <div style={{
                    position: 'absolute', top: -80, right: -80,
                    width: 320, height: 320,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute', bottom: -60, left: -60,
                    width: 240, height: 240,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--green-dim) 0%, transparent 70%)',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
                        <div style={{
                            width: 44, height: 44,
                            background: 'var(--accent)',
                            borderRadius: 'var(--radius-m)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'var(--shadow-glow)',
                        }}>
                            <Wallet size={22} color="#fff" />
                        </div>
                        <span style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 800, fontSize: '1.4rem',
                            letterSpacing: '-0.03em',
                        }}>Accountant</span>
                    </div>

                    <h1 style={{ fontSize: '2.2rem', marginBottom: 16, lineHeight: 1.1 }}>
                        Контроль над<br />
                        <span style={{ color: 'var(--accent-2)' }}>финансами</span>
                    </h1>
                    <p style={{ color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 48, fontSize: '0.95rem' }}>
                        Отслеживай доходы и расходы и получай<br />умные советы по распределению.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {features.map((f, i) => (
                            <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                            >
                                <div style={{
                                    width: 40, height: 40,
                                    background: 'var(--accent-dim)',
                                    borderRadius: 'var(--radius-s)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--accent-2)', flexShrink: 0,
                                }}>{f.icon}</div>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.title}</p>
                                    <p style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px 32px', position: 'relative', zIndex: 1,
            }}>
                <div style={{ width: '100%', maxWidth: 400 }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Вход</h2>
                    <p style={{ color: 'var(--text-2)', marginBottom: 36, fontSize: '0.9rem' }}>
                        Нет аккаунта?{' '}
                        <Link to="/register" style={{ color: 'var(--accent-2)', fontWeight: 600 }}>
                        Зарегистрироваться</Link>
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        error={errors.email}
                        icon={<Mail size={16} />}
                        required
                        />
                        <Input
                        label="Пароль"
                        type="password"
                        placeholder="Минимум 8 символов"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        error={errors.password}
                        icon={<Lock size={16} />}
                        required />

                        <Button type="submit" fullWidth loading={loading} size="lg">Войти</Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}