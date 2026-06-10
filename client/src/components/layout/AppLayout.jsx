import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useIsMobile from '../../hooks/useIsMobile';

export default function AppLayout() {
  const isMobile = useIsMobile();

  return (
    <div className="app-shell" style={isMobile ? {
      display: 'flex', flexDirection: 'column',
      gridTemplateColumns: 'unset',
    } : {}}>
      <div className="mesh-bg"><span /><span /><span /></div>
      <Sidebar />
      {!isMobile && <Header />}
      <main className="main-content" style={isMobile ? {
        gridColumn: 'unset', maxHeight: 'unset',
        padding: '20px 16px', flex: 1,
      } : {}}>
        <Outlet />
      </main>
    </div>
  );
}