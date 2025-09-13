import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div>
      {/* You can add a layout here, e.g., a navbar */}
      <Outlet />
    </div>
  );
}
