import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import { AuthPage } from './pages/Auth';
import UserDashboard from './pages/UserDashboard';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/home" element={<HomePage />} />
  <Route path="/auth" element={<AuthPage />} />
  <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
