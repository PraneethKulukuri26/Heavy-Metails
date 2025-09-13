import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthPage } from './pages/Auth';
import '@/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

createRoot(container).render(
  <React.StrictMode>
    <AuthPage />
  </React.StrictMode>
);
