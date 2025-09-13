import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import '@/index.css';

import HMPIPage from './pages/HMPI';
import HomePage from './pages/Home';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/hmpi', element: <HMPIPage /> },
]);

createRoot(container).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
