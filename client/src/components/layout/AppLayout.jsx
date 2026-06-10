import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useIsMobile from '../../hooks/useIsMobile';

export default function AppLayout() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minHeight: '-webkit-fill-available',
        background: 'var(--bg)',
        position: 'relative',
      }}>
        <div className="mesh-bg"><span /><span /><span /></div>
        <Sidebar />
        <main style={{
          flex: 1,
          padding: '20px 16px 32px',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1,
        }}>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="mesh-bg"><span /><span /><span /></div>
      <Sidebar />
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
