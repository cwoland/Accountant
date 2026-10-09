import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import AppShell from './components/shell/AppShell';
import CaptureSheet from './components/capture/CaptureSheet';
import ErrorBoundary from './components/ErrorBoundary';
import ServerWakeBanner from './components/ui/ServerWakeBanner';
import InstallBanner from './components/ui/InstallBanner';
import WallSkeleton from './components/wall/WallSkeleton';
import { useAuthStore } from './store/authStore';
import { useSyncQueue } from './hooks/useSyncQueue';
import { usePushListener } from './hooks/usePushListener';

// Код делится по маршрутам: recharts и framer-motion больше не едут
// в первый бандл. Главный сценарий — телефон в метро.
const WallPage         = lazy(() => import('./pages/WallPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const MandatoryPage    = lazy(() => import('./pages/MandatoryPage'));
const GoalsPage        = lazy(() => import('./pages/GoalsPage'));
const DebtsPage        = lazy(() => import('./pages/DebtsPage'));
const AccountsPage     = lazy(() => import('./pages/AccountsPage'));
const AiPage           = lazy(() => import('./pages/AiPage'));
const ProfilePage      = lazy(() => import('./pages/ProfilePage'));
const LoginPage        = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage     = lazy(() => import('./pages/auth/RegisterPage'));
const OnboardingPage   = lazy(() => import('./pages/OnboardingPage'));
const NotFoundPage     = lazy(() => import('./pages/NotFoundPage'));

function Background() {
  // Хуки, которым нужен роутер и которые ничего не рисуют.
  useSyncQueue();
  usePushListener();
  return null;
}

function RequireAuth() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!token) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  // Онбординг — отдельный маршрут, а не модалка поверх приложения:
  // так он переживает перезагрузку и имеет собственный адрес.
  if (user && !user.onboardingCompleted) return <Navigate to="/welcome" replace />;

  return <Outlet />;
}

function RequireGuest() {
  const token = useAuthStore((s) => s.token);
  return token ? <Navigate to="/" replace /> : <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Background />
        <ServerWakeBanner />
        <InstallBanner />

        <Suspense fallback={<WallSkeleton />}>
          <Routes>
            <Route element={<RequireGuest />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route index element={<WallPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="mandatory" element={<MandatoryPage />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="debts" element={<DebtsPage />} />
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="ai" element={<AiPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Онбординг без оболочки: своя раскладка на весь экран. */}
            <Route path="/welcome" element={<OnboardingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>

        {/* Лист записи доступен с любого экрана приложения. */}
        <CaptureSheet />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
