import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';

import './index.css';

import App from './App'; // Assuming App can be a layout
import { AuthPage } from './pages/Auth';
import HMPIPage from './pages/HMPI';
import HomePage from './pages/Home';
import ReportsPage from './pages/Reports';
import ScholarLookup from './pages/ScholarLookup';
import StateData from './pages/StateData';
import StateDetail from './pages/StateDetail';
import StatesIndex from './pages/StatesIndex';
import UserDashboard from './pages/UserDashboard';
import ExploreApprovedData from './pages/ExploreApprovedData';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

function NotFound() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
  { path: '/hmpi', element: <HMPIPage /> },
  { path: '/scholar-lookup', element: <ScholarLookup /> },
  { path: '/auth', element: <AuthPage /> },
      { path: '/states', element: <StatesIndex /> },
      { path: '/states/:slug', element: <StateDetail /> },
  { path: '/state-data', element: <StateData /> },
  { path: '/reports', element: <ReportsPage /> },
  { path: '/dashboard', element: <UserDashboard /> },
  { path: '/explore', element: <ExploreApprovedData /> },
  { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(container).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
