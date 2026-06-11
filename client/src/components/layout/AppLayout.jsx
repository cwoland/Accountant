import { useState, useLayoutEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
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
