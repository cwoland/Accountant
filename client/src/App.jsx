import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
       <Route path="*" element={<div style={{ color: 'white', padding:40 }}>Router works</div>} />
      </Routes>
    </BrowserRouter>
   );
}
