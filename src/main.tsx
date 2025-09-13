import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './router';
import '@/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

createRoot(container).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
