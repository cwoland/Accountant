export default function Badge({ children, color = 'accent', size = 'md' }) {
  const colors = {
    accent: { bg: 'var(--accent-dim)', text: 'var(--accent-2)' },
    green:  { bg: 'var(--green-dim)',  text: 'var(--green)' },
    red:    { bg: 'var(--red-dim)',    text: 'var(--red)' },
    amber:  { bg: 'var(--amber-dim)',  text: 'var(--amber)' },
    muted:  { bg: 'var(--surface-2)', text: 'var(--text-2)' },
  };
  const c = colors[color] || colors.accent;
  const pad = size === 'sm' ? '2px 8px' : '4px 10px';
  const fs = size === 'sm' ? '0.7rem' : '0.75rem';

  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: pad, borderRadius: 99,
      fontSize: fs, fontWeight: 700,
      fontFamily: 'var(--font-display)',
      letterSpacing: '0.03em',
      display: 'inline-flex', alignItems: 'center', gap: 4,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}