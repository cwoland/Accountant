export default function Loader({ size = 32, text }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16, padding: 40,
    }}>
      <div style={{
        width: size, height: size,
        border: '3px solid var(--surface-2)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {text && <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>{text}</p>}
    </div>
  );
}