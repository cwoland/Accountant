import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useStore from './store/useStore';

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
        <Route path="*" element={<div style={{ color: 'white', padding: 40 }}>Router + Store works</div>} />
      </Routes>
    </BrowserRouter>
  );
}