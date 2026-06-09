import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
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
