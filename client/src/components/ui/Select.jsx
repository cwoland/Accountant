export default function Select({ label, value, onChange, options = [], error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{
          fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)',
          letterSpacing: '0.05em', textTransform: 'uppercase',
          fontFamily: 'var(--font-display)',
        }}>{label}</label>
      )}
      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          background: 'var(--surface)',
          border: `1px solid ${error ? 'var(--red)' : 'var(--border-2)'}`,
          borderRadius: 'var(--radius-m)',
          padding: '12px 14px',
          color: value ? 'var(--text-1)' : 'var(--text-3)',
          fontSize: '0.9rem',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235f5c7a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
          paddingRight: 36,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}
            style={{ background: 'var(--bg-3)', color: 'var(--text-1)' }}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</p>}
    </div>
  );
}