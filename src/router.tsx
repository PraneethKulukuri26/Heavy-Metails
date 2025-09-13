import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import { AuthPage } from './pages/Auth';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}
