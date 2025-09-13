import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
 
import HMPIPAge from './pages/HMPI';
import HomePage from './pages/Home';
import './index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/hmpi', element: <HMPIPAge /> },
]);

createRoot(container).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
