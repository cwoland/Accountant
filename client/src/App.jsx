import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useStore from './store/useStore';
import LoginPage from './pages/auth/LoginPage';

function PrivateRoute({ children }) {
  const token = useStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const token = useStore((s) => s.token);
  return !token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
         <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
         <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}