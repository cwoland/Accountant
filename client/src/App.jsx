import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';

import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';
import DashboardPage      from './pages/DashboardPage';
import TransactionsPage   from './pages/TransactionsPage';
import MandatoryPage      from './pages/MandatoryPage';
import ProductsPage       from './pages/ProductsPage';
import ProfilePage        from './pages/ProfilePage';
import AiPage             from './pages/AiPage';
import AppLayout          from './components/layout/AppLayout';
import NotFoundPage       from './pages/NotFoundPage';
// import WakeUpBanner       from './components/ui/WakeUpBanner';
// import InstallBanner      from './components/ui/InstallBanner';

function PrivateRoute({ children }) {
  const token = useStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const token = useStore((s) => s.token);
  return !token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
     <Routes>
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
       <Route path="/"              element={<DashboardPage />} />
       <Route path="/transactions"  element={<TransactionsPage />} />
       <Route path="/mandatory"     element={<MandatoryPage />} />
       <Route path="/products"      element={<ProductsPage />} />
       <Route path="/ai"            element={<AiPage />} />
       <Route path="/profile"       element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
     </Routes>
    </BrowserRouter>
  );
}