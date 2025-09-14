import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export default function App() {
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const theme = localStorage.getItem('theme');
      if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    };
    apply();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme') apply();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return (
    <div>
      {/* You can add a layout here, e.g., a navbar */}
      <Outlet />
    </div>
  );
}
