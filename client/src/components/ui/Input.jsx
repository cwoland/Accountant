import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
    label, type = 'text', placeholder, value,
    onChange, error, icon, hint, required,
}) {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (show ? 'text' : 'password') : type;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {label && (
                <label style={{
                    fontSize: '0.8rem', fontWeight: 600,
                    color: 'var(--text-2)', letterSpacing: '0.05em',
                    textTransform: 'uppercase', fontFamily: 'var(--font-display)',
                }}>
                    {label}{required && <span style={{ color: 'var(--accent-2)' }}> *</span>}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                {icon && (
                    <span style={{
                        position: 'absolute', left: 14, top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--text-3)',
                        display: 'flex', alignItems: 'center',
                    }}>{icon}</span>
                )}
                <input
                type={inputType}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                style={{
                    width: '100%',
                    background: 'var(--surface)',
                    border: `1px solid ${error ? 'var(--red)' : 'var(--border-2)'}`,
                    borderRadius: 'var(--radius-m)',
                    padding: icon ? '12px 14px 12px 42px' : '12px 14px',
                    paddingRight: isPassword ? 42 : 14,
                    color: 'var(--text-1)',
                    fontSize: '0.9rem',
                    transition: 'var(--transition)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border-2)'}
                />
                {isPassword && (
                    <button
                    type="button"
                    onClick={() => setShow(!show)}
                    style={{
                        position: 'absolute', right: 14, top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--text-3)',
                        display: 'flex', alignItems: 'center',
                    }}
                    >
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
            {error && <p style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</p>}
            {hint && !error && <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{hint}</p>}
            </div>
    );
}