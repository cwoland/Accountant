import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useSyncQueue     from './hooks/useSyncQueue';
import useStore         from './store/useStore';
import WakeUpBanner     from './components/ui/WakeUpBanner';
import InstallBanner    from './components/ui/InstallBanner';
import usePushListener  from './hooks/usePushListener';
import OnboardingWizard from './components/OnboardingWizard'; // ← новый

import LoginPage        from './pages/auth/LoginPage';
import RegisterPage     from './pages/auth/RegisterPage';
import DashboardPage    from './pages/DashboardPage';
import AccountsPage     from './pages/AccountsPage';
import TransactionsPage from './pages/TransactionsPage';
import MandatoryPage    from './pages/MandatoryPage';
import ProductsPage     from './pages/ProductsPage';
import DebtsPage        from './pages/DebtsPage';
import GoalsPage        from './pages/GoalsPage';
import ProfilePage      from './pages/ProfilePage';
import AiPage           from './pages/AiPage';
import AppLayout        from './components/layout/AppLayout';
import NotFoundPage     from './pages/NotFoundPage';
import Widget           from './pages/Widget';

function SyncManager() {
  useSyncQueue();
  return null;
}

function PrivateRoute({ children }) {
  const token = useStore((s) => s.token);
  const user  = useStore((s) => s.user);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <>
      {children}
      {user && user.onboardingCompleted === false && <OnboardingWizard />}
    </>
  );
}

function GuestRoute({ children }) {
  const token = useStore((s) => s.token);
  return !token ? children : <Navigate to="/" replace />;
}

export default function App() {
  usePushListener();
  return (
    <BrowserRouter>
      <SyncManager />
      <WakeUpBanner />
      <InstallBanner />
      <Routes>
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/"             element={<DashboardPage />} />
          <Route path="/accounts"     element={<AccountsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/mandatory"    element={<MandatoryPage />} />
          <Route path="/products"     element={<ProductsPage />} />
          <Route path="/debts"        element={<DebtsPage />} />
          <Route path="/goals"        element={<GoalsPage />} />
          <Route path="/ai"           element={<AiPage />} />
          <Route path="/profile"      element={<ProfilePage />} />
        </Route>

        <Route path="/widget" element={<Widget />} />
        <Route path="*"       element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
