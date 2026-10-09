import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import SideNav from './SideNav';
import CaptureBar from './CaptureBar';
import styles from './AppShell.module.css';

export default function AppShell() {
  return (
    <div className={styles.app}>
      <TopBar />
      <CaptureBar />
      <SideNav />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}